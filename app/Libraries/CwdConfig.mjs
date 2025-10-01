/**
 * Tasks Configuration class for load config file at current working directory.
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';
// import libraries.
import NtConfig from './NtConfig.mjs';
import TasksRunnerChecker from './TasksRunnerChecker.mjs';
import TextStyles from './TextStyles.mjs';


export default class CwdConfig {

    
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
     * Get value of selected property name.
     * 
     * If config file from project path is not exists, it will use default config from this app.  
     * This means if config file from project path exists, all properties will be load from there.
     * 
     * @param {mixed} propertyName The config.json property name.
     * @param {string} defaults Default value if not found.
     * @returns {mixed}
     */
    getValue(propertyName, defaults = '') {
        const configJSON = this.loadConfigJSON();

        if (typeof(configJSON) === 'object' && typeof(configJSON[propertyName]) !== 'undefined') {
            return configJSON[propertyName];
        }
        return defaults;
    }// getValue


    /**
     * Load config.json into object.
     * 
     * If config file from project path is not exists, it will use default config from this app.
     * 
     * @returns {Object} Return JSON object of config.json file.
     */
    loadConfigJSON() {
        let configJSONFile = path.resolve(CW_DIR, TasksRunnerChecker.tasksRunnerConfig());
        if (!fs.existsSync(configJSONFile)) {
            configJSONFile = path.resolve(NODETASKS_DIR, NtConfig.NtDefaultConfig());
            if (!fs.existsSync(configJSONFile)) {
                return {};
            }
        }
        try {
            return JSON.parse(fs.readFileSync(configJSONFile));
        } catch (err) {
            console.error('  ' + TextStyles.txtError('JSON decode error: ' + err.message + ' (' + configJSONFile + ').'));
            return {};
        }
    }// loadConfigJSON

    
}