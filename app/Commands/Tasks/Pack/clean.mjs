/**
 * Clean .dist folder.
 * 
 * config.json example:
```
    "pack": {
        "packPatterns": {
            "dev": {
                "patterns": [
                    "require at least a pattern on dev or prod property."
                ],
                "options": {
                    "ignore": [
                        "node_modules"
                    ]
                }
            },
            "prod": {
                "patterns": [
                    "require at least a pattern on dev or prod property."
                ]
            }
        }
    }
```
 */


'use strict';


import { deleteAsync } from "del";
import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import path from 'node:path';
// import libraries.
import CwdConfig from "../../../Libraries/CwdConfig.mjs";
import TextStyles from "../../../Libraries/TextStyles.mjs";


export const clean = class Clean {


    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};


    /**
     * Prepare empty .dist folder if not exists.
     * 
     * This is required to make archiver be able to create zip file.
     * 
     * @returns {Promise} Return Promise object.
     */
    #prepareDistFolder() {
        const destinationZipDir = path.resolve(CW_DIR, '.dist');
        if (!fs.existsSync(destinationZipDir)) {
            return fsPromise.mkdir(destinationZipDir)
                .then((data) => {
                    console.log('    Prepared empty .dist folder and ready for use.');
                    return Promise.resolve(data);
                });
        }
        return Promise.resolve();
    }// prepareDistFolder


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
     * Check if there is pack pattern available or not.
     * 
     * @returns {Object|false} Return config object if there is pack patterns available, return `false` if there is no pack patterns at all.
     */
    isPackPatternsAvailable() {
        const CwdConfigObj = new CwdConfig(this.argv);
        const packObj = CwdConfigObj.getValue('pack', {});
        if (
            (
                !packObj?.packPatterns?.dev?.patterns &&
                !packObj?.packPatterns?.prod?.patterns
            ) ||
            (
                typeof(packObj?.packPatterns?.dev?.patterns) !== 'object' &&
                typeof(packObj?.packPatterns?.prod?.patterns) !== 'object'
            ) ||
            (
                !Array.isArray(packObj?.packPatterns?.dev?.patterns) &&
                !Array.isArray(packObj?.packPatterns?.prod?.patterns)
            ) ||
            (
                packObj?.packPatterns?.dev?.patterns?.length <= 0 ||
                packObj?.packPatterns?.prod?.patterns?.length <= 0
            )
        ) {
            // if there is NO pack patterns specify in the config file.
            return false;
        }
        return packObj;
    }// isPackPatternsAvailable


    /**
     * Initialize the clean task.
     * 
     * @param {Object} argv The CLI arguments.
     */
    static async init(argv) {
        const thisClass = new this();

        if (typeof(argv) === 'object') {
            thisClass.argv = argv;
        }

        if (thisClass.isPackPatternsAvailable() === false) {
            // if there is NO pack patterns specify in the config file.
            // do nothing here.
            console.log(TextStyles.taskHeader('No pack patterns, skipping clean destination folders.'));
            return ;
        }

        console.log(TextStyles.taskHeader('Clean .dist folders.'));

        let totalDeleted = 0;
        const deleteOptions = {
            cwd: CW_DIR,
            dryRun: (argv.preview ? true : false),
            force: true,
        };
        let deleteResult = await deleteAsync('.dist/**', deleteOptions);

        deleteResult = deleteResult.concat(
            await deleteAsync('.dist', deleteOptions)
        );

        deleteResult.forEach((item) => {
            if (argv.preview) {
                console.log('  - Will be deleted: ' + item.replaceAll(/\\/g, '/'));
            } else {
                console.log('  - Deleted: ' + item.replaceAll(/\\/g, '/'));
            }
            totalDeleted++;
        });// end forEach;
        if (deleteResult.length <= 0) {
            console.log('  Nothing to delete, skipping.');
        }

        if (argv.preview) {
            console.log(TextStyles.txtInfo('  Total ' + totalDeleted + ' items will be deleted.'));
        } else {
            console.log(TextStyles.txtSuccess('  Total ' + totalDeleted + ' items has been deleted.'));
        }

        await thisClass.#prepareDistFolder();

        console.log(TextStyles.taskHeader('End clean .dist folders.'));
    }// init


}