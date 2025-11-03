import ExpressServer from './express-server.mjs';
import LogHandler from './log-handler.mjs';
import ClientDepHandler from './client-dep-handler.mjs';
import FilesystemHandler from './filesystem-handler.mjs';


export default class AudioToolsServer {
    constructor(config, expressServer = null, logHandler = null, clientDepHandler = null, filesystemHandler = null) {
        this.config = config;
        this.logHandler = logHandler || new LogHandler();
        this.fileSystemHandler = filesystemHandler || new FilesystemHandler(this.config, this.logHandler);
        this.clientDepHandler = clientDepHandler || new ClientDepHandler(this.logHandler);
        this.expressServer = expressServer || new ExpressServer(this.config, this.logHandler, this.fileSystemHandler);
    }
    async Init() {
        try {
            if (!!this.config.DEBUG_MODE) this.logHandler.ToggleDebugMode();
            await this.logHandler.Init();
            await this.fileSystemHandler.BuildFSTree();
            await this.clientDepHandler.RefreshPartials();
            this.clientDepHandler.RefreshClientApp();
            this.expressServer.StartServer();
        }
        catch (err) {
            this.logHandler.writeLog(err);
        }
    }
}
