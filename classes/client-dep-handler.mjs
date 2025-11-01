import fs from 'fs-extra';
import path from 'path';
import LogHandler from './log-handler.mjs';
export default class ClientDepHandler{
 constructor(logHandler = null, pathToClientDepJson = './client-deps.json', pathToHtmlPage='./index.html'){
    this.logHandler = logHandler || new LogHandler();
    this.pathToHtmlPage = path.resolve(pathToHtmlPage);
    this.depPath = path.resolve(pathToClientDepJson);
    this.htmlPage = fs.readFileSync(this.pathToHtmlPage);
    this.deps = !!fs.existsSync(this.depPath)?fs.readJSONSync(this.depPath):[];
    if(this.deps.length < 1) fs.writeJSONSync(this.depPath, []);

 }
 Refresh(){
     try{

         
         const clientDeps = this.deps;
         this.htmlPage = fs.readFileSync(this.pathToHtmlPage);
         for(let i = 0; i < clientDeps.length; i++){
             try{
                 const src = clientDeps[i].src;
                 const dest = clientDeps[i].dest;
             fs.copyFileSync(src, dest);
             this.htmlPage = this.htmlPage.toString().replace("</head>", 
`     <script src="${dest.replace('./public/','')}"></script>
</head>

                `)
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
}
