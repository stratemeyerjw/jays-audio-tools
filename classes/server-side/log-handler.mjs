import fs from 'fs-extra';
import { v4 as uuidV4 } from 'uuid';
import path from 'path';


/**
 * LogHandler
 *
 * Simple JSON file-based logger used by the audio tools server. Logs are
 * buffered in memory and flushed to disk periodically to avoid excessive
 * I/O. Files are rotated when they grow beyond `maxLogsPerFile` entries.
 *
 * This class uses `fs-extra` for convenience and preserves asynchronous
 * behavior for disk writes.
 */
export default class LogHandler {
    /**
     * @param {string} [logDir='./logs'] - Directory where JSON log files will be stored.
     */
    constructor(logDir = './logs') {
        /** @type {string} Directory to store log files */
        this.rootDir = logDir;
        /** @type {string|null} Current log filename (e.g. 'uuid.json') */
        this.currentLogFileName = null;
        /** @type {string|null} Full path to the current log file */
        this.currentFullPath = null;
        /** @type {Array<Object>} In-memory cache of pending log entries */
        this.logCache = [];
        /** @type {number} Maximum number of entries per log file before rotation */
        this.maxLogsPerFile = 50;
        /** @type {boolean} When true, log messages are also printed to console */
        this.debugModeActive = false;
    }

    /**
     * Initialize the handler by ensuring the log directory exists and
     * generating an initial log filename.
     *
     * @returns {Promise<void>}
     */
    async Init() {
        await fs.ensureDir(this.rootDir);
        this._generateFileName();
    }

    /**
     * Toggle debug mode. When active, `writeLog` will also print entries to the console.
     *
     * @returns {void}
     */
    ToggleDebugMode(){
        this.debugModeActive = !this.debugModeActive?true:false;
    }

    /**
     * Adds a log entry to the cache and saves periodically.
     * The `entry` argument may be any object; the handler augments it with
     * an `id` and `timestamp`.
     *
     * @param {Object} entry - Arbitrary log payload (will be merged into stored entry).
     * @returns {Promise<void>}
     */
    async writeLog(entry) {
        if(this.debugModeActive){
            console.log(entry);
        }
        const logEntry = {
            id: uuidV4(),
            timestamp: new Date().toISOString(),
            ...entry
        };

        this.logCache.push(logEntry);

        if (this.logCache.length >= 10) { // flush threshold
            await this._save();
        }
    }

    /**
     * Writes cached logs to the current JSON file. Old file contents are
     * preserved and concatenated with the in-memory cache. If the old file
     * exceeds `maxLogsPerFile`, a new file is generated.
     *
     * @private
     * @returns {Promise<void>}
     */
    async _save() {
        try {
            if (this.logCache.length < 1) return;

            await fs.ensureDir(this.rootDir);

            let oldCache = [];
            if (await fs.pathExists(this.currentFullPath)) {
                oldCache = await fs.readJSON(this.currentFullPath);
            }

            // rotate file if too large
            if (oldCache.length > this.maxLogsPerFile) {
                oldCache = [];
                this._generateFileName();
            }

            const saveData = [...oldCache, ...this.logCache];
            await fs.writeJSON(this.currentFullPath, saveData, { spaces: 2 });

            this.logCache.length = 0;
        } catch (err) {
            console.error('LogHandler._save error:', err);
        }
    }

    /**
     * Generate a new filename for the current log file and update internal
     * path references.
     *
     * @private
     * @returns {void}
     */
    _generateFileName() {
        try {
            const id = uuidV4();
            this.currentLogFileName = `${id}.json`;
            this.currentFullPath = path.join(this.rootDir, this.currentLogFileName);
        } catch (err) {
            console.error('LogHandler._generateFileName error:', err);
        }
    }

    /**
     * Force flush pending logs to disk immediately.
     *
     * @returns {Promise<void>}
     */
    async flush() {
        await this._save();
    }
}
