/**
 * Clean destination folders task. This task will be use the same config property as `build`.
 * 
 * config.json example:
```
    "build": {
        "copy": {
            "copyWP": [
                {
                    "patterns": "assets/js/store/file.js",
                    "rename": "newfilename.js",
                    "destination": "assets/js/store",
                    "_comment": "the assets/js/store/file.js will be copied and renamed to /destination/path/assets/js/store/newfilename.js"
                },
                {
                    "patterns": "assets/fontawesome/css/**",
                    "destination": "assets/fontawesome/css",
                    "_comment": "all FontAwesome CSS files and folders will be copied to /destination/path/assets/fontawesome/css folder."
                }
            ]
        }
    }
```
 *
 * The difference of this clean class with Build/clear.mjs is this file will be delete files and folders that is not exists on `build.copy.copyWP[].patterns`.
 */


'use strict';


import { deleteAsync } from 'del';
import path from 'node:path';
// import libraries.
import CwdConfig from '../../../Libraries/CwdConfig.mjs';
import FS from '../../../Libraries/FS.mjs';
import Path from '../../../Libraries/Path.mjs';
import TextStyles from '../../../Libraries/TextStyles.mjs';


export const deleter = class Delete {


    /**
     * @type {string} Destination path that is normalized.
     */
    #destination;


    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};


    /**
     * List the files that exists on destination (WP installation folder) but not exists on source's copy pattern.  
     * The files that is different by this list will be deleted.
     * 
     * @async
     * @private This method was called from `WPdestination()`.
     * @param {object} copyWP The `copyWP` config property.
     * @returns {Promise} Return Promise object with `filesResult` in argument.
     */
    async #globFiles(copyWP) {
        let findTasks = [];
        let filesResult = [];
        const patterns = [];

        for (const copyWPItem of copyWP) {
            if (!copyWPItem?.patterns) {
                continue;
            }
            patterns.push(copyWPItem.patterns);
        }
        if (patterns.length <= 0) {
            return [];
        }

        const sourceFiles = await FS.glob(
            patterns,
            {
                absolute: false,
                cwd: CW_DIR,
            }
        );

        findTasks.push(
            // List everything on destination (WP installation/plugin, theme folder).
            // Anything different from copy pattern on config file will be deleted.
            FS.glob(
                '**',
                {
                    absolute: false,
                    cwd: this.#destination,
                }
            )
            .then((data) => {
                // find the DIFFERENCE.
                // @link https://stackoverflow.com/a/33034768/128761 Original source code.
                const difference = data.filter(x => !sourceFiles.includes(x));
                return Promise.resolve(difference);
            })
            .then((data) => {
                // set full path to destination files (and folders).
                for (let i = 0; i < data.length; i++) {
                    data[i] = path.resolve(this.#destination, data[i]);
                }// endfor;
                // append result to `filesResult` variable.
                filesResult = filesResult.concat(data);
                return Promise.resolve(data);
            })
        );

        return Promise.all(findTasks)
        .then(() => {
            return Promise.resolve(filesResult);
        });
    }// #globFiles


    /**
     * Delete destination based on `--destination` option and only if different from copy pattern on config file will be deleted.
     * 
     * Only work if there is `build.copy.copyWP` property in config.json on current working directory.
     * 
     * @param {Object} argv The CLI arguments.
     */
    static async WPdestination(argv) {
        const thisClass = new this();

        if (typeof(argv) === 'object') {
            thisClass.argv = argv;
        }

        const CwdConfigObj = new CwdConfig(argv);
        const buildObj = CwdConfigObj.getValue('build', {});
        if (
            !buildObj?.copy?.copyWP || 
            buildObj?.copy?.copyWP.length <= 0
        ) {
            // if there is NO copyWP tasks specify in the config file at all.
            // do nothing here.
            console.log(TextStyles.taskHeader('Skipping delete destination on WordPress installation folder.'));
            console.error('  ' + TextStyles.txtError('There is no `copy.copyWP` configuration.'));
            return ;
        }

        console.log(TextStyles.taskHeader('Delete destination on WordPress installation folder.'));

        if (!argv.destination) {
            console.error('  ' + TextStyles.txtError('There is no `--destination` option specify. Skipping.'));
            return ;
        }

        let destinationPath = path.resolve(argv.destination);
        destinationPath = destinationPath.replaceAll('\\', '/');// make it forward slash.
        destinationPath = Path.removeTrailingQuotes(destinationPath);
        thisClass.#destination = destinationPath;

        const deleteList = await thisClass.#globFiles(buildObj.copy.copyWP);
        
        let totalDeleted = 0;

        const deleteOptions = {
            cwd: destinationPath,
            dot: true,
            dryRun: (argv.preview ? true : false),
            force: true
        };
        const deleteResult = await deleteAsync(deleteList, deleteOptions);
        deleteResult.forEach((item) => {
            if (argv.preview) {
                console.log('    - Will be deleted: ' + item.replaceAll(/\\/g, '/'));
            } else {
                console.log('    - Deleted: ' + item.replaceAll(/\\/g, '/'));
            }
            totalDeleted++;
        });// end forEach;
        if (deleteResult.length <= 0) {
            console.log('    Nothing to delete, skipping.');
        }

        if (argv.preview) {
            console.log(TextStyles.txtInfo('  Total ' + totalDeleted + ' items will be deleted.'));
        } else {
            console.log(TextStyles.txtSuccess('  Total ' + totalDeleted + ' items has been deleted.'));
        }

        console.log(TextStyles.taskHeader('End clean destination on WordPress installation folder.'));
    }// WPdestination


}