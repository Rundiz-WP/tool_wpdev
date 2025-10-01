/**
 * Node tasks Configuration class of this tasks runner app folder (not in cwd).
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';


const NtDefaultConfig = 'config/default.json';


export default class NtConfig {

    
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
     * Get Node tasks default config file name.
     * 
     * @returns {String} Return Node tasks default config file name.
     */
    static NtDefaultConfig() {
        return NtDefaultConfig;
    }// NtDefaultConfig


    /**
     * Get value of selected property name.
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
     * @returns {Object} Return JSON object of config.json file.
     */
    loadConfigJSON() {
        const configJSONFile = path.resolve(NODETASKS_DIR, 'config/config.json');
        return JSON.parse(fs.readFileSync(configJSONFile));
    }// loadConfigJSON

    
}