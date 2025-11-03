import fs from 'fs-extra';
import path from 'path';
import LogHandler from './log-handler.mjs';

/**
 * ClientDepHandler
 *
 * Responsible for loading client-side dependencies defined in a
 * `client-deps.json` file and injecting the corresponding script tags
 * into an HTML page (`index.html` by default). The class also copies
 * client dependency files into the configured public folder paths.
 *
 * Usage:
 * ```js
 * const h = new ClientDepHandler();
 * h.Refresh();
 * ```
 */
export default class ClientDepHandler{
 /**
  * Create a handler for client dependencies.
  *
  * @param {LogHandler|null} [logHandler=null] - Optional logger; a new LogHandler will be used when omitted.
  * @param {string} [pathToClientDepJson='./client-deps.json'] - Path to the JSON file describing client dependencies.
  * @param {string} [pathToHtmlPage='./index.html'] - Path to the HTML page to inject script tags into.
  */
 constructor(logHandler = null, pathToClientDepJson = './client-deps.json', pathToHtmlPage='./index.html'){
    /** @type {LogHandler} */
    this.logHandler = logHandler || new LogHandler();
    /** @type {string} Absolute path to the HTML page used for injection */
    this.pathToHtmlPage = path.resolve(pathToHtmlPage);
    /** @type {string} Absolute path to the client deps JSON */
    this.depPath = path.resolve(pathToClientDepJson);
    /** @type {Buffer|string} Raw HTML page content read from disk */
    this.htmlPage = fs.readFileSync(this.pathToHtmlPage);
    /**
     * Array of dependency descriptors. Each entry is expected to be an
     * object with `src` and `dest` properties.
     * @type {Array<{src:string,dest:string}>}
     */
    this.deps = !!fs.existsSync(this.depPath)?fs.readJSONSync(this.depPath):[];
    if(this.deps.length < 1) fs.writeJSONSync(this.depPath, []);

 }

 /**
  * Refresh client dependencies.
  *
  * This method reads the configured `client-deps.json`, copies each
  * dependency file from `src` to `dest`, injects a script tag into the
  * HTML head for each dependency, and writes the resulting HTML to
  * `./public/index.html`.
  *
  * Errors encountered while copying or injecting a specific dependency
  * are logged and the process continues with the next dependency.
  *
  * @returns {void}
  */
 RefreshClientApp(){
     try{


         const clientDeps = this.deps;
         this.htmlPage = fs.readFileSync(this.pathToHtmlPage);
         for(let i = 0; i < clientDeps.length; i++){
             try{
                 const src = clientDeps[i].src;
                 const dest = clientDeps[i].dest;
             fs.copyFileSync(src, dest);
             let mime = dest.split('.')[dest.split('.').length -1].toLowerCase();

             this.htmlPage = mime !=="css"? this.htmlPage.toString().replace("</head>", 
`     <script src="${dest.replace('./public/','')}"></script>
</head>

                `):
                this.htmlPage.toString().replace("</head>", 
`     <link rel="stylesheet" href="${dest.replace('./public/','')}">
</head>

                `);

             this.logHandler.writeLog(`
 client dependency loaded:
      src: ${src}
     dest: ${dest}
`);
             }catch(error){
                this.logHandler.writeLog(error);
                 continue;
             }
         }
         fs.writeFileSync('./public/index.html', this.htmlPage, "utf-8");
     }
     catch(err){this.logHandler.writeLog(err)}
 }
 async RefreshPartials(){
        try {
            const srcDir = './client-partials';
            const destDir = './public/partials';
            await fs.ensureDir(srcDir);
            // Read all files in srcDir
            const files = fs.readdirSync(srcDir);
            for (const file of files) {
                try{
                if (file.endsWith('.hbs')) {
                    const srcFile = path.join(srcDir, file);
                    const destFile = path.join(destDir, file);
                    fs.copyFileSync(srcFile, destFile);
                    this.logHandler.writeLog(`
client hbs depencency loaded: 
     src:  ${srcFile}
    dest: ${destFile}
`);
                }
            }catch(error){
                this.logHandler.writeLog(error);
                continue}
            }
        } catch (err) {
            this.logHandler.writeLog(err);
        }
    }
}
