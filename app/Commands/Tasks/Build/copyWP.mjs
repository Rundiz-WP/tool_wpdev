/**
 * Copy the repository (plugin or theme - for example) to WordPress installation folder.
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
 */


'use strict';


import path from 'node:path';
// import libraries
import CwdConfig from '../../../Libraries/CwdConfig.mjs';
import FS from '../../../Libraries/FS.mjs';
import Path from '../../../Libraries/Path.mjs';
import TextStyles from '../../../Libraries/TextStyles.mjs';


export const copyWP = class CopyWP {


    /**
     * @type {Number} Total warnings while copy process.
     */
    #totalWarns = 0;


    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};


    /**
     * Check for required properties in configuration file.
     * 
     * @private This method was called from `#copyToWP()`.
     * @param {object} copyWP The `copyWP` property in configuration file.
     */
    #checkRequiredProperties(copyWP) {
        for (const copyWPItem of copyWP) {
            if (typeof(copyWPItem?.patterns) === 'undefined') {
                onsole.error('    ' + TextStyles.txtError('The property `patterns` is required in each `copyWP` value.'));
                process.exit(1);
            }
            if (typeof(copyWPItem?.destination) === 'undefined') {
                onsole.error('    ' + TextStyles.txtError('The property `destination` is required in each `copyWP` value.'));
                process.exit(1);
            }
        }
    }// #checkRequiredProperties


    /**
     * Run copy to WP.
     * 
     * @private This method was called from `init()`.
     * @param {object[]} copyWP Copy WP array object.
     */
    async #copyToWP(copyWP) {
        const collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
        let totalCopied = 0;
        console.log('  Copy to WP.');

        this.#checkRequiredProperties(copyWP);

        const allTasks = new Promise(async (resolve, reject) => {
            await Promise.all(copyWP.map(async (item) => {
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
                    this.#totalWarns = parseInt(this.#totalWarns) + 1;
                    console.warn('    ' + TextStyles.txtWarning('Patterns "' + item.patterns + '": Result not found.'));
                }
            }))// end Promise.all
            .then(() => {
                resolve();
            });
        });// end new Promise;

        return allTasks
        .then(() => {
            if (this.#totalWarns > 0) {
                console.warn('    ' + TextStyles.txtWarning('There are total ' + this.#totalWarns + ' warning, please read the result.'));
            }

            if (this.argv.preview) {
                console.log('    ' + TextStyles.txtInfo('Total ' + totalCopied + ' items will be copied.'));
            } else {
                console.log('    ' + TextStyles.txtSuccess('Total ' + totalCopied + ' items has been copied.'));
            }

            console.log('  End copy to WP.');
            return Promise.resolve();
        });
    }// #copyToWP


    /**
     * Do copy a file and a folder from source to destination.
     * 
     * @private This method was called from `#copyToWP()`.
     * @param {Object} item Each `copyWP` property.
     * @param {string} eachFile Each file name (and folder) from the search (glob) result.
     */
    #doCopy(item, eachFile) {
        const filename = path.basename(eachFile);
        const parentDestinationPatterns = path.dirname(Path.replaceDestinationFolder(eachFile, item.destination, item.patterns));
        const sourcePath = path.resolve(CW_DIR, eachFile);
        let destPath = Path.removeTrailingQuotes(this.argv.destination);
        let destPathWithParentDestPatterns = path.resolve(destPath, parentDestinationPatterns);
        const destinationRelativeToParentDestinationPatterns = path.relative(destPath, path.resolve(destPath, parentDestinationPatterns));
        if (destinationRelativeToParentDestinationPatterns.includes('..') === true) {
            // if found upper path than `--destination` CLI argument.
            const newParentDest = path.dirname(Path.replaceDestinationFolder(eachFile, destPath, item.patterns));
            this.#totalWarns = parseInt(this.#totalWarns) + 1;
            console.warn('    ' + TextStyles.txtWarning('Invalid `destination` value (' + item.destination + ') that will becomes "' + destPathWithParentDestPatterns + '". Rewriting it to ' + newParentDest + '.'));
            destPathWithParentDestPatterns = path.resolve(newParentDest);
        }
        destPath = path.resolve(destPathWithParentDestPatterns, (item.rename ?? filename));

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

        return Promise.resolve();
    }// #doCopy


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
            !buildObj?.copy?.copyWP || 
            buildObj?.copy?.copyWP.length <= 0
        ) {
            // if there is NO copyWP tasks specify in the config file at all.
            // do nothing here.
            console.log(TextStyles.taskHeader('Skipping copy to WordPress installation folder.'));
            console.log('  ' + TextStyles.txtInfo('There is no `copy.copyWP` configuration. Skipping.'));
            return ;
        }

        console.log(TextStyles.taskHeader('Copy files to WordPress installation folder.'));

        if (!argv.destination) {
            console.info('  ' + TextStyles.txtInfo('There is no `--destination` option specify. Skipping.'));
            return ;
        }

        await thisClass.#copyToWP(buildObj.copy.copyWP);

        console.log(TextStyles.taskHeader('End copy files to WordPress installation folder.'));
    }// init


}