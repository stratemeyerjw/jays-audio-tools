/**
 * ClientPlugin
 *
 * Base class for client-side plugin objects. Subclasses (AudioPlugin,
 * MidiPlugin) extend this with transport-specific inputs/outputs.
 *
 * Instances are lightweight descriptors and may be attached to the
 * `window.Plugins` registry by the bundler/runtime.
 */
class ClientPlugin{
    /**
     * Create a ClientPlugin descriptor.
     *
     * @param {string} [title='unknown client plugin'] - Human readable title for the plugin.
     * @param {string} [description=''] - Short description used by UI or docs.
     * @param {string} [category='unknown'] - Optional category label (currently unused but reserved for future grouping).
     */
    constructor(title='unknown client plugin', description = '', category = 'unknown'){
        /** @type {string} */
        this.title = title;
        /** @type {string} */
        this.description = description;
        /** @type {string} */
        this.category = category;
    }

    /**
     * Initialize the plugin instance.
     *
     * Intended to be overridden by subclasses that need to perform setup
     * (e.g. wire audio nodes, attach event listeners). The base
     * implementation is a no-op to preserve backwards compatibility.
     *
     * @returns {void}
     */
    Init(){}

}

/**
 * AudioPlugin
 *
 * Represents a simple audio plugin that expects audio input and output
 * handles (the actual shape of these handles is project-specific).
 */
class AudioPlugin extends ClientPlugin{
    /**
     * @param {*} audioInput - Audio input handle (e.g. MediaStream, AudioNode, device id)
     * @param {*} audioOutput - Audio output handle (e.g. destination node or element)
     */
    constructor(audioInput, audioOutput){
        super();
        /** @type {*} */
        this.audioInput = audioInput;
        /** @type {*} */
        this.audioOutput = audioOutput; 
    }
}

/**
 * MidiPlugin
 *
 * Represents a MIDI plugin that expects MIDI input/output handles.
 */
class MidiPlugin extends ClientPlugin {
    /**
     * @param {*} midiInput - MIDI input handle (e.g. WebMIDI input port)
     * @param {*} midiOutput - MIDI output handle (e.g. WebMIDI output port)
     */
    constructor(midiInput, midiOutput){
        super();
        /** @type {*} */
        this.midiInput = midiInput;
        /** @type {*} */
        this.midiOutput = midiOutput;
    }
}

if(typeof window !== "undefined"){
    window.Plugins = {ClientPlugin,AudioPlugin,MidiPlugin};
}
export default {ClientPlugin,AudioPlugin,MidiPlugin};
