import LogHandler from "./log-handler.mjs";
import fs from 'fs-extra'

/**
 * FilesystemHandler
 *
 * Responsible for preparing and maintaining the public filesystem layout
 * used by the audio tools server. This includes ensuring a minimal
 * directory tree exists under the configured public root.
 *
 * The implementation intentionally keeps behavior synchronous for the
 * file-system operations (using `fs-extra` sync methods) to preserve
 * the original behavior.
 */
export default class FilesystemHandler {
    /**
     * Create the FilesystemHandler
     *
     * @param {Object} config - Configuration object read from dotenv or similar.
     * @param {string} [config.PUBLIC_DIR] - Optional path to the public directory. Defaults to './public'.
     * @param {LogHandler} [logHandler] - Optional logger instance. If omitted a new LogHandler will be created.
     */
    constructor(config, logHandler = new LogHandler()) {
        /** @type {LogHandler} */
        this.logHandler = logHandler;
        /** @type {Object} */
        this.config = config;
        /** @type {string} */
        this.publicRoot = !!config.PUBLIC_DIR ? config.PUBLIC_DIR : './public'
        /**
         * treeMap describes the minimal directory structure to ensure
         * inside the public directory. Keys map to folders; `null` means
         * a plain folder while an object describes nested folders.
         * @type {Object}
         */
        this.treeMap = {
            "js": null,
            "css": null,
            "classes": null,
            "plugins": {
                "audio": null,
                "midi": null
            }
        }
    }

    /**
     * Initialize filesystem handler (convenience wrapper).
     * Calls {@link BuildFSTree} to ensure the public directory layout exists.
     *
     * @returns {void}
     */
    Init() {
        this.BuildFSTree();
    }

    /**
     * Recursively create relative path strings from a nested tree map.
     *
     * This is a small helper used by {@link BuildFSTree} to flatten the
     * `treeMap` into an array of relative directory paths.
     *
     * @param {Object} obj - Nested object describing directories.
     * @param {string} [basePath=''] - Base path used during recursion.
     * @private
     * @returns {string[]} Array of relative path strings (e.g. ['plugins', 'plugins/audio']).
     */
    _createRelativePaths(obj, basePath = '') {
        const result = [];
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = basePath ? `${basePath}/${key}` : key;
            result.push(currentPath);
            if (value && typeof value === 'object') {
                result.push(...this._createRelativePaths(value, currentPath));
            }
        }

        return result;
    }

    /**
     * Ensure the directory tree exists under the configured public root.
     *
     * Uses synchronous `fs-extra` helpers to empty the public folder and
     * recreate the required subdirectories specified in {@link treeMap}.
     * Errors are logged via the configured {@link LogHandler}.
     *
     * @returns {Promise<void>} Resolves when the operation completes.
     */
    async BuildFSTree() {
        try {
            let t = this.treeMap;
            let c = this.config;
            var pub = !!c.PUBLIC_DIR ? c.PUBLIC_DIR : './public';
            fs.emptyDirSync(pub);
            this._createRelativePaths(this.treeMap).forEach(fp => {
                fs.ensureDirSync(pub + '/'+fp);
            })
            console.log("public directory tree ensured..")
        }
        catch (err) {
            this.logHandler.writeLog(err);
        }
    }

}