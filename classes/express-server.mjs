import express from 'express';
import cors from 'cors';
import FilesystemHandler from './filesystem-handler.mjs';
import LogHandler from './log-handler.mjs';

export default class ExpressSever {
    constructor(config,logHandler = null, filesystemHandler= null) {
        this.config = config;
        this.logHandler = logHandler||new LogHandler();
        this.fsHandler = filesystemHandler || new FilesystemHandler(this.config, this.logHandler);
        this.app = express();
        
    }
    LoadMiddleware() {
       try {
        this.app.use(cors('*'));
        this.app.use('/', express.static('./public'));
       }catch(err){
        this.logHandler.writeLog(err);
       }
    }
    StartServer(){
    this.LoadMiddleware();
    this.app.listen(this.config.PORT, ()=>{
        this.logHandler.writeLog(`Audio Tool Server Running: http://localhost:${this.config.PORT}`)
    })
    }
}