/**
 * ClientApp
 *
 * Minimal client application bootstrap used by the public-facing pages.
 * This class implements a very small lifecycle: a singleton-style
 * instance with an `Init` method that sets an `initialized` flag and
 * performs basic startup actions.
 *
 * The module also attaches a global `app` instance to `window` and
 * calls `Init()` once the DOM is ready (via jQuery shorthand).
 */
class ClientApp{
    /**
     * Construct the ClientApp singleton.
     * If an instance already exists on the class, the constructor returns
     * that existing instance (singleton pattern).
     */
    constructor(){
        if(!!ClientApp.instance) return ClientApp.instance;
        /** @type {boolean} True when the app has completed initialization. */
        this.appRouter = null;
        this.logHandler = null;
        this.initialized = false;
    }

    /**
     * Initialize the client app.
     *
     * The method is idempotent and will return early when `this.initialized`
     * is truthy. Errors during initialization set `initialized` to `false`
     * and are logged to the console.
     *
     * @returns {Promise<void>} Resolves when initialization completes.
     */
    async Init(){
        try{
            if(this.initialized)return;
            this.initialized = true;
            this.logHandler = new ClientAppLogHandler();
            this.appRouter = new ClientAppRouter();
           
            this.logHandler.writeLog("Client App Initialized")
        }catch(err){
            this.initialized = false;
           this.logHandler.writeLog(err);
        }
    }

} 