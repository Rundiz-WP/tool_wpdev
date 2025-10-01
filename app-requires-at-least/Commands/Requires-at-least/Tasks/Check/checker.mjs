/**
 * Files and folders structure checker. 
 * 
 * Check that WordPress core data file exists (.requires-at-least_core-data-php*.json).
 */


'use strict';


import * as child_process from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { deleteAsync } from 'del';
// import dependencies
import { collectCoreCodePHP } from '../Collect/collectCoreCodePHP.mjs';
// import libraries
import Path from '../../../../../app/Libraries/Path.mjs';
import TextStyles from '../../../../../app/Libraries/TextStyles.mjs';


export const checker = class Checker {


    /**
     * @type {object} The CLI arguments.
     */
    #argv = {};


    /**
     * @type {string} PHP core codes (such as constants, functions) in JSON file.
     */
    #phpCoreCodesFile = '';


    /**
     * @type {string} Save processed data directory. File name is not included.
     */
    #saveDir = '';


    /**
     * @type {string} Working directory where WordPress core installed. No trailing slash.
     */
    #workingDir = '';


    /**
     * @type {string} WordPress core data PHP file or by default is ".requires-at-least_core-data-php*.json". This value can be path to folder or a file.
     */
    #WPCoreDataPHP = '';


    /**
     * Files and folders structure checker.
     * 
     * @param {object} argv  The CLI arguments.
     */
    constructor(argv) {
        if (typeof(argv) === 'object') {
            this.#argv = argv;
        }
    }// constructor


    /**
     * Getter debug folder name.
     * 
     * @returns {string} Return debug folder name only, no path, no slash.
     */
    get debugDirName() {
        return '.required-at-least-debug';
    }// debugDirName


    /**
     * Getter PHP core codes file.
     */
    get phpCoreCodesFile() {
        return this.#phpCoreCodesFile;
    }// phpCoreCodesFile


    /**
     * Getter `saveDir`. To use, call `thisClass.saveDir` as property.
     * 
     * @returns {string} Save processed data folder in full path. File name is not included.
     */
    get saveDir() {
        return this.#saveDir;
    }// saveDir


    /**
     * Getter WordPress core data PHP file or by default is ".requires-at-least_core-data-php*.json".
     */
    get WPCoreDataPHP() {
        return this.#WPCoreDataPHP;
    }// WPCoreDataPHP


    /**
     * Build PHP core codes JSON file.
     */
    #buildPHPCoreCodesFile() {
        const preparePHPCoreCodesFolder = path.normalize(NODETASKS_DIR + '/app-requires-at-least/Commands/Requires-at-least/Tasks/Check');
        const execResult = child_process.execSync('php "' + preparePHPCoreCodesFolder + '/prepare-php-core-codes.php"');
        let phpCoreCodesFolder = this.#saveDir;
        if (fs.existsSync(this.#WPCoreDataPHP)) {
            const statWPCoreDataPHP = fs.statSync(this.#WPCoreDataPHP);
            if (statWPCoreDataPHP.isDirectory()) {
                phpCoreCodesFolder = this.#WPCoreDataPHP;
            } else {
                phpCoreCodesFolder = path.dirname(this.#WPCoreDataPHP);
            }
        }
        const phpCoreCodesFilePath = path.normalize(phpCoreCodesFolder + '/.php-core-codes.json');

        if (execResult.toString() === 'success') {
            if (fs.existsSync(phpCoreCodesFilePath)) {
                fs.unlinkSync(phpCoreCodesFilePath);
            }
            fs.renameSync(preparePHPCoreCodesFolder + '/.php-core-codes.json', phpCoreCodesFilePath);

            if (!fs.existsSync(phpCoreCodesFilePath)) {
                console.error(TextStyles.txtError('The prepare PHP core codes data file is unable to created. (' + phpCoreCodesFilePath + ').'));
                process.exit(1);
            } else {
                this.#phpCoreCodesFile = phpCoreCodesFilePath;
                console.log(TextStyles.txtInfo('Prepared PHP core codes at "' + this.#phpCoreCodesFile + '".'));
            }
        } else {
            console.error(TextStyles.txtError('Unable to prepare PHP core codes data.'));
            process.exit(1);
        }
    }// #buildPHPCoreCodesFile

    
    /**
     * Prepare folders such as debug folder, save processed data folder.
     * 
     * @async
     */
    async #prepareFolders() {
        // prepare debug folder if not exists and in debug mode. ---
        if (this.#argv.debug) {
            // if user specified `--debug` mode.
            const deleteOptions = {
                'cwd': this.#saveDir,
            };

            try {
                await deleteAsync([this.debugDirName + '/**'], deleteOptions);
                await deleteAsync([this.debugDirName], deleteOptions);
                if (!fs.existsSync(this.#saveDir + path.sep + this.debugDirName)) {
                    fs.mkdirSync(this.#saveDir + path.sep + this.debugDirName, {'recursive': true});
                }
                console.debug('[debug] Debug mode on.');
            } catch (error) {
                console.error(TextStyles.txtError('Error (000): ' + error.message));
                process.exit(1);
            }
        }

        // prepare save folder if not exists. -----------------------
        if (!fs.existsSync(this.#saveDir)) {
            // if save folder is not exists.
            try {
                fs.mkdirSync(this.#saveDir, {'recursive': true});

                if (this.#argv.debug) {
                    console.debug('[debug] Save folder does not exists. Created at ' + this.#saveDir + '.');
                }
            } catch (error) {
                console.error(TextStyles.txtError('Error (001): ' + error.message));
                process.exit(1);
            }
        }// endif;
    }// #prepareFolders


    /**
     * Check for files and folders are correct.
     * 
     * If something failed, show the error message and exit program.
     * 
     * @returns {Promise} Return `Promise` with value of working folder (see option `--dir`).
     */
    async check() {
        // setup working folder variable. --------------------------------------------
        let working_dir = CW_DIR;
        if (this.#argv.dir) {
            working_dir = path.normalize(this.#argv.dir);
        }
        working_dir = Path.removeTrailingQuotes(working_dir);
        working_dir = Path.removeTrailingSlash(working_dir);
        this.#workingDir = working_dir;

        // setup WP core data PHP file variable. -------------------------------------
        let WPCoreDataPHP = working_dir;
        if (this.#argv.wpCoreDataPhp) {
            WPCoreDataPHP = path.normalize(this.#argv.wpCoreDataPhp);
            WPCoreDataPHP = Path.removeTrailingQuotes(WPCoreDataPHP);
            WPCoreDataPHP = Path.removeTrailingSlash(WPCoreDataPHP);
        }
        this.#WPCoreDataPHP = WPCoreDataPHP;
        
        // setup save folder variable. ------------------------------------------------
        let save_dir = working_dir;
        if (typeof(this.#argv.savedir) === 'string' && this.#argv.savedir.trim() !== '') {
            save_dir = path.normalize(this.#argv.savedir.trim());
            save_dir = Path.removeTrailingQuotes(save_dir);
            save_dir = Path.removeTrailingSlash(save_dir);
        }
        this.#saveDir = save_dir;

        // check working folder is correct. ------------------------------------------
        if (!fs.existsSync(this.#workingDir)) {
            console.error(TextStyles.txtError('Current working directory is not exists. Please make sure that current working directory or the option `--dir` is correct.'));
            process.exit(1);
        } else {
            const workingDirStat = fs.statSync(this.#workingDir);
            if (!workingDirStat.isDirectory()) {
                console.error(TextStyles.txtError('Current working directory is not a folder. Please specify `--dir` to folder instead.'));
                process.exit(1);
            }
        }

        // check for file ".requires-at-least_core-data-php*.json". ------------------
        if (fs.existsSync(this.#WPCoreDataPHP)) {
            const wpCoreStat = fs.statSync(this.#WPCoreDataPHP);
            if (!wpCoreStat.isFile()) {
                const collectCoreCodePHPObj = new collectCoreCodePHP(this.#argv);
                const checkFiles = fs.globSync(collectCoreCodePHPObj.saveFileNamePrefix + '*.json', {
                    'cwd': this.#WPCoreDataPHP,
                });
                if (!Array.isArray(checkFiles) || checkFiles.length <= 0) {
                    this.#WPCoreDataPHP += path.sep + collectCoreCodePHPObj.saveFileNamePrefix + '.json';
                }
            }
        }
        if (this.#WPCoreDataPHP === '' || !fs.existsSync(this.#WPCoreDataPHP)) {
            console.error(TextStyles.txtError('Could not found WordPress core data file at "' + this.#WPCoreDataPHP + '".'));
            process.exit(1);
        }

        // check for save folder is correct. -----------------------------------------
        if (fs.existsSync(this.#saveDir)) {
            // if `#saveDir` exists.
            // check that it really is folder. otherwise display error and end process.
            const saveDirStat = fs.statSync(this.#saveDir);
            if (!saveDirStat.isDirectory()) {
                // if `#saveDir` is not a folder.
                console.error(TextStyles.txtError('The save report folder really is a file. Please specify `--savedir` to a folder instead.'));
                process.exit(1);
            }
        }

        await this.#prepareFolders();
        this.#buildPHPCoreCodesFile();
        return Promise.resolve(this.#workingDir);
    }// check


}// Checker
