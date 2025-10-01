/**
 * Files and folders structure checker. 
 * 
 * Check that current working directory is WordPress installed folder or required file exists.
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';
import { deleteAsync } from 'del';
// import libraries
import Path from '../../../../../app/Libraries/Path.mjs';
import TextStyles from '../../../../../app/Libraries/TextStyles.mjs';


export const checker = class Checker {


    /**
     * @type {object} The CLI arguments.
     */
    #argv = {};


    /**
     * @type {string} Save processed data directory. File name is not included.
     */
    #saveDir = '';


    /**
     * @type {string} Working directory where WordPress core installed. No trailing slash.
     */
    #workingDir = '';


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
     * Getter `saveDir`. To use, call `thisClass.saveDir` as property.
     * 
     * @returns {string} Save processed data folder in full path. File name is not included.
     */
    get saveDir() {
        return this.#saveDir;
    }// saveDir


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
     * Check required files, folders and prepare save folder.
     * 
     * This method will display error and stop process if failed to check.
     * 
     * @async
     * @returns {Promise} Return `Promise` on success with working folder data.
     */
    async check() {
        if (this.#argv.wpdir && this.#argv.wpfile) {
            console.error(TextStyles.txtError('Cannot use option `--wpdir` with `--wpfile`.'));
            process.exit(1);
        }

        // setup working folder variable. --------------------------------------------
        let working_dir = CW_DIR;
        if (this.#argv.wpdir) {
            working_dir = this.#argv.wpdir;
        } else if (this.#argv.wpfile) {
            working_dir = path.dirname(this.#argv.wpfile);
        }
        working_dir = Path.removeTrailingQuotes(working_dir);
        working_dir = Path.removeTrailingSlash(working_dir);
        this.#workingDir = working_dir;

        // setup save folder variable. ------------------------------------------------
        let save_dir = working_dir;
        if (typeof(this.#argv.savedir) === 'string' && this.#argv.savedir.trim() !== '') {
            save_dir = this.#argv.savedir;
            save_dir = Path.removeTrailingQuotes(save_dir);
            save_dir = Path.removeTrailingSlash(save_dir);
        }
        this.#saveDir = save_dir;

        // check WordPress installed folder or specified file `--wpfile` exists. -----
        let validWPDir = false;
        if (
            !this.#argv.wpfile &&
            typeof(working_dir) === 'string' &&
            working_dir !== '' &&
            fs.existsSync(working_dir + '/wp-login.php') &&
            fs.existsSync(working_dir + '/wp-admin/admin.php') &&
            fs.existsSync(working_dir + '/wp-admin/includes') &&
            fs.existsSync(working_dir + '/wp-includes/class-wpdb.php') &&
            fs.existsSync(working_dir + '/wp-includes/assets')
        ) {
            // if not use option `--wpfile`; whether there is option `--wpdir` specified or not.
            validWPDir = true;
        } else if (
            typeof(this.#argv.wpfile) === 'string' && 
            this.#argv.wpfile !== '' &&
            fs.existsSync(this.#argv.wpfile)
        ) {
            // if use option `--wpfile` and file exists.
            validWPDir = true;
        }// endif;

        // check `#saveDir` is folder not file.
        if (fs.existsSync(this.#saveDir)) {
            // if `#saveDir` exists.
            // check that it really is folder. otherwise display error and end process.
            const saveDirStat = fs.statSync(this.#saveDir);
            if (!saveDirStat.isDirectory()) {
                // if `#saveDir` is not a folder.
                console.error(TextStyles.txtError('The save process data folder path really is a file. Please specify `--savedir` to a folder instead.'));
                process.exit(1);
            }
        }

        // finishing check process. ---------------------------------------------------
        if (false === validWPDir) {
            // if invalid WordPress folder or `--wpfile` does not exists.
            if (this.#argv.wpfile) {
                console.error(TextStyles.txtError('The specified file could not be found. (' + this.#argv.wpfile + ')'));
            } else {
                console.error(TextStyles.txtError('Current working folder is not WordPress installed folder. (' + working_dir + ')'));
                if (!this.#argv.wpdir) {
                    console.error(TextStyles.txtError('Please use option `--wpdir` to specify WordPress installed folder.'));
                }
            }
            process.exit(1);
        } else {
            // if valid WordPress folder or `--wpfile` exists.
            await this.#prepareFolders();
            return Promise.resolve(this.#workingDir);
        }// endif;
    }// check


    /**
     * Get WordPress core version.
     * 
     * @param {string} workingDir Working folder to get WordPress file and its version.
     * @returns {string} Return empty string if working with one file or WordPress file not found, return version number if found.
     */
    getWPVersion(workingDir) {
        if (typeof(workingDir) !== 'string') {
            throw new Error('The argument `workingDir` must be string.');
        }

        if (this.#argv.wpfile) {
            return '';
        }

        const versionFile = workingDir + path.sep + 'wp-includes' + path.sep + 'version.php';
        if (!fs.existsSync(versionFile)) {
            if (this.#argv.debug) {
                console.debug('[debug] Could not found version.php file.');
            }
            return '';
        }

        const fileContents = fs.readFileSync(versionFile);
        const matched = fileContents.toString().match(/\$wp_version\s+=\s+[\'\"](?<version>.+?)[\'\"];/);
        if (typeof(matched.groups.version) === 'string') {
            return matched.groups.version.trim();
        }
        return '';
    }// getWPVersion


}// Checker
