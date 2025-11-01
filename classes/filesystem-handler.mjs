import LogHandler from "./log-handler.mjs";
import fs from 'fs-extra'
export default class FilesystemHandler {
    constructor(config, logHandler = new LogHandler()) {
        this.logHandler = logHandler;
        this.config = config;
        this.publicRoot = !!config.PUBLIC_DIR ? config.PUBLIC_DIR : './public'
        this.treeMap = {
            "js": null,
            "css": null,
            "classes": null,
            "plugins": {
                "audio": null,
                "midi": null
            }
        }
    }
    Init() {
        this.BuildFSTree();
    }
    _createRelativePaths(obj, basePath = '') {
        const result = [];
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = basePath ? `${basePath}/${key}` : key;
            result.push(currentPath);
            if (value && typeof value === 'object') {
                result.push(...this._createRelativePaths(value, currentPath));
            }
        }

        return result;
    }
    async BuildFSTree() {
        try {
            let t = this.treeMap;
            let c = this.config;
            var pub = !!c.PUBLIC_DIR ? c.PUBLIC_DIR : './public';
            fs.emptyDirSync(pub);
            this._createRelativePaths(this.treeMap).forEach(fp => {
                fs.ensureDirSync(pub + '/'+fp);
            })
            console.log("public directory tree ensured..")
        }
        catch (err) {
            this.logHandler.writeLog(err);
        }
    }

}