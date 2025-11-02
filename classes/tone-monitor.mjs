// ES class: mic tone monitor → nearest musical note (with cents offset)
// - Uses Web Audio API + autocorrelation pitch detection
// - Emits updates via onUpdate({ hz, note, midi, cents, clarity, running })

/**
 * ToneMonitor
 *
 * Lightweight microphone pitch monitor. It uses the Web Audio API to read
 * the input waveform and a simple autocorrelation-based pitch estimator to
 * find the predominant pitch. On each update interval it calls the
 * `onUpdate` callback with a payload describing the detected pitch and
 * confidence.
 *
 * Example update payload: { hz, note, midi, cents, clarity, rms, running }
 */
class ToneMonitor {
  /**
   * @param {Object} [opts={}] - Options object
   * @param {function(Object):void} [opts.onUpdate] - Callback invoked on each update with the payload described above.
   * @param {number} [opts.minHz=50] - Minimum frequency to detect.
   * @param {number} [opts.maxHz=2000] - Maximum frequency to detect.
   * @param {number} [opts.rmsGate=0.01] - Minimum RMS energy to consider the signal valid.
   * @param {number} [opts.clarityGate=0.75] - Minimum clarity (0..1) required to accept a pitch.
   * @param {number} [opts.updateHz=30] - How many updates per second to emit to the callback.
   */
  constructor({
    onUpdate = () => {},
    minHz = 50,
    maxHz = 2000,
    rmsGate = 0.01,       // ignore very quiet input
    clarityGate = 0.75,   // require decent periodicity
    updateHz = 30         // UI update rate
  } = {}) {
    /** @type {function(Object):void} */
    this.onUpdate = onUpdate;
    /** @type {number} */
    this.minHz = minHz;
    /** @type {number} */
    this.maxHz = maxHz;
    /** @type {number} */
    this.rmsGate = rmsGate;
    /** @type {number} */
    this.clarityGate = clarityGate;
    /** @type {number} milliseconds between updates */
    this.updateInterval = 1000 / updateHz;

    // Internal runtime state
    /** @type {AudioContext|null} */ this._ctx = null;
    /** @type {AnalyserNode|null} */ this._an = null;
    /** @type {Float32Array|null} */ this._buf = null;
    /** @type {number} requestAnimationFrame id */ this._raf = 0;
    /** @type {boolean} */ this._running = false;
    /** @type {number} timestamp of last emit */ this._lastEmit = 0;
  }

  /** Read-only running state */
  get running() { return this._running; }

  /**
   * Start monitoring the microphone. Prompts the user for microphone
   * permission if needed. Once started, the monitor will call `onUpdate`
   * at the configured rate until `stop()` is called.
   *
   * @returns {Promise<void>}
   */
  async start() {
    if (this._running) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false
      }
    });

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);

    const an = ctx.createAnalyser();
    an.fftSize = 2048;
    an.smoothingTimeConstant = 0; // raw waveform
    src.connect(an);

    this._ctx = ctx;
    this._an = an;
    this._buf = new Float32Array(an.fftSize);
    this._running = true;
    this._stream = stream;

    const loop = (t) => {
      if (!this._running) return;
      an.getFloatTimeDomainData(this._buf);

      const sampleRate = ctx.sampleRate;
      const { hz, clarity, rms } = autocorrelate(this._buf, sampleRate, this.minHz, this.maxHz);

      if (t - this._lastEmit >= this.updateInterval) {
        if (rms >= this.rmsGate && clarity >= this.clarityGate && hz > 0) {
          const midi = Math.round(69 + 12 * Math.log2(hz / 440));
          const noteHz = 440 * Math.pow(2, (midi - 69) / 12);
          const cents = 1200 * Math.log2(hz / noteHz);

          this.onUpdate({
            hz,
            note: midiToNote(midi),
            midi,
            cents,       // negative = flat, positive = sharp
            clarity,     // 0..1 (higher = cleaner pitch)
            rms,
            running: true
          });
        } else {
          this.onUpdate({ hz: 0, note: null, midi: null, cents: null, clarity, rms, running: true });
        }
        this._lastEmit = t;
      }

      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  /**
   * Stop monitoring, release media tracks and close the audio context.
   *
   * @returns {Promise<void>}
   */
  async stop() {
    if (!this._running) return;
    cancelAnimationFrame(this._raf);
    this._raf = 0;
    this._an?.disconnect?.();
    await this._ctx?.close?.();
    this._stream?.getTracks?.().forEach(t => t.stop());
    this._ctx = this._an = this._buf = this._stream = null;
    this._running = false;
    this.onUpdate({ running: false });
  }
}

