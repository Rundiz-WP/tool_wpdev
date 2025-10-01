/**
 * Build core code data for another tests. This will work on `collect` command.
 */


'use strict';


import { fileURLToPath } from 'node:url';
import * as child_process from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {expect, jest, test} from '@jest/globals';
// import tasks
import { collectCoreCodePHP } from '../../../../../../../app-requires-at-least/Commands/Requires-at-least/Tasks/Collect/collectCoreCodePHP.mjs';


export default class CollectTestDepend {


    /**
     * @type {string} Full path to core code processed file.
     */
    coreCodeSavedFilePath = '';


    /**
     * @type {string} Full path to PHP core codes file.
     */
    phpCoreCodesFilePath = '';


    /**
     * @type {boolean} Mark is skip build core code file or not
     */
    skipBuildFile = false;


    /**
     * @type {string} Full path to folder that contain PHP core codes JSON file.
     */
    get preparePHPCoreCodesFolder() {
        return path.dirname(NODETASKS_DIR) + '/app-requires-at-least/Commands/Requires-at-least/Tasks/Check';
    }// preparePHPCoreCodesFolder


    /**
     * Check if file is older than n minutes.
     * 
     * This method does not check for file exists.
     * 
     * @param {string} filePath 
     * @param {number} minutesThreshold 
     * @returns 
     */
    #isFileOlderThan(filePath, minutesThreshold) {
        const stats = fs.statSync(filePath);
        const modificationTime = stats.mtime.getTime();
        const currentTime = Date.now();

        const ageInMilliseconds = currentTime - modificationTime;
        const ageInMinutes = ageInMilliseconds / (1000 * 60);

        return ageInMinutes > minutesThreshold;
    }// #isFileOlderThan


    /**
     * Initialize the class.
     */
    init() {
        afterAll(() => {
            if (fs.existsSync(this.preparePHPCoreCodesFolder + '/.php-core-codes.json')) {
                fs.unlinkSync(this.preparePHPCoreCodesFolder + '/.php-core-codes.json');
            }
        });


        beforeAll(async () => {
            // create fixture of code `@since` built result for common use later.
            const __filename = fileURLToPath(import.meta.url);
            global.NODETASKS_DIR = path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(__filename)))))));
            global.CW_DIR = NODETASKS_DIR;// should be at .tests folder

            const argv = {
                'wpdir': path.normalize(CW_DIR + '/wpdev/app-requires-at-least/.phps'),
                'savedir': path.normalize(path.dirname(CW_DIR) + '/.requires-at-least'),
            };
            if (!fs.existsSync(argv.savedir)) {
                fs.mkdirSync(argv.savedir, {recursive: true});
            }

            const workingDir = argv.wpdir;
            const saveDir = argv.savedir;
            const wordpressVersion = '0.0.0-testonly';
            const collectCoreCodePHPObj = new collectCoreCodePHP(argv, {
                'saveDir': saveDir,
                'wordpressVersion': wordpressVersion,
                'workingDir': workingDir,
                'forceWorkingDir1LV': true,
            });
            const coreDataSavedFilePath = collectCoreCodePHPObj.savedFilePath;
            const phpCoreCodesFilePath = path.normalize(path.dirname(CW_DIR) + '/.requires-at-least/.php-core-codes.json');

            if (fs.existsSync(coreDataSavedFilePath) && fs.existsSync(phpCoreCodesFilePath)) {
                const fileNotOlderThanMin = 5;
                if (
                    this.#isFileOlderThan(coreDataSavedFilePath, fileNotOlderThanMin) ||
                    this.#isFileOlderThan(phpCoreCodesFilePath, fileNotOlderThanMin)
                ) {
                    fs.unlinkSync(coreDataSavedFilePath);
                    fs.unlinkSync(phpCoreCodesFilePath);
                } else {
                    this.skipBuildFile = true;
                    this.coreCodeSavedFilePath = coreDataSavedFilePath;
                    this.phpCoreCodesFilePath = phpCoreCodesFilePath;
                    return ;
                }
            }

            const preparePHPCoreCodesFolder = this.preparePHPCoreCodesFolder;
            const execResult = child_process.execSync('php "' + preparePHPCoreCodesFolder + '/prepare-php-core-codes.php"');
            if (execResult.toString() === 'success') {
                // use loop to copy file because some time test runs use same dependent multiple times and cause file locked error.
                let i = 0;
                do {
                    try {
                        if (fs.existsSync(preparePHPCoreCodesFolder + '/.php-core-codes.json')) {
                            fs.copyFileSync(preparePHPCoreCodesFolder + '/.php-core-codes.json', phpCoreCodesFilePath);
                        }
                        break;
                    } catch (error) {
                        ++i;
                        if (i > 10) {
                            throw error;
                        }
                    }
                } while (false);

                if (!fs.existsSync(phpCoreCodesFilePath)) {
                    throw new Error('The prepare PHP core codes data file is unable to created. (' + phpCoreCodesFilePath + ').');
                }
            } else {
                throw new Error('Unable to prepare PHP core codes data.');
            }
            this.phpCoreCodesFilePath = phpCoreCodesFilePath;

            jest.spyOn(console, 'log').mockImplementation(() => {});// mute console.log
            collectCoreCodePHPObj.init();
            jest.restoreAllMocks();// restore mute

            this.coreCodeSavedFilePath = collectCoreCodePHPObj.savedFilePath;
            if (!fs.existsSync(this.coreCodeSavedFilePath)) {
                throw new Error('The expected core data file is not created. (' + this.coreCodeSavedFilePath + ').');
            }
        });
    }// init


}// CollectTestDepend
