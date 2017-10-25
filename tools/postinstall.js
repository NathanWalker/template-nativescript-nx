const fs = require("fs");
const path = require("path");
const exec = require("child_process").exec;

getPackageJson()
    .then((packageJsonData) => {
        // results of glob parameter expansion can vary depending on shell, and its configuration
        // quote the parameter to use node glob syntax (using double quotes if you need it to run in Windows)
        cleanupPackage(packageJsonData);
    })
    .catch((err) => {
        console.error(err);
    })
    .then(() => {
        console.log("NativeScript for Nx is finalizing...");
        // Remove tools folder including this script
        deleteFolderSync(__dirname);
    });
    // TODO: grab app name from command line to setup convenient run scripts
    // .then(() => {
    //     getNxPackageJson()
    //         .then((packageJsonData) => {
    //             addDevScriptsToWorkspace(packageJsonData);
    //         });
    // });

function getPackageJson() {
    return getAppRootFolder()
        .then((appRootFolder) => {
            const packageJsonPath = path.join(appRootFolder, "package.json");
            const packageJson = require(packageJsonPath);

            if (!packageJson) {
                throw new Error("package.json file not found");
            }

            return {
                packageJson,
                packageJsonPath
            };
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

function getNxPackageJson() {
    return getNxRootFolder()
        .then((nxRootFolder) => {
            const packageJsonPath = path.join(nxRootFolder, "package.json");
            const packageJson = require(packageJsonPath);

            if (!packageJson) {
                throw new Error("Nx workspace package.json file not found");
            }

            return {
                packageJson,
                packageJsonPath
            };
        });
}

function getNxRootFolder() {
    return new Promise((resolve, reject) => {
        // npm prefix returns the closest parent directory to contain a package.json file
        exec("cd ../../.. && npm prefix", (err, stdout) => {
            if (err) {
                return reject(err);
            }

            resolve(stdout.toString().trim());
        });
    });
}

function cleanupPackage(packageJsonData) {
    return new Promise((resolve, reject) => {
        console.log("Cleaning up...");

        const { packageJson, packageJsonPath } = packageJsonData;

        const correctPackageDetails = path.join(__dirname, "package.json");
        const correctPackageDetailsJson = require(correctPackageDetails);

        packageJson.dependencies = correctPackageDetailsJson.dependencies;
        packageJson.devDependencies = correctPackageDetailsJson.devDependencies;
        packageJson.scripts = correctPackageDetailsJson.scripts;

        const updatedContent = JSON.stringify(packageJson);
        fs.writeFile(packageJsonPath, updatedContent, (err) => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });
}

function addDevScriptsToWorkspace(packageJsonData) {
    return new Promise((resolve, reject) => {

        const { packageJson, packageJsonPath } = packageJsonData;

        packageJson.scripts['start.ios'] = `cd apps/TODO: need app name && tns run ios --emulator --syncAllFiles`;
        packageJson.scripts['start.android'] = `cd apps/TODO: need app name && tns run ios --emulator --syncAllFiles`;

        const updatedContent = JSON.stringify(packageJson);
        fs.writeFile(packageJsonPath, updatedContent, (err) => {
            if (err) {
                return reject(err);
            }

            resolve();
        });
    });
}

function deleteFolderSync(folderPath) {
    if (fs.statSync(folderPath).isDirectory()) {
        fs.readdirSync(folderPath).forEach((file) => {
            const content = path.join(folderPath, file);
            const contentDirs = fs.statSync(content).isDirectory();

            if (contentDirs) {
                deleteFolderSync(content);
            }
            else {
                fs.unlinkSync(content);
            }
        });

        fs.rmdirSync(folderPath);
    }
}
