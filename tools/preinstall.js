const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

console.log("1. Preparing NativeScript for Nx.");

const filesToCopy = ["references.d.ts", "tsconfig.aot.json", "tsconfig.json", "webpack.config.js"];

getAppRootFolder()
    .then((appRootFolder) => copyFiles(filesToCopy, appRootFolder));

function copyFiles(files, appRootFolder) {
    return new Promise((resolve, reject) => {
        let cnt = 0;
        const copyFile = function () {
            const filename = files[cnt];
            const sourcePath = path.join(__dirname, filename);
            const destPath = path.join(appRootFolder, filename);
    
            // console.log(`configuring ${path.resolve(destPath)}...`);
            fs.rename(sourcePath, destPath, (err) => {
                if (err) {
                    return reject(err);
                }
    
                cnt++;
                if (cnt === files.length) {
                    resolve();
                } else {
                    copyFile();
                }
            });
        }
        copyFile();
    });
}

function getAppRootFolder() {
    return new Promise((resolve, reject) => {
        // npm prefix returns the closest parent directory to contain a package.json file
        exec("cd .. && npm prefix", (err, stdout) => {
            if (err) {
                return reject(err);
            }

            resolve(stdout.toString().trim());
        });
    });
}
