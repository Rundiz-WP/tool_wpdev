/**
 * List WordPress core files PHP 
 * and collect all constants, functions, classes (include class's constant, properties, methods), hooks 
 * with their version number in comment code `@since`.
 * 
 * Save the collected data into single JSON file for use later.
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';
import _ from 'lodash';
import engine from 'php-parser';
// import command's worker
import JSONPathPHPWorker from './JSONPathPHPWorker.mjs';
// import libraries
import JSONPathPHP from '../../../../Libraries/JSONPathPHP.mjs';
import Path from '../../../../../app/Libraries/Path.mjs';
import PHPParser from '../../../../Libraries/PHPParser.mjs';
import TextStyles from '../../../../../app/Libraries/TextStyles.mjs';
// import dependencies


export const collectCoreCodePHP = class CollectCoreCodePHP {


    /**
     * @type {object} The CLI arguments.
     */
    #argv = {};


    /**
     * @type {object} Core codes grabbed from files.
     */
    #coreCodes = {};


    /**
     * @type {string} Debug folder name only, no path, no slash.
     */
    #debugDirName = '';


    /**
     * @type {boolean} Force use working directory and search PHP files for one level without care about WordPress structure.  
     *              This option is for unit test.
     */
    #forceWorkingDir1LV = false;


    /**
     * @type {string} Save processed data folder in full path. File name is not included.
     */
    #saveDir = '';


    /**
     * @type {string} Saved file path of buit list.
     */
    #savedFilePath = '';


    /**
     * @type {string} WordPress core version.
     */
    #wordpressVersion = '';


    /**
     * @type {string} Working directory where WordPress core installed. No trailing slash.
     */
    #workingDir = '';


    /**
     * Collect WordPress core version numbers
     * from constants, functions, classes (include class's constant, properties, methods), hooks.
     * 
     * @param {object} argv  The CLI arguments.
     * @param {object} options The options.
     * @param {string} options.debugDirName Debug folder name only, no path, no slash.
     * @param {string} options.saveDir Save processed data folder in full path. File name is not included.
     * @param {string} options.workingDir Working directory.
     * @param {string} options.wordpressVersion WordPress core version.
     * @param {boolean} options.forceWorkingDir1LV Force use working directory and search PHP files for one level  
     *              without care about WordPress structure.  
     *              This option is for unit test.
     */
    constructor(argv, options = {}) {
        if (typeof(argv) === 'object') {
            this.#argv = argv;
        }

        if (typeof(options.debugDirName) === 'string') {
            this.#debugDirName = options.debugDirName;
        }
        if (typeof(options.saveDir) === 'string') {
            this.#saveDir = options.saveDir;
        }
        if (typeof(options.workingDir) === 'string') {
            this.#workingDir = options.workingDir;
        }
        if (typeof(options.wordpressVersion) === 'string') {
            this.#wordpressVersion = options.wordpressVersion;
        }
        if (typeof(options.forceWorkingDir1LV) === 'boolean') {
            this.#forceWorkingDir1LV = options.forceWorkingDir1LV;
        }
    }// constructor


    /**
     * Getter save processed data file name (file name with extension), no path.
     * 
     * @returns {string} Return file name with extension.
     */
    get saveFileName() {
        let output = this.saveFileNamePrefix;
        if (this.#wordpressVersion !== '') {
            output += '-' + this.#wordpressVersion;
        }
        output += '.json';

        return output;
    }// saveFileName


    /**
     * Getter save processed data file name prefix only, no WP version, no extension, no path.
     * 
     * @returns {string} Return file name prefix.
     */
    get saveFileNamePrefix() {
        return '.requires-at-least_core-data-php_wordpress';
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
     * List WordPress files.
     * 
     * This method was called from `init()`.
     * 
     * @returns {string[]} Return array list of files name.
     */
    #listFiles() {
        const globOptions = {
            'cwd': this.#workingDir,
        };
        let files = [];

        if (!this.#argv.wpfile) {
            if (true === this.#forceWorkingDir1LV) {
                return fs.globSync('*.php', globOptions);
            }

            // if there is no option `--wpfile`.
            // list WordPress core files.
            let index = fs.globSync('index.php', globOptions);
            let wpRootFiles = fs.globSync('wp-*.php', globOptions);
            let wpAdmin = fs.globSync('wp-admin/**/*.php', globOptions);
            let wpIncludes = fs.globSync('wp-includes/**/*.php', globOptions);

            // put them into one variable.
            files = [...index, ...wpRootFiles, ...wpAdmin, ...wpIncludes];
            // clear all other variables to free memory.
            index = wpRootFiles = wpAdmin = wpIncludes = undefined;
        } else if (
            typeof(this.#argv.wpfile) === 'string' &&
            path.extname(this.#argv.wpfile).toLowerCase() === '.php'
        ) {
            // if there is option `--wpfile` specified.
            files = fs.globSync(path.basename(this.#argv.wpfile), globOptions);
        }// endif;

        return files;
    }// #listFiles


    /**
     * Parse code from files. Collect data with version number.
     * 
     * This method was called from `init()`.
     * 
     * @param {string[]} files Array list of files.
     */
    #parseCodeFromFiles(files) {
        // initialize a new parser instance
        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();

        // start to loop files. -----------------------------------------------
        for (const eachFile of files) {
            const eachFileFullPath = this.#workingDir + path.sep + eachFile;
            console.log('  ' + eachFileFullPath);

            const parsedCode = PHPParser.parseCode(eachFileFullPath);
            JSONPathPHPWorkerObj.setParsedCode(parsedCode);

            this.#saveParsedCodeToDebug(eachFileFullPath, parsedCode);

            // query for namespaces only; for use with all PHP code.
            const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);

            // process constants. --------------------------------
            // query for constant only.
            const constants = JSONPathPHPObj.queryPHPConstant(parsedCode);
            // get constant names with/without namespaces & with version number.
            JSONPathPHPWorkerObj.getConstants(namespaces, constants);
            this.#processedResults(JSONPathPHPWorkerObj.processedData);
            JSONPathPHPWorkerObj.resetProcessedData();

            // process functions. ---------------------------------
            // query for basic function, anonymous function, arrow function.
            const functions = JSONPathPHPObj.queryPHPFunction(parsedCode);
            const anonymousArrowFunctions = JSONPathPHPObj.queryPHPAnonymousAndArrowFunction(parsedCode);
            // get function names with/without namespaces & with version number.
            JSONPathPHPWorkerObj.getFunctions(namespaces, functions);
            JSONPathPHPWorkerObj.getAnonymousArrowFunctions(namespaces, anonymousArrowFunctions);
            this.#processedResults(JSONPathPHPWorkerObj.processedData, 'functions');
            JSONPathPHPWorkerObj.resetProcessedData();

            // process classes. -----------------------------------
            // query for basic class (explicit class), anonymous class.
            const classes = JSONPathPHPObj.queryPHPClass(parsedCode);
            const anonymousClasses = JSONPathPHPObj.queryPHPAnonymousClass(parsedCode);
            // get classes with its members (such as constant) with/without namsepaces & with version number.
            JSONPathPHPWorkerObj.getClasses(namespaces, classes);
            JSONPathPHPWorkerObj.getClasses(namespaces, anonymousClasses);
            this.#processedClassesResults(JSONPathPHPWorkerObj.processedData);
            JSONPathPHPWorkerObj.resetProcessedData();

            // process WP hook actions. ----------------------------
            // query for hook action.
            const hookActions = JSONPathPHPObj.queryWPPHPHookActions(parsedCode);
            // get hook actions.
            JSONPathPHPWorkerObj.getWPHooks(hookActions, parsedCode);
            this.#processedResults(JSONPathPHPWorkerObj.processedData, 'hook_actions');
            JSONPathPHPWorkerObj.resetProcessedData();

            // process WP hook filters. ----------------------------
            // query for hook filter.
            const hookFilters = JSONPathPHPObj.queryWPPHPHookFilters(parsedCode);
            // get hook filters.
            JSONPathPHPWorkerObj.getWPHooks(hookFilters, parsedCode);
            this.#processedResults(JSONPathPHPWorkerObj.processedData, 'hook_filters');
            JSONPathPHPWorkerObj.resetProcessedData();
        }// endfor; loop files -------------------------------------------------
    }// #parseCodeFromFiles


    /**
     * Store processed results of classes.
     * 
     * This method was called from `#parseCodeFromFiles()`.
     * 
     * @param {object} results The result processed from worker.
     */
    #processedClassesResults(results) {
        if (typeof(results) !== 'object') {
            throw new Error('The argument `results` must be object.');
        }
        const type = 'classes';

        if (!this.#coreCodes.hasOwnProperty(type)) {
            this.#coreCodes[type] = {};
        }

        for (const eachItem of results) {
            const className = Object.keys(eachItem)[0];
            if (typeof(className) === 'string') {
                if (!this.#coreCodes[type].hasOwnProperty(className)) {
                    this.#coreCodes[type][className] = {
                        'versions': [],
                        'members': {},
                    };

                    this.#processedSetVersions(
                        eachItem[className].versionDescription, 
                        this.#coreCodes[type][className].versions
                    );
                }

                for (const [memberName, memberObj] of Object.entries(eachItem[className]?.members)) {
                    if (typeof(memberName) === 'string') {
                        // if class's member name is string
                        if (!this.#coreCodes[type][className].members.hasOwnProperty(memberName)) {
                            // if member of class was not set before
                            this.#coreCodes[type][className].members[memberName] = {
                                'versions': [],
                            };
                        }// endif; member of class was not set before
                    }// endif; class's member name is string

                    if (
                        typeof(memberObj.versionDescription?.versions) !== 'undefined'
                    ) {
                        this.#processedSetVersions(
                            memberObj.versionDescription, 
                            this.#coreCodes[type][className].members[memberName].versions
                        );
                    }
                }// endfor; loop class's members (constants, properties, methods, ..)
            }// endif; class name is string
        }// endfor; results

        if (this.#argv.debug) {
            console.debug('    [debug] Stored processed "' + type + '".');
        }
    }// #processedClassesResults


    /**
     * Store versions & descriptions to this class's property.
     * 
     * @param {object} versionDescription The version object that must contain `.versions` property. This argument will be add to `coreCodesVersionsProperty`.
     * @param {Array} coreCodesVersionsProperty this class's property that contain `.versions` property to push versions into it.
     */
    #processedSetVersions(versionDescription, coreCodesVersionsProperty) {
        if (typeof(versionDescription) !== 'object') {
            throw new Error('The argment `versionDescription` must be object.');
        }
        if (typeof(coreCodesVersionsProperty) !== 'object' || !Array.isArray(coreCodesVersionsProperty)) {
            throw new Error('The argment `coreCodesVersionsProperty` must be array.');
        }

        if (typeof(versionDescription.versions) !== 'undefined') {
            let index = 0;
            for (const eachVersion of versionDescription.versions) {
                if (!_.some(coreCodesVersionsProperty, eachVersion)) {
                    let versionDescriptionFormatted = {};
                    versionDescriptionFormatted[eachVersion] = {
                        'description': versionDescription.descriptions[index],
                    };
                    coreCodesVersionsProperty.push(versionDescriptionFormatted);
                }
                ++index;
            }// endfor;
        }// endif;
    }// #processedSetVersions


    /**
     * Store processed results.
     * 
     * This method was called from `#parseCodeFromFiles()`.
     * 
     * @param {object} results The result processed from worker.
     * @param {string} type Process type. Accepted: 'constants', 'classes', 'functions', 'hook_actions', 'hook_filters'.
     */
    #processedResults(results, type = 'constants') {
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

        if (!this.#coreCodes.hasOwnProperty(type)) {
            this.#coreCodes[type] = {};
        }

        for (const eachItem of results) {
            if (!this.#coreCodes[type].hasOwnProperty(eachItem.name)) {
                this.#coreCodes[type][eachItem.name] = {};
            }

            if (
                typeof(this.#coreCodes[type][eachItem.name].versions) !== 'object' ||
                !Array.isArray(this.#coreCodes[type][eachItem.name].versions)
            ) {
                this.#coreCodes[type][eachItem.name] = {
                    'versions': [],
                };
            }

            if (
                typeof(eachItem.versionDescription) === 'object' && 
                typeof(eachItem.versionDescription.versions) !== 'undefined'
            ) {
                this.#processedSetVersions(
                    eachItem.versionDescription, 
                    this.#coreCodes[type][eachItem.name].versions
                );
            }
        }// endfor;

        if (this.#argv.debug) {
            console.debug('    [debug] Stored processed "' + type + '".');
        }
    }// #processedResults


    /**
     * Save processed data to file.
     * 
     * This method was called from `init()`.
     */
    #saveFile() {
        fs.writeFileSync(this.#savedFilePath, JSON.stringify(this.#coreCodes, null, 2));
        console.log(TextStyles.txtInfo('All code data saved to file ' + this.#savedFilePath + '.'));
    }// #saveFile


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
     * Initialize the class.
     */
    init() {
        console.log('This process can be very slow, please be patient.');

        if (this.#wordpressVersion !== '') {
            this.#coreCodes['WordPress'] = {
                'version': this.#wordpressVersion,
            }
        }

        this.savedFilePath;// call once to let it set property `#savedFilePath`.

        const files = this.#listFiles();
        this.#parseCodeFromFiles(files);
        this.#saveFile();
    }// init


}// ListCoreCodePHP
