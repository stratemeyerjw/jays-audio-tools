import dotenv from 'dotenv';
import AudioToolsServer from './classes/audio-tool-server.mjs';


const c = dotenv.config().parsed || {
    PUBLIC_DIR: './public',
    CLIENT_DEPS: './client-deps.json',
    PORT: 3000

};
c.PORT = !!c.PORT? c.PORT:3000;

const audiotToolServer = new AudioToolsServer(c);
audiotToolServer.expressServer.StartServer();

