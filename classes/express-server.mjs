import express from 'express';
import cors from 'cors';
import FilesystemHandler from './filesystem-handler.mjs';
import LogHandler from './log-handler.mjs';

/**
 * ExpressServer
 *
 * Lightweight wrapper around an Express application used by Jay's Audio Tools.
 * Provides a minimal setup: CORS, static file serving and a convenience method to
 * start the HTTP server.
 *
 * NOTE: The exported class name was previously misspelled as `ExpressSever`.
 * The class is exported as the default export; updating the internal class
 * name to `ExpressServer` improves readability without changing external
 * behavior.
 *
 * @example
 * const server = new ExpressServer(config);
 * server.StartServer();
 */
export default class ExpressServer {
    /**
    * Create the ExpressServer wrapper.
     *
     * @param {Object} config - Configuration object.
     * @param {number|string} config.PORT - Port to listen on (e.g. 3000).
     * @param {string} [config.PUBLIC_DIR] - Path to static public directory (not currently used by code; default is './public').
     * @param {LogHandler} [logHandler=null] - Optional LogHandler instance. If omitted, a new LogHandler will be created.
     * @param {FilesystemHandler} [filesystemHandler=null] - Optional FilesystemHandler instance. If omitted, a new FilesystemHandler will be created.
     */
    constructor(config, logHandler = null, filesystemHandler = null) {
        this.config = config;
        /** @type {LogHandler} */
        this.logHandler = logHandler || new LogHandler();
        /** @type {FilesystemHandler} */
        this.fsHandler = filesystemHandler || new FilesystemHandler(this.config, this.logHandler);
        /** @type {import('express').Express} */
        this.app = express();
    }

    /**
     * Attach standard middleware to the Express app.
     * Currently enables CORS for all origins and serves static files from `./public`.
     *
     * This method swallows errors by logging them through the configured `LogHandler`.
     *
     * @returns {void}
     */
    LoadMiddleware() {
        try {
            // Allow all CORS origins. Consider tightening this in production.
            this.app.use(cors('*'));
            // Serve static files. The code uses a hard-coded path for now to
            // stay compatible with existing behavior.
            this.app.use('/', express.static('./public'));
        } catch (err) {
            this.logHandler.writeLog(err);
        }
    }

    /**
     * Start the HTTP server using Express.
     * Loads middleware first, then starts listening on `config.PORT`.
     * Any server-start messages are written via the configured `LogHandler`.
     *
     * @returns {void}
     */
    StartServer() {
        this.LoadMiddleware();
        this.app.listen(this.config.PORT, () => {
            this.logHandler.writeLog(`Audio Tool Server Running: http://localhost:${this.config.PORT}`);
        });
    }
}