/**
 * Version writer task.
 * 
 * config.json example:
```
    "writeVersions": [
        {
            "nodePackage": "ace-builds",
            "phpHandlesRegex": [
                "datatables",
                "datatables\\-plugins\\-pagination"
            ]
        }
        {
            "nodePackage": "rundiz-template-for-admin",
            "phpHandlesRegex": [
                "rdta"
            ]
        }
    ],
    "writeVersionsCfg": {
        "phpFile": "ModuleData/ModuleAssets.php"
    }
```
 */


'use strict';


import { execSync } from 'node:child_process'
import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import path from 'node:path';
// import libraries.
import CwdConfig from '../../../Libraries/CwdConfig.mjs';
import FS from '../../../Libraries/FS.mjs';
import TextStyles from '../../../Libraries/TextStyles.mjs';


export const versionWriter = class VersionWriter {


    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};

    
    /**
     * Create backup for PHP file.
     * 
     * @private This method was called from `writeVersionsTasks()`.
     * @param {string} assetsDataFile The assets data file (mostly PHP) that contains Node assets handle and version.
     */
    #createPHPBackup(assetsDataFile) {
        console.log('    Create backup for PHP file.');
        const date = new Date();
        const timeStampInMs = date.getFullYear() + ('0' + (date.getMonth() + 1)).slice(-2) + ('0' + date.getDate()).slice(-2)
            + '_' + ('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2) + ('0' + date.getSeconds()).slice(-2)
            + '_' + date.getMilliseconds();
        const phpExt = path.extname(assetsDataFile);// .php
        const regex = new RegExp(phpExt + '$');
        const backupDestination = '.backup/' + assetsDataFile.replace(regex, '.' + timeStampInMs + phpExt);

        // copy source file to destination to create backup.
        const destination = path.resolve(CW_DIR, backupDestination);
        FS.cpSync(path.resolve(CW_DIR, assetsDataFile), destination);

        console.log('      Backup was created in ' + destination);
        console.log('    End create backup for PHP file.');
        return Promise.resolve();
    }// createPHPBackup

    
    /**
     * Get installed Node packages.
     * 
     * @private This method was called from `writeVersionsTask()`.
     * @returns {Object} Return JSON object.
     */
    #getInstalledPackages() {
        console.log('  Get installed Node packages.');

        const result = execSync(
            'npm ls --depth=0 --omit=dev --json',
            {
                cwd: CW_DIR,
            }
        );

        const resultObj = JSON.parse(result.toString());
        const dependencies = (resultObj?.dependencies ?? {});

        console.log('    Found total ' + Object.entries(dependencies).length + ' items.');
        console.log('  End get installed Node packages.');

        return (typeof(dependencies) === 'object' ? dependencies : {});
    }// getInstalledPackages


    /**
     * Get regular expression pattern target on assets data file (PHP).
     * 
     * @private This method was called from `writeVersionsTasks()`.
     * @param {string} handleName The handle name.
     * @returns {string} Return regular expression pattern.
     */
    #getRegexPattern(handleName) {
        return '([\'"]' + handleName + '[\'"])'// group1, [quote or double quote]handleName[quote or double quote]
        + '(\\s*,\\s*'// start group2 space*,space*
            + '[\\w\\(\\)\\.\\s\\\/\'\\-]*\\s*,\\s*'// [asset URL.]space*,space*
            + '[\\w\\(\\)\\.\\s\\\/\'\\-\\[\\]]*\\s*,\\s*'// [dependency array]space*,space*
        + '[\'"])'// end group2 [quote or double quote]
        + '([\\d\\w\\(\\)\\.\\-\\+]+)'// group 3 version number
        + '([\'"])'// group 4 [quote or double quote]
        ;
    }// getRegexPattern


    /**
     * Get only valid version number from version string.
     * 
     * @private This method was called from `writeVersionsTasks()`.
     * @param {string} versionString Version string.
     * @returns {string} Return version string.
     */
    #getVersionNumber(versionString) {
        const regexPattern = /(?<version>([\d\.]+)([-+\.0-9a-z]*))/miu;
        const matched = versionString.match(regexPattern);

        if (matched && matched.groups && matched.groups.version) {
            return matched.groups.version;
        }

        return 'unknown';
    }// getVersionNumber


    /**
     * Run write versions tasks.
     * 
     * @private This method was called from `init()`.
     * @param {Object} writeVersionsObj 
     */
    async #writeVersionsTasks(writeVersionsObj) {
        // get installed Node packages.
        const packageDependencies = await this.#getInstalledPackages();
        if (Object.entries(packageDependencies).length <= 0) {
            // if found no installed packages.
            console.warn('  ' + TextStyles.txtWarning('Warning: Not found any installed Node packages. Please verify again that there is `dependencies` in package.json and there is node_modules folder that contain installed packages. Skipping.'));
            return ;
        }

        // start loop thru writeVersions property values.
        for (const [index, eachCfgPackage] of writeVersionsObj.entries()) {
            if (typeof(eachCfgPackage?.nodePackage) !== 'string' || !eachCfgPackage.nodePackage) {
                // if not found `nodePackage` property in the config object.
                console.warn('  ' + TextStyles.txtWarning('Warning: Not found `nodePackage` property in `writeVersions` object (indexed ' + index + ') in the config.json file. Skipping.'));
                continue;
            }

            if (typeof(packageDependencies[eachCfgPackage.nodePackage]) !== 'object') {
                // if not found this installed Node packages.
                console.warn('  ' + TextStyles.txtWarning('Warning: Not found installed Node package name "' + eachCfgPackage.nodePackage + '". Skipping.'));
                continue;
            }

            if (
                typeof(eachCfgPackage.assetsDataPattern) !== 'object' || 
                !Array.isArray(eachCfgPackage.assetsDataPattern) || 
                Object.entries(eachCfgPackage.assetsDataPattern).length <= 0
            ) {
                // if not found `assetsDataPattern` property in the config object.
                // or it is not array
                // or it is empty array
                console.warn('  ' + TextStyles.txtWarning('Warning: The `assetsDataPattern` property is not array or empty.'));
                continue;
            }

            if (typeof(eachCfgPackage?.assetsDataFile) !== 'string' || !eachCfgPackage.assetsDataFile) {
                // if not found assets data file (mostly is PHP file).
                console.warn('  ' + TextStyles.txtWarning('Warning: Not found `assetsDataFile` property in `writeVersions` object (index ' + index + ') in the config.json file. Skipping.'));
                continue;
            } else if (!fs.existsSync(eachCfgPackage.assetsDataFile)) {
                console.warn('  ' + TextStyles.txtWarning('Warning: The assets data file in `assetsDataFile` property could not be found. (' + eachCfgPackage.assetsDataFile + '). Skipping.'));
                continue;
            }
            const assetsDataFile = eachCfgPackage.assetsDataFile;

            console.log('  Node package: ' + eachCfgPackage.nodePackage);
            // read assets data file contents.
            const fh = await fsPromise.open(assetsDataFile, 'r+');
            let moduleAssetsDataContents = await fh.readFile({encoding: 'utf8'});

            if (!this.argv.preview) {
                await this.#createPHPBackup(assetsDataFile);
            } else {
                console.info('    ' + TextStyles.txtInfo('Did not create backup for assets data file (preview only).'));
            }

            const installedVersion = this.#getVersionNumber(packageDependencies[eachCfgPackage.nodePackage].version);
            for (const [mhIndex, mhRegex] of eachCfgPackage.assetsDataPattern.entries()) {
                // mh = Module assets data handle in PHP file.
                let regExp = new RegExp(this.#getRegexPattern(mhRegex), 'gi');
                moduleAssetsDataContents = moduleAssetsDataContents.replace(regExp, '$1$2' + installedVersion + '$4');
                const foundMatched = moduleAssetsDataContents.match(regExp);
                if (foundMatched && typeof(foundMatched) === 'object' && foundMatched.length > 0) {
                    console.log('    Found version ' + installedVersion + ' for "' + mhRegex + '" handle.');
                } else {
                    console.warn('    ' + TextStyles.txtWarning('Warning: The handle "' + mhRegex + '" was not found in assets data file. Couldn\'t replace version.'));
                }
            }// endfor; eachCfgPackage.assetsDataPattern.entries()

            try {
                if (!this.argv.preview) {
                    // must use file handle `.write()` with position 0 because `.writeFile()` will becomes append duplicated content.
                    await fh.truncate();
                    await fh.write(moduleAssetsDataContents, 0, 'utf8');
                    console.log('    ' + TextStyles.txtSuccess('All data were written successfully.'));
                } else {
                    console.info('    ' + TextStyles.txtInfo('This is preview only, it will not be written to assets data file.'));
                }
            } finally {
                await fh.close();
            }
        }// endfor; writeVersionsObj.entries()

        console.log('  End write Node packages version.');
    }// writeVersionsTasks


    /**
     * Initialize the class.
     */
    static async init(argv) {
        const thisClass = new this();

        if (typeof(argv) === 'object') {
            thisClass.argv = argv;
        }

        const CwdConfigObj = new CwdConfig(argv);
        const writeVersionsObj = CwdConfigObj.getValue('writeVersions');
        if (
            !writeVersionsObj ||
            !Array.isArray(writeVersionsObj) ||
            writeVersionsObj.length <= 0
        ) {
            // if there is NO writeVersions tasks specify in the config file at all.
            // do nothing here.
            console.log(TextStyles.taskHeader('Skipping write Node packages version.'));
            return ;
        }

        console.log(TextStyles.taskHeader('Write Node package\'s version to asset data file.'));

        await thisClass.#writeVersionsTasks(writeVersionsObj);

        console.log(TextStyles.taskHeader('End write Node package\'s version to asset data file.'));
    }// init


}