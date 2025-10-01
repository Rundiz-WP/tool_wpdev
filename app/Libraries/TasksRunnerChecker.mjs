/**
 * Tasks runner working directory checker.
 */


'use strict';


import { cwd } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
// import libraries.
import TextStyles from "./TextStyles.mjs";


const tasksRunnerConfig = 'node_tasks/config/config.json';
const tasksRunnerRequiredProperty = 'wpDev';


export default class TasksRunnerChecker {


    /**
     * @type {true|false|null} Mark `true` if config file is for WP dev app,  
     *              `false` if config file is not for WP dev app,  
     *              `null` if config file is not exists.
     */
    #isWpDevApp = null;


    /**
     * Get tasks runner config file path at cwd.
     * 
     * @returns {string} Return partial path of tasks runner config file. This can be use with `path.resolve()` to connect with current working directory.
     */
    static tasksRunnerConfig() {
        return tasksRunnerConfig;
    }// tasksRunnerConfig


    /**
     * Check that is currently working directory contains valid tasks runner folder in it.
     * 
     * This will be display error message and exit if it is invalid.  
     * This also change `CW_DIR` global variable if everything is valid.
     * 
     * @param {Object} argv The CLI arguments.
     * @param {Object} options The options.
     * @param {Boolean} options.isRequired Set to `true` if configuration file is required.  
     *              If config file is not exists, it will report and exit program. Default is `true`.  
     *              Set to `false` to use default config per task if config file is not exists.  
     *              If config file is not exists, it will be warn but program can continue.
     */
    static check(argv, options = {}) {
        if (typeof(options?.isRequired) !== 'boolean') {
            options.isRequired = true;
        }

        const thisClass = new this();
        const errorMessage = 'Current working directory is invalid or not contain valid tasks runner configuration file for this tasks runner app. (%s)';
        const warnMessage = 'Current working directory is invalid or not contain valid tasks runner configuration file for this tasks runner app. (%s) The program will use default configuration.';
        let cwdPath = cwd();
        if (argv.wpdir) {
            cwdPath = argv.wpdir;
        }

        if (!thisClass.isValidConfig(cwdPath)) {
            // if config file is not exists or not contain required property (such as config file is not for this app).
            if (
                options.isRequired === true ||// config is required but config file may not exists or invalid. => NO.
                (
                    options.isRequired === false &&
                    thisClass.#isWpDevApp === false
                )// config is not required and config file is invalid. => NO
            ) {
                // if required config then NO to all.
                // if not required config but file does not contain required property then NO.
                console.error('  ' + TextStyles.txtError(util.format(errorMessage, tasksRunnerConfig)));
                process.exit(1);
            } else if (options.isRequired === false && thisClass.#isWpDevApp === null) {
                // if not required config and config file is not exists then OK. (use default config.)
                console.warn('  ' + TextStyles.txtWarning(util.format(warnMessage, tasksRunnerConfig)));
            } else {
                // don't know. just stop it.
                console.error('  ' + TextStyles.txtError(util.format(errorMessage, tasksRunnerConfig)));
                process.exit(1);
            }
        }// endif; check config file valid or not.

        // come to this means config file exists and valid.
        global.CW_DIR = cwdPath;
    }// check


    /**
     * Check is valid config file.
     * 
     * @param {string} cwdPath Current working directory path.
     * @returns {boolean} Return `true` if current config file in cwd is valid for this tasks runner app. Return `false` for otherwise.
     */
    isValidConfig(cwdPath) {
        const configFile = path.resolve(cwdPath, tasksRunnerConfig);

        if (!this.isValidFolder(cwdPath)) {
            // if config file is not exists.
            this.#isWpDevApp = null;
            return false;
        }

        let configObject;
        try {
            configObject = JSON.parse(fs.readFileSync(configFile));
        } catch (err) {
            console.error('  ' + TextStyles.txtError('JSON decode error: ' + err.message + ' (' + configFile + ').'));
        }

        if (
            !configObject || 
            !configObject[tasksRunnerRequiredProperty] || 
            typeof(configObject[tasksRunnerRequiredProperty]) !== 'boolean' ||
            configObject[tasksRunnerRequiredProperty] !== true
        ) {
            // if config file is not contain required property.
            this.#isWpDevApp = false;
            return false;
        }

        this.#isWpDevApp = true;
        return true;
    }// isValidConfig


    /**
     * Check is valid folder.
     * 
     * @param {string} cwdPath Current working directory path.
     * @returns {boolean} Return `true` when config file exists, `false` for otherwise.
     */
    isValidFolder(cwdPath) {
        const configFile = path.resolve(cwdPath, tasksRunnerConfig);

        return fs.existsSync(configFile);
    }// isValidFolder


}