import LogHandler from './classes/server-side/log-handler.mjs';
import ClientDepHandler from './classes/server-side/client-dep-handler.mjs';
import FilesystemHandler from './classes/server-side/filesystem-handler.mjs';
import fs from 'fs-extra';
import dotenv from 'dotenv';


const c = dotenv.config().parsed || {};

c.PORT = !!c.PORT? c.PORT:3000;
c.PUBLIC_DIR = !!c.PUBLIC_DIR?c.PUBLIC_DIR: './public';
c.CLIENT_DEPS= !!c.CLIENT_DEPS?c.CLIENT_DEPS: './client-deps.json';
if(!fs.existsSync(c.CLIENT_DEPS)) {
    fs.writeJSONSync(c.CLIENT_DEPS, []);
    logHandler.writeLog(c.CLIENT_DEPS + ' not found, creating default json file now...');
}
if(!fs.existsSync(c.PUBLIC_DIR)){
    fs.ensureDirSync(c.PUBLIC_DIR);
    logHandler.writeLog(c.PUBLIC_DIR + " not found, creating directory now...");
}
const logHandler = new LogHandler();
logHandler.debugModeActive = true;
const filesystemHandler = new FilesystemHandler(c, logHandler);
const clientDepHandler = new ClientDepHandler(logHandler);

async function build(){
    try{
        await logHandler.Init();
        await filesystemHandler.BuildFSTree();
        await clientDepHandler.RefreshPartials();
        clientDepHandler.RefreshClientApp();
        logHandler.writeLog("Build Finished at " + new Date().toLocaleString());
    }
    catch(err)
    {logHandler.writeLog(err)}
}
build();
