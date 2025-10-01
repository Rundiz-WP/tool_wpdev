/**
 * Custom tasks.
 * 
 * config.json example:
```
    "build": {
        "customTasks": [
            "my-bundle-js-tasks.js",
            "file-refer-from-config-folder.ext"
        ]
    }
```
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
// import libraries
import CwdConfig from '../../../Libraries/CwdConfig.mjs';
import TasksRunnerChecker from '../../../Libraries/TasksRunnerChecker.mjs';
import TextStyles from '../../../Libraries/TextStyles.mjs';


export const customTasks = class CustomTasks {


    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};


    /**
     * Run custom tasks on `customTasks` property.
     * 
     * @param {string[]} customTasks Custom tasks array.
     */
    async #customTasks(customTasks) {
        const cwdConfigDir = path.dirname(TasksRunnerChecker.tasksRunnerConfig());

        for (const eachTask of customTasks) {
            const fullPathTask = path.resolve(CW_DIR, cwdConfigDir, eachTask);
            if (!fs.existsSync(fullPathTask)) {
                console.warn('  ' + TextStyles.txtWarning('The file ' + fullPathTask + ' is not exists.'));
                continue;
            } else {
                console.log('  Running ' + fullPathTask);
            }// endif;

            const {default: CustomTaskClass} = await import(url.pathToFileURL(fullPathTask));
            const customTaskObj = new CustomTaskClass(this.argv);
            await customTaskObj.run();
        }// endfor;
    }// customTasks


     /**
      * Initialize the custom tasks.
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
            !buildObj?.customTasks || 
            buildObj?.customTasks.length <= 0
        ) {
            // if there is NO custom tasks specify in the config file at all.
            // do nothing here.
            console.log(TextStyles.taskHeader('Skipping custom tasks.'));
            return ;
        }

        console.log(TextStyles.taskHeader('Custom tasks.'));

        await thisClass.#customTasks(buildObj.customTasks);

        console.log(TextStyles.taskHeader('End custom tasks.'));
    }// init


}