/**
 * List files of your plugin, theme.  
 * Collect code call such as constants, functions, classes, hooks and then check agains WordPress core code `@since` data.
 * 
 * Save the processed data to report file.
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';
import _ from 'lodash';
import { compareVersions } from 'compare-versions';
// import command's worker
import JSONPathPHPCallerWorker from './JSONPathPHPCallerWorker.mjs';
import ReportGenerator from './reportGenerator.mjs';
// import libraries
import JSONPathPHP from '../../../../Libraries/JSONPathPHP.mjs';
import JSONPathPHPCaller from '../../../../Libraries/JSONPathPHPCaller.mjs';
import Path from '../../../../../app/Libraries/Path.mjs';
import PHPParser from '../../../../Libraries/PHPParser.mjs';
import TextStyles from '../../../../../app/Libraries/TextStyles.mjs';
// import dependencies
import { collectCoreCodePHP } from '../Collect/collectCoreCodePHP.mjs';


export const checkRepoPHP = class CheckRepoPHP {


    /**
     * @type {Object} The CLI arguments.
     */
    #argv = {};


    /**
     * @type {string} Debug folder name only, no path, no slash.
     */
    #debugDirName = '';


    /**
     * @type {string} PHP core codes (such as constants, functions) JSON file.
     */
    #phpCoreCodesFile = '';


    /**
     * @type {object} repository codes (plugin, theme) parsed from files.
     */
    #repoCodes = {};


    /**
     * @type {string} Save processed data folder in full path. File name is not included.
     */
    #saveDir = '';


    /**
     * @type {string} Saved file path of buit list.
     */
    #savedFilePath = '';


    /**
     * @type {string} Working directory where WordPress core installed. No trailing slash.
     */
    #workingDir = '';


    /**
     * @type {string} WordPress core data PHP file or name begins with ".requires-at-least_core-data-php*.json".
     */
    #WPCoreDataPHP = '';


    /**
     * Collect WordPress core version numbers
     * from constants, functions, classes (include class's constant, properties, methods), hooks.
     * 
     * @param {object} argv  The CLI arguments.
     * @param {object} options The options.
     * @param {string} options.debugDirName Debug folder name only, no path, no slash.
     * @param {string} options.phpCoreCodesFile PHP core codes JSON file.
     * @param {string} options.saveDir Save processed data folder in full path. File name is not included.
     * @param {string} options.workingDir Working directory.
     * @param {string} options.WPCoreDataPHP WordPress core data PHP file or default is ".requires-at-least_core-data-php*.json".
     */
    constructor(argv, options = {}) {
        if (typeof(argv) === 'object') {
            this.#argv = argv;
        }

        if (typeof(options.debugDirName) === 'string') {
            this.#debugDirName = options.debugDirName;
        }
        if (typeof(options.phpCoreCodesFile) === 'string') {
            this.#phpCoreCodesFile = options.phpCoreCodesFile;
        }
        if (typeof(options.saveDir) === 'string') {
            this.#saveDir = options.saveDir;
        }
        if (typeof(options.workingDir) === 'string') {
            this.#workingDir = options.workingDir;
        }
        if (typeof(options.WPCoreDataPHP) === 'string') {
            this.#WPCoreDataPHP = options.WPCoreDataPHP;
        }
    }// constructor


    /**
     * Getter save processed data file name (file name with extension), no path.
     * 
     * @returns {string} Return file name with extension.
     */
    get saveFileName() {
        let output = this.saveFileNamePrefix;
        output += '.json';

        return output;
    }// saveFileName


    /**
     * Getter save processed data file name prefix only, no WP version, no extension, no path.
     * 
     * @returns {string} Return file name prefix.
     */
    get saveFileNamePrefix() {
        return '.requires-at-least_check-data-php';
    }// saveFileNamePrefix

    
    /**
     * Getter save processed data file path.
     * 
     * This getter method will save processed full path name to property `#savedFilePath` 
     * and can be access from this property later without calling this again.
     * 
     * @returns {string} Return full path to saved file.
     */
    get savedFilePath() {
        if ('' !== this.#savedFilePath) {
            return this.#savedFilePath;
        }

        let filePath = this.#saveDir + path.sep + this.saveFileName;
        this.#savedFilePath = filePath;

        return this.#savedFilePath;
    }// savedFilePath


    /**
     * Check the code against WordPress core data.
     * 
     * This method was called from `#checkVersionStoreProcessedResults()`.
     * 
     * @param {string} name The code name to check against WP core data.
     * @param {string} type Process type. Accepted: 'constants', 'classes', 'functions', 'hook_actions', 'hook_filters'. 
     *              However, the class can check version only for class name only. The class member is not included.
     * @returns {object} Return object with property `min`, `max`. If found no version data then values of `min` and `max` will be `null`.
     */
    #checkAgainstWPCore(name, type = 'constants') {
        if (typeof(name) !== 'string') {
            throw new Error('The argument `name` must be string.');
        }
        if (
            ![
                'constants', 
                'functions', 
                'classes',
                'hook_actions', 
                'hook_filters',
            ].includes(type)
        ) {
            throw new Error('The value of argument `type` is not in accepted values.');
        }

        const wpCoreDataObj = this.#getWPCoreDataObj();

        if (
            typeof(wpCoreDataObj) === 'object' &&
            typeof(wpCoreDataObj[type]) === 'object' &&
            typeof(wpCoreDataObj[type][name]) === 'object' &&
            typeof(wpCoreDataObj[type][name].versions) === 'object' &&
            Array.isArray(wpCoreDataObj[type][name].versions) &&
            wpCoreDataObj[type][name].versions.length > 0
        ) {
            // if there is versions data on core.
            const tmpVersions = [];
            wpCoreDataObj[type][name].versions.forEach((item, index) => {
                tmpVersions.push(_.findKey(item));
            });

            const versionsSorted = tmpVersions.sort(compareVersions);
            const min = versionsSorted[0];
            const max = versionsSorted.at(-1);

            if (min !== '' && max !== '') {
                return {
                    'min': min,
                    'max': max,
                }
            }
        }// endif; there is versions data on core or not

        return {
            'min': null,
            'max': null,
        }
    }// #checkAgainstWPCore


    /**
     * Check version against core data and store processed results.
     * 
     * This method was called from `#parseCodeFromFiles()`.
     * 
     * @param {object} results The result processed from worker. Example data structure for constants, functions:
     *      ```
     *      [{
     *          name: 'codeName1',
     *      }, {
     *          ...
     *      }]
     *      ```
     * @param {string} type Process type. Accepted: 'constants', 'classes', 'functions', 'hook_actions', 'hook_filters'.
     */
    #checkVersionStoreProcessedResults(results, type = 'constants') {
        if (typeof(results) !== 'object') {
            throw new Error('The argument `results` must be object.');
        }
        if (typeof(type) !== 'string') {
            throw new Error('The argument `type` must be string.');
        }
        if (
            ![
                'constants', 
                'functions', 
                'hook_actions', 
                'hook_filters',
            ].includes(type)
        ) {
            throw new Error('The value of argument `type` is not in accepted values.');
        }

        if (!this.#repoCodes.hasOwnProperty(type)) {
            this.#repoCodes[type] = {};
        }

        for (const eachItem of results) {
            if (!this.#repoCodes[type].hasOwnProperty(eachItem.name)) {
                this.#repoCodes[type][eachItem.name] = {};
            }
            if (typeof(this.#repoCodes[type][eachItem.name].versions) !== 'object') {
                this.#repoCodes[type][eachItem.name].versions = {};
            }
            if (typeof(eachItem.file) === 'string' && typeof(this.#repoCodes[type][eachItem.name].file) !== 'string') {
                this.#repoCodes[type][eachItem.name].file = eachItem.file;
            }
            if (
                !isNaN(eachItem.line) && 
                typeof(this.#repoCodes[type][eachItem.name].line) !== 'string'
            ) {
                this.#repoCodes[type][eachItem.name].line = eachItem.line;
            }

            // check version.
            const coreVersions = this.#checkAgainstWPCore(eachItem.name, type);
            if (coreVersions.min !== null && coreVersions.max !== null) {
                // if core version data is not null.
                if (typeof(this.#repoCodes[type][eachItem.name].versions?.min) === 'undefined') {
                    // if there is no checked before.
                    this.#repoCodes[type][eachItem.name].versions = coreVersions;
                } else {
                    if (compareVersions(this.#repoCodes[type][eachItem.name].versions?.min, coreVersions.min, '>')) {
                        // if stored version is greater than core.
                        this.#repoCodes[type][eachItem.name].versions.min = coreVersions.min;
                    }
                    if (compareVersions(this.#repoCodes[type][eachItem.name].versions?.max, coreVersions.max, '>')) {
                        // if stored version is greater than core.
                        this.#repoCodes[type][eachItem.name].versions.max = coreVersions.max;
                    }
                }
            }// endif; core versions data is not null.
        }// endfor;

        if (this.#argv.debug) {
            console.debug('    [debug] Checked version & store processed "' + type + '".');
        }
    }// #checkVersionStoreProcessedResults


    /**
     * Check version against core data and store processed results.
     * 
     * This method was called from `#parseCodeFromFiles()`.
     * 
     * @param {object} results The result processed from worker. Example data structure for class:
     *      ```
     *      [{
     *          'Class1': {
     *              versions: {},
     *              unresolveName: <boolean> (optional),
     *              unresolveRemark: <string> (optional),
     *              members: {
     *                  'memberName': {
     *                      versions: {}
     *                  },
     *                  'memberName2': ...
     *              }
     *          }
     *      }, {
     *          'Class2': ...
     *      }]
     *      ```
     */
    #checkVersionStoreProcessedResultsForClass(results) {
        const type = 'classes';
        const wpCoreDataObj = this.#getWPCoreDataObj();

        if (!this.#repoCodes.hasOwnProperty(type)) {
            this.#repoCodes[type] = {};
        }

        for (const eachItem of results) {
            const className = Object.keys(eachItem)[0];
            if (!this.#repoCodes[type].hasOwnProperty(className)) {
                this.#repoCodes[type][className] = eachItem[className];
            }

            if (typeof(
                eachItem[className]?.unresolveName) === 'boolean' && 
                eachItem[className].unresolveName === true
            ) {
                // if found unresolved class name.
                // do not work here anymore.
                continue;
            }

            // check version for class itself, not its member. ---------------
            const coreClassVersions = this.#checkAgainstWPCore(className, type);
            if (coreClassVersions.min !== null && coreClassVersions.max !== null) {
                // if core version data is not null.
                if (typeof(this.#repoCodes[type][className].versions?.min) === 'undefined') {
                    // if there is no checked before.
                    this.#repoCodes[type][className].versions = coreClassVersions;
                } else {
                    if (compareVersions(this.#repoCodes[type][className].versions?.min, coreClassVersions.min, '>')) {
                        // if stored version is greater than core.
                        this.#repoCodes[type][className].versions.min = coreClassVersions.min;
                    }
                    if (compareVersions(this.#repoCodes[type][className].versions?.max, coreClassVersions.max, '>')) {
                        // if stored version is greater than core.
                        this.#repoCodes[type][className].versions.max = coreClassVersions.max;
                    }
                }
            }// endif; core versions data is not null.
            // end check version for class. ----------------------------------

            // check version for class members. ------------------------------
            if (typeof(this.#repoCodes[type][className]?.members) === 'object') {
                for (const [memberName, memberValue] of Object.entries(this.#repoCodes[type][className].members)) {
                    if (
                        typeof(wpCoreDataObj[type][className]) !== 'object' ||
                        typeof(wpCoreDataObj[type][className].members) !== 'object' ||
                        typeof(wpCoreDataObj[type][className].members[memberName]) !== 'object'
                    ) {
                        // if not found this class or member in wp core.
                        continue;
                    }// endif;

                    const tmpVersions = [];
                    wpCoreDataObj[type][className].members[memberName]?.versions.forEach((item, index) => {
                        tmpVersions.push(_.findKey(item));
                    });

                    const versionsSorted = tmpVersions.sort(compareVersions);
                    const min = versionsSorted[0];
                    const max = versionsSorted.at(-1);

                    if (min !== '' && max !== '') {
                        if (typeof(this.#repoCodes[type][className].members[memberName]?.versions?.min) === 'undefined') {
                            // if there is no checked before.
                            this.#repoCodes[type][className].members[memberName].versions = {
                                'min': min,
                                'max': max,
                            };
                        } else {
                            if (compareVersions(this.#repoCodes[type][className].members[memberName].versions?.min, min, '>')) {
                                // if stored version is greater than core.
                                this.#repoCodes[type][className].members[memberName].versions.min = min;
                            }
                            if (compareVersions(this.#repoCodes[type][className].members[memberName].versions?.max, max, '>')) {
                                // if stored version is greater than core.
                                this.#repoCodes[type][className].members[memberName].versions.max = max;
                            }
                        }
                    }// endif; not empty min, max
                }// endfor; loop class members
            }// endif;
            // end check version for class members. --------------------------
        }// endfor;

        if (this.#argv.debug) {
            console.debug('    [debug] Checked version & store processed "' + type + '".');
        }
    }// #checkVersionStoreProcessedResultsForClass


    /**
     * Get WordPress core data object.
     * 
     * This method was called from `#checkAgainstWPCore()`.
     * @returns {object}
     */
    #getWPCoreDataObj() {
        if (fs.existsSync(this.#WPCoreDataPHP)) {
            const fileContent = fs.readFileSync(this.#WPCoreDataPHP);
            return JSON.parse(fileContent);
        } else {
            console.error(TextStyles.txtError('The WordPress core data file does not exists (' + this.#WPCoreDataPHP + ').'));
        }
    }// #getWPCoreDataObj


    /**
     * List PHP files from `--dir`.
     * 
     * This method was called from `init()`.
     * 
     * @returns {string[]} Return array list of files name.
     */
    #listFiles() {
        let exclude = undefined;
        if (this.#argv.excludePattern) {
            exclude = this.#argv.excludePattern;
        }
        const globOptions = {
            'cwd': this.#workingDir,
            'exclude': exclude,
        };
        const files = fs.globSync('**/*.php', globOptions);

        if (files.length > 0) {
            return files;
        } else {
            console.info(TextStyles.txtInfo('Not found any PHP files on this location (' + this.#workingDir + ').'));
            return [];
        }
    }// #listFiles


    
    /**
     * Parse code from files and check against WordPress core data for version requirements.
     * 
     * This method was called from `init()`.
     * 
     * @param {string[]} files Array list of files.
     */
    #parseCodeFromFiles(files) {
        // initialize a new parser instance
        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker(this.#argv);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(this.#phpCoreCodesFile);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(this.#WPCoreDataPHP);
        console.log('Parsing files and check version.');

        // start to loop files. -----------------------------------------------
        for (const eachFile of files) {
            const eachFileFullPath = this.#workingDir + path.sep + eachFile;
            JSONPathPHPCallerWorkerObj.setCurrentCallerFile(eachFileFullPath);
            console.log('  ' + eachFileFullPath);

            const parsedCode = PHPParser.parseCode(eachFileFullPath);

            this.#saveParsedCodeToDebug(eachFileFullPath, parsedCode);
            JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);

            // query for namespaces only; for use with all PHP code.
            const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);

            // process constants calls. --------------------------
            // query for constant only.
            const constants = JSONPathPHPCallerObj.queryPHPConstant(parsedCode);
            // get constant names without version number.
            JSONPathPHPCallerWorkerObj.getConstants(namespaces, constants);
            // check version and store processed results then reset process data on worker's property.
            this.#checkVersionStoreProcessedResults(JSONPathPHPCallerWorkerObj.processedData);
            JSONPathPHPCallerWorkerObj.resetProcessedData();

            // process functions calls. --------------------------
            // query for function only.
            const functions = JSONPathPHPCallerObj.queryPHPFunction(parsedCode);
            // get function names without version number.
            JSONPathPHPCallerWorkerObj.getFunctions(namespaces, functions);
            // check version and store processed results then reset process data on worker's property.
            this.#checkVersionStoreProcessedResults(JSONPathPHPCallerWorkerObj.processedData, 'functions');
            JSONPathPHPCallerWorkerObj.resetProcessedData();

            // process classes. -----------------------------------
            const classes = JSONPathPHPCallerObj.queryPHPClass(parsedCode);
            // get class names without version number.
            JSONPathPHPCallerWorkerObj.getClasses(namespaces, classes);
            // check version and store processed results then reset process data on worker's property.
            this.#checkVersionStoreProcessedResultsForClass(JSONPathPHPCallerWorkerObj.processedData);
            JSONPathPHPCallerWorkerObj.resetProcessedData();

            // get both hook actions and filters at once.
            JSONPathPHPCallerWorkerObj.getWPHooks(parsedCode, namespaces);
            // process WP hook actions. ----------------------------
            this.#checkVersionStoreProcessedResults(JSONPathPHPCallerWorkerObj.processedData.hook_actions, 'hook_actions');
            // do not reset processed data yet.
            // process WP hook filters. ----------------------------
            this.#checkVersionStoreProcessedResults(JSONPathPHPCallerWorkerObj.processedData.hook_filters, 'hook_filters');
            JSONPathPHPCallerWorkerObj.resetProcessedData();
        }// endfor; loop files -------------------------------------------------
    }// #parseCodeFromFiles
    

    /**
     * Save parsed code to debug file.
     * 
     * This method was called from `#parseCodeFromFiles()`.
     * 
     * @param {string} file A source file full path.
     * @param {object} parsedCode The parsed code to save to debug file.
     */
    #saveParsedCodeToDebug(file, parsedCode) {
        if (typeof(file) !== 'string') {
            throw new Error('The argument `file` must be string.');
        }
        if (typeof(parsedCode) !== 'object') {
            throw new Error('The argument `parsedCode` must be object.');
        }

        if (this.#argv.debug) {
            const jsonContent = JSON.stringify(parsedCode, null, 2);
            const regexRemoveWorkingDir = new RegExp('^' + RegExp.escape(this.#workingDir));
            const fileRemoveCWD = Path.removeBeginSlash(file.replace(regexRemoveWorkingDir, ''));
            const debugFile = this.#saveDir + path.sep + this.#debugDirName + path.sep + fileRemoveCWD + '.json';

            // show where AST save to file. (Abstract Syntax Tree).
            console.debug('    [debug] Save AST to file: ', debugFile);

            if (!fs.existsSync(path.dirname(debugFile))) {
                fs.mkdirSync(path.dirname(debugFile), {'recursive': true});
            }
            fs.writeFileSync(debugFile, jsonContent);
        }// endif; debug.
    }// #saveParsedCodeToDebug
    
    
    /**
     * Save processed data to file.
     * 
     * This method was called from `init()`.
     */
    #saveFile() {
        fs.writeFileSync(this.#savedFilePath, JSON.stringify(this.#repoCodes, null, 2));
        console.log(TextStyles.txtInfo('All check data saved to file ' + this.#savedFilePath + '.'));

        const reportGeneratorObj = new ReportGenerator(this.#argv, {
            'checkDataPHPJSON': this.#savedFilePath,
            'saveDir': this.#saveDir,
        });

        try {
            if (true === reportGeneratorObj.generate()) {
                console.log(TextStyles.txtSuccess('Report file was generated at :' + reportGeneratorObj.reportFilePath + '".'));
            } else {
                console.error(TextStyles.txtError('Failed to generate report file at :' + reportGeneratorObj.reportFilePath + '".'));
            }
        } catch (error) {
            console.error(TextStyles.txtError(error.message));
        }
    }// #saveFile


    /**
     * Setup WordPress core code data file (".requires-at-least_core-data-php").
     * 
     * This method was called from `init()`.  
     * This method will set property `#WPCoreDataPHP`.
     */
    #setWPCoreDataPHP() {
        const wpCoreDataPHPStat = fs.statSync(this.#WPCoreDataPHP);
        if (!wpCoreDataPHPStat.isFile()) {
            const collectCoreCodePHPObj = new collectCoreCodePHP(this.#argv);
            const files = fs.globSync(collectCoreCodePHPObj.saveFileNamePrefix + '*.json', {
                'cwd': this.#WPCoreDataPHP,
            });

            if (!Array.isArray(files)) {
                console.error(TextStyles.txtError('There is no WordPress core data file at "' + this.#WPCoreDataPHP + '".'));
                process.exit(1);
            }
            this.#WPCoreDataPHP = this.#WPCoreDataPHP + path.sep + files[0];
        }

        console.log(TextStyles.txtInfo('The core data file "' + this.#WPCoreDataPHP + '" will be use.'));
    }// #setWPCoreDataPHP


    /**
     * Initialize the class.
     */
    init() {
        console.log('This process can be very slow, please be patient.');

        this.#setWPCoreDataPHP();

        this.savedFilePath;// call once to let it set property `#savedFilePath`.

        const files = this.#listFiles();
        this.#parseCodeFromFiles(files);
        this.#saveFile();
    }// init


}// CheckRepoPHP
