/**
 * Copy files from sources to destinations task.
 * 
 * config.json example:
```
    "build": {
        "copy": {
            "copyTasks": [
                {
                    "patterns": "store/file.js",
                    "rename": "newfilename.js",
                    "destination": "assets/js/store",
                    "_comment": "the store/file.js will be renamed to assets/js/store/newfilename.js"
                },
                {
                    "patterns": "node_modules/@fortawesome/fontawesome-free/css/**",
                    "destination": "assets/fontawesome/css",
                    "_comment": "all FontAwesome CSS files and folders will be copied to assets/fontawesome/css folder."
                }
            ]
        }
    }
```
 */


'use strict';


import path from 'node:path';
// import libraries
import CwdConfig from '../../../Libraries/CwdConfig.mjs';
import FS from '../../../Libraries/FS.mjs';
import Path from '../../../Libraries/Path.mjs';
import TextStyles from '../../../Libraries/TextStyles.mjs';


export const copy = class Copy {


    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};


    /**
     * Check required properties in each `copyTasks` value.
     * 
     * @param {Object} copyTasks The object of each `copyTasks` value.
     */
    #checkRequiredProperties(copyTasks) {
        if (typeof(copyTasks?.patterns) === 'undefined') {
            console.error('    ' + TextStyles.txtError('The property `patterns` is required in each `copyTasks` value.'));
            process.exit(1);
        }

        if (typeof(copyTasks?.destination) === 'undefined') {
            console.error('    ' + TextStyles.txtError('The property `destination` is required in each `copyTasks` value.'));
            process.exit(1);
        }
    }// checkRequiredProperties


    /**
     * Run copy task.
     * 
     * @param {object[]} copyTasks Copy task array object.
     */
    async #copyTasks(copyTasks) {
        const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        let totalWarns = 0;
        let totalCopied = 0;
        console.log('  Copy tasks.');

        let allTasks = new Promise(async (resolve, reject) => {
            await Promise.all(copyTasks.map(async (item) => {
                // check for required properties.
                this.#checkRequiredProperties(item);

                let filesResult = await FS.glob(
                    item.patterns, {
                        absolute: false,
                        cwd: CW_DIR,
                    }
                );

                if (typeof(filesResult) === 'object' && filesResult.length > 0) {
                    // sort result.
                    filesResult = filesResult.sort(collator.compare);

                    // loop copy.
                    console.log('    Patterns: ', item.patterns);
                    await Promise.all(filesResult.map((eachFile) => {
                        this.#doCopy(item, eachFile);
                        totalCopied++;
                    }));// end Promise.all
                } else {
                    totalWarns++;
                    console.log('    ' + TextStyles.txtWarning('Patterns "' + item.patterns + '": Result not found.'));
                }
            }))// end Promise.all
            .then(() => {
                resolve();
            });
        });// end new Promise;

        return allTasks
        .then(() => {
            if (totalWarns > 0) {
                console.log('    ' + TextStyles.txtWarning('There are total ' + totalWarns + ' warning, please read the result.'));
            }

            if (this.argv.preview) {
                console.log('    ' + TextStyles.txtInfo('Total ' + totalCopied + ' items will be copied.'));
            } else {
                console.log('    ' + TextStyles.txtSuccess('Total ' + totalCopied + ' items has been copied.'));
            }

            console.log('  End copy tasks.');
            return Promise.resolve();
        });
    }// copyTasks


    /**
     * Do copy file and folder to destination.
     * 
     * @param {Object} item Each `copyTasks` property.
     * @param {string} eachFile Each file name (and folder) from the search (glob) result.
     */
    #doCopy(item, eachFile) {
        const filename = path.basename(eachFile);
        const parentDestination = path.dirname(Path.replaceDestinationFolder(eachFile, item.destination, item.patterns));
        const sourcePath = path.resolve(CW_DIR, eachFile);
        const destPath = path.resolve(CW_DIR, parentDestination, (item.rename ?? filename));

        if (this.argv.preview) {
            console.log('      >> ' + sourcePath);
            console.log('        Will be copied to -> ' + destPath);
        } else {
            FS.copyFileDir(
                sourcePath,
                destPath
            )
            .then(() => {
                console.log('      >> ' + sourcePath);
                console.log('        Copied to -> ' + destPath);
            });// end promise;
        }
    }// doCopy


    /**
     * Initialize the copy task.
     * 
     * @param {Object} argv The CLI arguments.
     */
    static async init(argv) {
        const thisClass = new this();

        if (typeof(argv) === 'object') {
            thisClass.argv = argv;
        }

        const CwdConfigObj = new CwdConfig(argv);
        const buildObj = CwdConfigObj.getValue('build', {});
        if (
            !buildObj?.copy?.copyTasks || 
            buildObj?.copy?.copyTasks.length <= 0
        ) {
            // if there is NO copy tasks specify in the config file at all.
            // do nothing here.
            console.log(TextStyles.taskHeader('Skipping copy files to destinations.'));
            return ;
        }

        console.log(TextStyles.taskHeader('Copy files to destinations.'));

        if (buildObj?.copy?.copyTasks) {
            await thisClass.#copyTasks(buildObj.copy.copyTasks);
        } else {
            console.log('  Skipping copy tasks.');
        }// endif;

        console.log(TextStyles.taskHeader('End copy files to destinations.'));
    }// init


}