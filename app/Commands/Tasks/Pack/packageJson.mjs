/**
 * Doing things about package.json file.
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';
// import libraries.
import TextStyles from "../../../Libraries/TextStyles.mjs";


export const packageJson = class PackageJson {

    
    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};


    /**
     * Class constructor.
     * 
     * @param {Object} argv The CLI arguments.
     */
    constructor(argv) {
        if (typeof(argv) === 'object') {
            this.argv = argv;
        }
    }// constructor


    /**
     * Update version number on package.json file.
     * 
     * @param {string} version The repository version number (plugin or theme version number).
     */
    updateRepoVersion(version) {
        console.log('  Update package.json version.');

        if (version.toLowerCase() !== 'unknown') {
            const packageJsonFile = path.resolve(CW_DIR, 'package.json');
            if (fs.existsSync(packageJsonFile)) {
                if (!this.argv.preview) {
                    let packageJson = JSON.parse(
                        fs.readFileSync(packageJsonFile)
                    );
                    packageJson.version = version;
                    fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 4));
                    console.log('    ' + TextStyles.txtSuccess('Updated to version "' + version + '" successfully.'));
                } else {
                    console.log('    ' + TextStyles.txtInfo('The package.json will be change to version ' + version + '.'));
                }// endif; preview
            } else {
                console.warn('    ' + TextStyles.txtWarning('The package.json file is not exists on "' + packageJsonFile + '".'));
            }
        } else {
            console.warn('    ' + TextStyles.txtWarning('The version number is ' + version + '.'));
        }// endif; version is not unknown

        console.log('  End update package.json version.');
    }// updateRepoVersion


}