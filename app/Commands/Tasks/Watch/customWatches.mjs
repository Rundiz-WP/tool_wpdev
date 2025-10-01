/**
 * Custom watch task.
 * 
 * config.json example:
 ```
    "watch": {
        "customWatches": [
            "watchJS.mjs",
            "file-refer-from-config-folder.ext"
        ]
    }
```
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
// import this app's useful class.
import CwdConfig from '../../../Libraries/CwdConfig.mjs';
import TasksRunnerChecker from '../../../Libraries/TasksRunnerChecker.mjs';
import TextStyles from "../../../Libraries/TextStyles.mjs";


export const customWatches = class CustomWatches {


    /**
     * Class constructor.
     * 
     * @param {Object} argv The CLI arguments.
     */
    constructor(argv = {}) {
        /**
         * @type {Object} The command line arguments.
         */
        this.argv = {};
        if (typeof(argv) === 'object') {
            this.argv = argv;
        }
    }// constructor


    /**
     * Watch selected source and copy/bundle[/and maybe minify] to assets folder.
     */
    async watch() {
        const CwdConfigObj = new CwdConfig(this.argv);
        const watchObj = CwdConfigObj.getValue('watch', {});
        const customWatchObj = (watchObj?.customWatches ?? []);

        if (!Array.isArray(customWatchObj) || customWatchObj.length <= 0) {
            console.info(TextStyles.taskHeader('There is no value for custom watch task. Skipping custom watch task.'));
            return ;
        }

        console.log(TextStyles.taskHeader('Custom watch task.'));

        const cwdConfigDir = path.dirname(TasksRunnerChecker.tasksRunnerConfig());

        for (const watcherFile of customWatchObj) {
            const fullPathWatcherFile = path.resolve(CW_DIR, cwdConfigDir, watcherFile);
            if (!fs.existsSync(fullPathWatcherFile)) {
                console.warn('  ' + TextStyles.txtWarning('The file ' + fullPathWatcherFile + ' is not exists.'));
                continue;
            } else {
                console.log('  Running ' + fullPathWatcherFile);
            }

            const {default: customWatchClass} = await import(url.pathToFileURL(fullPathWatcherFile));
            const customWatchClassObj = new customWatchClass(this.argv);
            customWatchClassObj.run();
        }// endfor;
        
        console.log(TextStyles.taskHeader('End custom watch task.'));
    }// watch


}