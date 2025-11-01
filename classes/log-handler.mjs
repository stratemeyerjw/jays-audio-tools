import fs from 'fs-extra';
import { v4 as uuidV4 } from 'uuid';
import path from 'path';



export default class LogHandler {
    constructor(logDir = './logs') {
        this.rootDir = logDir;
        this.currentLogFileName = null;
        this.currentFullPath = null;
        this.logCache = [];
        this.maxLogsPerFile = 50;
        this.debugModeActive = false;
    }

    async Init() {
        await fs.ensureDir(this.rootDir);
        this._generateFileName();
    }
    ToggleDebugMode(){
        this.debugModeActive = !this.debugModeActive?true:false;
    }

    /**
     * Adds a log entry to the cache and saves periodically
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
     * Writes cached logs to the current JSON file
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
     * Force flush pending logs to disk
     */
    async flush() {
        await this._save();
    }
}
