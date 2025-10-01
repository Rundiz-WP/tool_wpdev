/**
 * Watcher task.
 * 
 * config.json example:
 ```
    "watch": {
        "watcher": [
            {
                "patterns": "assets/**",
                "destination": "assets",
                "_comment": "all files and folders will be copied to `--destination`/assets folder where `--destination` is required CLI option if you want to use watcher."
            }
        ]
    }
```
 */


'use strict';


import { deleteAsync } from "del";
import path from 'node:path';
// import libraries.
import CwdConfig from "../../../Libraries/CwdConfig.mjs";
import FS from "../../../Libraries/FS.mjs";
import Path from "../../../Libraries/Path.mjs";
import TextStyles from "../../../Libraries/TextStyles.mjs";


export const watcher = class Watcher {


    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};

    
    /**
     * Apply changes to assets folder.
     * 
     * @link https://www.npmjs.com/package/del The dependent Node package.
     * @async
     * @private This method was called from `run()`.
     * @param {string} event The watcher events. See https://github.com/paulmillr/chokidar#methods--events
     * @param {string} file The changed file.
     * @param {string} destination The destination (in configuration file) that related from `--destination` CLI option.
     */
     async #applyChanges(event, file, destination) {
        file = file.replaceAll(/\\/g, '/');
        let command;

        if (event.toLowerCase().indexOf('unlink') !== -1) {
            // if matched unlink (file), unlinkDir (folder)
            command = 'delete';
        } else {
            // if matched add, addDir, change
            command = null;
        }

        if (command === 'delete') {
            // if command is delete (file and folder).
            for (const eachDestCLI of this.argv.destination) {
                const destFullPath = path.resolve(eachDestCLI, Path.replaceDestinationFolder(file, destination));
                const deleteResult = await deleteAsync(destFullPath, {force: true});
                for (const item of deleteResult) {
                    console.log('    (main watcher) - Deleted: ' + item);
                };
            }// endfor;
        }

        if (command !== 'delete') {
            // else, it is copy command.
            for (const eachDestCLI of this.argv.destination) {
                const sourceFullPath = path.resolve(CW_DIR, file);
                const destFullPath = path.resolve(Path.removeTrailingQuotes(eachDestCLI), Path.replaceDestinationFolder(file, destination));
                FS.copyFileDir(sourceFullPath, destFullPath);
                console.log('    (main watcher) >> Applied to ' + destFullPath);
            }// endfor;
        }// endif;

        return Promise.resolve();
     }// applyChanges


    /**
     * Check required config property.
     * 
     * @returns {object[]|false} Return object array if there is watcher patterns in cofig.json on current working directory. Return `false` for otherwise.
     */
    #checkRequiredConfigProperty() {
        const CwdConfigObj = new CwdConfig(this.argv);
        const watchObj = CwdConfigObj.getValue('watch', {});

        if (
            typeof(watchObj) === 'object' &&
            typeof(watchObj?.watcher) === 'object' &&
            Array.isArray(watchObj?.watcher) &&
            watchObj.watcher.length > 0
        ) {
            return watchObj.watcher;
        }

        return false;
    }// checkRequiredConfigProperty


    /**
     * Check if there is `--destination` CLI option.
     * 
     * @returns {boolean} Return `true` if there is `--destination` CLI option, return `false` for otherwise.
     */
    #checkRequiredOptions() {
        if (!Array.isArray(this.argv.destination) || this.argv.destination.length <= 0) {
            return false;
        }

        let passed = true;
        for (const destination of this.argv.destination) {
            if (typeof(destination) !== 'string' || destination.trim() === '') {
                passed = false;
                break;
            }
        }

        return passed;
    }// checkRequiredOptions


    /**
     * Display file changed.
     * 
     * @private This method was called from `init()`.
     * @param {string} event The watcher events. See https://github.com/paulmillr/chokidar#methods--events
     * @param {string} file The changed file.
     * @param {string} source The source folder full path.
     */
    #displayFileChanged(event, file, source) {
        console.log('  (main watcher) File changed (' + event + '): ' + path.resolve(source, file));
    }// displayFileChanged

    /**
     * Initialize the watcher task.
     * 
     * @param {Object} argv The CLI arguments.
     */
    static async init(argv) {
        const thisClass = new this();

        if (typeof(argv) === 'object') {
            thisClass.argv = argv;
        }

        const watcherList = thisClass.#checkRequiredConfigProperty();
        if (thisClass.#checkRequiredOptions() === false || watcherList === false) {
            console.info(TextStyles.taskHeader('There is no required config or CLI option. Skipping watcher task.'));
            return ;
        }
        
        console.log(TextStyles.taskHeader('Watcher task.'));

        for (const eachWatcher of watcherList) {
            if (typeof(eachWatcher?.patterns) !== 'string' || typeof(eachWatcher?.destination) !== 'string') {
                // if no property pattern and/or destination. the property `destination` here is not from CLI.
                console.warn('  ' + TextStyles.txtWarning('There is no required property \'patterns\' and \'destination\' or they are not string.', eachWatcher));
                // skip this watcher item.
                continue;
            }

            console.log('  Watching ' + eachWatcher.patterns);

            const watcher = FS.watch(
                eachWatcher.patterns, 
                {
                    awaitWriteFinish: {
                        stabilityThreshold: 800,
                        pollInterval: 100
                    },
                    cwd: CW_DIR,
                }
            );

            watcher.on('ready', () => {
                const watchedList = watcher.getWatched();
                if (typeof(watchedList) !== 'object' || (typeof(watchedList) === 'object' && Object.entries(watchedList).length <= 0)) {
                    console.warn('  ' + TextStyles.txtWarning('There is nothing to watch on this patterns.'), eachWatcher.patterns);
                }
            });

            watcher.on('all', async (event, file, stats) => {
                await thisClass.#displayFileChanged(event, file, CW_DIR);
                await thisClass.#applyChanges(event, file, eachWatcher.destination);
            });
        }// endfor;

        console.log(TextStyles.taskHeader('End watcher task.'));
    }// init


}