// ---------- helpers ----------

/**
 * Musical note names used by `midiToNote`.
 * @type {string[]}
 */
const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

/**
 * Convert a MIDI note number to a human-friendly note name (e.g. 69 -> A4).
 * @param {number} midi - MIDI note number
 * @returns {string}
 */
function midiToNote(midi) {
  const name = NOTE_NAMES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${name}${oct}`;
}

/**
 * Autocorrelation (AMDF-enhanced) pitch estimator.
 * Returns { hz, clarity (0..1), rms }.
 * - clarity is normalized inverse error; closer to 1 is cleaner pitch.
 *
 * @param {Float32Array} buf - Time-domain audio buffer
 * @param {number} sampleRate - Audio sample rate (Hz)
 * @param {number} minHz - Minimum frequency to consider
 * @param {number} maxHz - Maximum frequency to consider
 * @returns {{hz:number,clarity:number,rms:number}}
 */
function autocorrelate(buf, sampleRate, minHz, maxHz) {
  const n = buf.length;

  // Simple DC offset removal + RMS
  let rms = 0, mean = 0;
  for (let i = 0; i < n; i++) mean += buf[i];
  mean /= n;
  const centered = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const v = buf[i] - mean;
    centered[i] = v;
    rms += v * v;
  }
  rms = Math.sqrt(rms / n);

  // If signal is too quiet, bail early
  if (rms < 1e-4) return { hz: 0, clarity: 0, rms };

  // Lag bounds from Hz range
  const maxLag = Math.floor(sampleRate / minHz);
  const minLag = Math.max(2, Math.floor(sampleRate / maxHz));
  const last = n - maxLag - 2;
  if (last <= 0) return { hz: 0, clarity: 0, rms };

  // Center-clipped to reduce formant bias
  let clipLevel = 0.0;
  for (let i = 0; i < n; i++) clipLevel = Math.max(clipLevel, Math.abs(centered[i]));
  clipLevel *= 0.5;
  for (let i = 0; i < n; i++) {
    const a = centered[i];
    centered[i] = Math.abs(a) >= clipLevel ? a : 0;
  }

  // Autocorrelation
  const ac = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < last; i++) sum += centered[i] * centered[i + lag];
    ac[lag] = sum;
  }

  // Find peak after first valley
  let peakLag = -1, peakVal = -Infinity;
  let passedValley = false, prev = ac[minLag];
  for (let lag = minLag + 1; lag <= maxLag; lag++) {
    const v = ac[lag];
    if (!passedValley && v < prev) passedValley = true;
    if (passedValley && v > peakVal) { peakVal = v; peakLag = lag; }
    prev = v;
  }
  if (peakLag < 0) return { hz: 0, clarity: 0, rms };

  // Parabolic interpolation around peak (sub-sample accuracy)
  const x0 = ac[peakLag - 1] ?? ac[peakLag];
  const x1 = ac[peakLag];
  const x2 = ac[peakLag + 1] ?? ac[peakLag];
  const denom = (x0 - 2 * x1 + x2);
  const delta = denom !== 0 ? 0.5 * (x0 - x2) / denom : 0;
  const refinedLag = Math.max(minLag, Math.min(maxLag, peakLag + delta));

  const hz = sampleRate / refinedLag;

  // Normalize clarity: compare peak to zero-lag power
  let power = 0;
  for (let i = 0; i < last; i++) power += centered[i] * centered[i];
  const clarity = power > 0 ? Math.max(0, Math.min(1, (x1 / power))) : 0;

  if (hz < minHz || hz > maxHz || !Number.isFinite(hz)) return { hz: 0, clarity: 0, rms };
  return { hz, clarity, rms };
}

function clientCheck()
{
  if(typeof window !== "undefined"){
  window.ToneMonitor = ToneMonitor;
 
  }
}



// ---------- usage example ----------
// const monitor = new ToneMonitor({
//   onUpdate: ({ hz, note, cents, clarity, running }) => {
//     if (!running || !note) return;
//     console.log(`${hz.toFixed(2)} Hz → ${note} (${cents.toFixed(1)} cents), clarity ${clarity.toFixed(2)}`);
//   },
//   minHz: 60,
//   maxHz: 1200
// });
// await monitor.start();
// ... later: await monitor.stop();
