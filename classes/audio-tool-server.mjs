import ExpressServer from './express-server.mjs';
import LogHandler from './log-handler.mjs';
import ClientDepHandler from './client-dep-handler.mjs';
import FilesystemHandler from './filesystem-handler.mjs';
export default class AudioToolsServer {
    constructor(config, expressServer = null, logHandler = null, clientDepHandler = null, filesystemHandler = null){
        this.config = config;
        this.logHandler = logHandler||new LogHandler();
        if(!!this.config.DEBUG_MODE)this.logHandler.ToggleDebugMode();
        this.logHandler.Init();
        this.fileSystemHandler = filesystemHandler||new FilesystemHandler(this.config,this.logHandler);
        
        this.fileSystemHandler.BuildFSTree();
        this.clientDepHandler = clientDepHandler|| new ClientDepHandler(this.logHandler);
        this.clientDepHandler.Refresh();
        this.expressServer = expressServer||new ExpressServer(this.config, this.logHandler, this.fileSystemHandler);
    }
}
