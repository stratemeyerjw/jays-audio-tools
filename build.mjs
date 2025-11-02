import LogHandler from './classes/log-handler.mjs';
import ClientDepHandler from './classes/client-dep-handler.mjs';
import FilesystemHandler from './classes/filesystem-handler.mjs';
import dotenv from 'dotenv';

const c = dotenv.config().parsed || {
    PUBLIC_DIR: './public',
    CLIENT_DEPS: './client-deps.json',
    PORT: 3000

};
c.PORT = !!c.PORT? c.PORT:3000;

const logHandler = new LogHandler();
logHandler.debugModeActive = true;
const filesystemHandler = new FilesystemHandler(c, logHandler);
const clientDepHandler = new ClientDepHandler(logHandler);

async function build(){
    try{
        await filesystemHandler.BuildFSTree();
        await clientDepHandler.RefreshPartials();
        clientDepHandler.Refresh();
        logHandler.writeLog("Build Finished at " + new Date().toLocaleString());
    }
    catch(err)
    {logHandler.writeLog(err)}
}
build();
