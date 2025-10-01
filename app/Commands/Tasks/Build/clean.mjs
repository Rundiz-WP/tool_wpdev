/**
 * Clean destination folders task.
 * 
 * config.json example:
```
    "build": {
        "clean": {
            "destinations": [
                {
                    "patterns": [
                        "assets/css/**"
                    ],
                    "options": {
                        "dryRun": true
                    }
                }
            ]
        }
    }
```
 */


'use strict';


import { deleteAsync } from 'del';
import path from 'node:path';
// import libraries.
import CwdConfig from '../../../Libraries/CwdConfig.mjs';
import Path from '../../../Libraries/Path.mjs';
import TextStyles from '../../../Libraries/TextStyles.mjs';


export const clean = class Clean {


    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};


    /**
     * Clean destination based on `--destination` option.
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
            console.log(TextStyles.taskHeader('Skipping clean destination on WordPress installation folder.'));
            console.log('  ' + TextStyles.txtInfo('There is no `copy.copyWP` configuration.'));
            return ;
        }

        console.log(TextStyles.taskHeader('Clean destination on WordPress installation folder.'));

        if (!argv.destination) {
            console.info('  ' + TextStyles.txtInfo('There is no `--destination` option specify. Skipping.'));
            return ;
        }

        let destinationPath = path.resolve(argv.destination);
        destinationPath = destinationPath.replaceAll('\\', '/');// make it forward slash.
        destinationPath = Path.removeTrailingQuotes(destinationPath);
        let totalDeleted = 0;

        const deleteOptions = {
            cwd: destinationPath,
            dot: true,
            dryRun: (argv.preview ? true : false),
            force: true
        };
        const deleteResult = await deleteAsync('./**', deleteOptions);
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

        const CwdConfigObj = new CwdConfig(argv);
        const buildObj = CwdConfigObj.getValue('build', {});
        if (!buildObj?.clean?.destinations || buildObj?.clean?.destinations.length <= 0) {
            // if there is NO clean tasks specify in the config file.
            // do nothing here.
            console.log(TextStyles.taskHeader('Skipping clean destination folders.'));
            return ;
        }

        console.log(TextStyles.taskHeader('Clean destination folders.'));
        let totalDeleted = 0;
        for (const dest of buildObj.clean.destinations) {
            console.log('  Delete patterns: ' + dest.patterns);
            let defaultOptions = {
                cwd: CW_DIR,
                dryRun: (argv.preview ? true : false),
            }
            let options = (dest.options ?? {});
            options = {
                ...defaultOptions,
                ...options
            }
            console.log('    With options: ', options);

            const deleteResult = await deleteAsync(dest.patterns, options);
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
        }// endfor;

        if (argv.preview) {
            console.log(TextStyles.txtInfo('  Total ' + totalDeleted + ' items will be deleted.'));
        } else {
            console.log(TextStyles.txtSuccess('  Total ' + totalDeleted + ' items has been deleted.'));
        }

        console.log(TextStyles.taskHeader('End clean destination folders.'));
    }// init


}