/**
 * Pack files and folders into zip and save in ".dist" folder.
 * 
 * config.json example:
```
    "pack": {
        "versionHeaderFile": "readme.txt",
        "versionPattern": "Stable tag(\\s?)(:?)(\\s?)(?<version>[\\d\\.]+)",// must contain `?<version>` tag in the pattern.
        "packPatterns": {
            // see more in ./clean.mjs file.
        },
        "zipFilePrefix": "myplugin",
        "zipOptions": {
            "zipPrefix": "myplugin"// it will be zip files and folder inside myplugin/.
        }
    }
```
 */


'use strict';


import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';
// import libraries.
import FS from '../../../Libraries/FS.mjs';
import TextStyles from "../../../Libraries/TextStyles.mjs";
// import tasks.
import { clean } from "./clean.mjs";
import { packageJson } from './packageJson.mjs';


/**
 * @type {string} A file that contain version header of plugin or theme. This is default value if it is missing in config.json.
 */
const defaultVersionHeaderFile = 'readme.txt';

/**
 * @type {string} The default regular expression pattern for retrieve version number. This must contain `?<version>` tag in the pattern.
 */
const defaultVersionPattern = '@version(\\s?)(:?)(\\s?)(?<version>([\\d\\.]+)([-+\\.0-9a-z]*))';


export const pack = class Pack {


    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};


    /**
     * @type {string} The repository version number. (plugin or theme version number.) This will be changed once called `createZip()` method.
     */
    repoVersion = 'unknown';

    
    /**
     * Create zip archive files and folders.
     * 
     * @link https://www.archiverjs.com/docs/archiver Document.
     * @async
     * @private This method was called from `doPack()`.
     * @param {Object} object Accept arguments.
     * @param {Object} object.packObject The `pack` object from config.json `pack` property.
     * @param {string[]} object.files 2D array set of files. The first array is the array list of files for `dev`, the second array is for `prod`. Example:
     * ```
     * [
     *     ['files', 'for', 'development', 'pack'],
     *     ['files', 'for', 'production', 'pack'],
     * ]
     * ```
     * @return {Promise} Return Promise object.
     */
    async #createZip({packObject, files = []} = {}) {
        if (!packObject || typeof(packObject) !== 'object') {
            throw new Error('The argument `packObject` is required and must be object.');
        }

        let thisClass = this;

        // prepare values.
        const destinationZipFolder = path.resolve(CW_DIR, '.dist').replaceAll('\\', '/');
        if (!fs.existsSync(destinationZipFolder)) {
            console.error('    ' + TextStyles.txtError('The zip folder "' + destinationZipFolder + '" is not exists.'));
            return Promise.reject();
        }

        let zipPrefix = 'unknown';
        if (typeof(packObject.zipFilePrefix) === 'string') {
            if (packObject.zipFilePrefix === '$folderName$') {
                zipPrefix = path.basename(CW_DIR);
            } else {
                zipPrefix = packObject.zipFilePrefix;
            }
        }
        let repoVersion = this.#getRepoVersion(packObject);
        if (typeof(repoVersion) !== 'string' || repoVersion === '') {
            repoVersion = 'unknown';
        }
        this.repoVersion = repoVersion;

        if (this.argv.packtype.includes('dev') === true) {
            // if user enter pack for dev.
            console.log('    Pack for development.');
            const zipFullPath = destinationZipFolder + '/' + zipPrefix + ' dev.zip';
            await doZip({
                packObject: packObject,
                files: files[0],
                sourceDir: CW_DIR,
                zipFullPath: zipFullPath,
            })
        }

        if (this.argv.packtype.includes('prod') === true) {
            // if user enter pack for prod.
            console.log('    Pack for production.');
            const zipFullPath = destinationZipFolder + '/' + zipPrefix + ' v' + repoVersion + '.zip';
            await doZip({
                packObject: packObject,
                files: files[1],
                sourceDir: CW_DIR,
                zipFullPath: zipFullPath,
            });
        }

        /**
         * Run zip archiver to pack files and folders.
         * 
         * @param {Object} object Accept arguments.
         * @param {Object} object.packObject The `pack` object from config.json `pack` property.
         * @param {string[]} object.files 2D array list of files. Example: `['/file/text', '/file/image.jpg']`.
         * @param {string} object.sourceDir Full path to module's source folder or get it from `pathsJSON[module].source`.
         * @param {string} object.zipFullPath Full path to zip file.
         */
        function doZip({packObject, files, sourceDir, zipFullPath} = {}) {
            if (thisClass.argv.preview) {
                files.forEach((item) => {
                    const fullPathSource = path.resolve(sourceDir, item).replaceAll('\\', '/');
                    console.log('    File will be zip: ' + fullPathSource);
                });
                console.log('    ' + TextStyles.txtInfo('Zip archive will be created at ' + zipFullPath + '.'));
                return Promise.resolve();
            }// endif; preview

            return new Promise((resolve, reject) => {
                const zoutput = fs.createWriteStream(zipFullPath);
                const archive = archiver('zip', {
                    zlib: { level: 9 } // Sets the compression level.
                });

                // events
                zoutput.on('close', function() {
                    resolve();
                    console.log(TextStyles.txtSuccess('    Zip archive should be created at ' + zipFullPath + '.'));
                });
                // archiver events
                archive.on('entry', (entry) => {
                    const filePath = entry.name.replaceAll('\\', '/');
                    console.log('      ]z[: ', filePath);
                });
                archive.on('progress', (progress) => {
                    console.log('      progress: ' + progress.entries.processed + '/' + progress.entries.total);
                });
                archive.on('warning', function(err) {
                    console.warn('      ' + TextStyles.txtWarning(err.message));
                  });
                archive.on('error', function(err) {
                    reject();
                    throw new Error(err.message);
                });

                archive.pipe(zoutput);

                let zipPrefix = '';
                if (
                    typeof(packObject?.zipOptions?.zipPrefix) === 'string' &&
                    packObject?.zipOptions?.zipPrefix !== ''
                ) {
                    if (packObject.zipOptions.zipPrefix === '$folderName$') {
                        zipPrefix = path.basename(CW_DIR);
                    } else {
                        zipPrefix = packObject.zipOptions.zipPrefix;
                    }
                }
                files.forEach((item) => {
                    const fullPathSource = path.resolve(sourceDir, item).replaceAll('\\', '/');
                    archive.file(fullPathSource, {name: item, prefix: zipPrefix});
                });

                archive.finalize();
            });
        }

        return Promise.resolve();
    }// createZip


    /**
     * Do pack files and folders into zip.
     * 
     * @param {Object} packObj The `pack` property in config.json in current working folder.
     */
    async #doPack(packObj) {
        console.log('  Doing pack source code to zip.');

        let packTasks = [];
        // get files depend on `--packtype` CLI options.
        let filesDev = [];
        let filesProd = [];
        if (this.argv.packtype.includes('dev') === true) {
            filesDev = await this.#globFiles(packObj, 'dev');
        }
        if (this.argv.packtype.includes('prod') === true) {
            filesProd = await this.#globFiles(packObj, 'prod');
        }

        packTasks.push(
            this.#createZip({
                packObject: packObj,
                files: [filesDev, filesProd],
            })
        );

        return Promise.all(packTasks)
        .then(() => {
            console.log('  End doing pack source code to zip.');
            return Promise.resolve();
        });
    }// doPack


    /**
     * Get the repository version number (plugin or theme version).
     * 
     * @param {Object} packObj The `pack` property in config.json in current working folder.
     * @returns {string} Return version number string. Return empty string if file not found or not found the version number.
     */
    #getRepoVersion(packObj) {
        const versionHeaderFile = (packObj?.versionHeaderFile ?? defaultVersionHeaderFile);
        const versionHeaderFileFull = path.resolve(CW_DIR, versionHeaderFile);
        console.log('    Get the version number from file "' + TextStyles.txtInfo(versionHeaderFileFull) + '".');
        const versionPattern = (packObj?.versionPattern ?? defaultVersionPattern);
        console.log('    Regular expression pattern: "' + TextStyles.txtInfo(versionPattern) + '".');

        if (!fs.existsSync(versionHeaderFileFull)) {
            console.error('    ' + TextStyles.txtError('The file that contain version number could not be found.'));
            return '';
        }

        const fileContents = fs.readFileSync(versionHeaderFileFull, 'utf-8');
        const regexpObj = new RegExp(versionPattern, 'miu');
        const matched = fileContents.match(regexpObj);
        if (matched && matched.groups && matched.groups.version) {
            return matched.groups.version;
        }

        return '';
    }// getRepoVersion


    /**
     * Get the files and folders list by using glob.
     * 
     * @async
     * @private This method was called from `doPack()`.
     * @param {Object} packObj The `pack` property in config.json in current working folder.
     * @param {string} packFor Accepted 'dev', 'prod'.
     * @returns 
     */
    async #globFiles(packObj, packFor) {
        if (!packObj || typeof(packObj) !== 'object') {
            throw new Error('The argument `packObj` is required and must be object.');
        }
        if (packFor !== 'dev' && packFor !== 'prod') {
            throw new Error('The argument `packFor` is required and must be in accepted value only.');
        }

        const patterns = packObj.packPatterns[packFor].patterns;
        if (
            typeof(patterns) === 'undefined' || 
            patterns === '' || 
            (
                Array.isArray(patterns) && 
                patterns.length <= 0
            )
        ) {
            console.error('    ' + TextStyles.txtError('The patterns for pack.packPatterns."' + packFor + '.patterns" is not available in config.json.'));
            return ;
        }

        const defaultOptions = {
            cwd: CW_DIR,
            // can't use common ignore pattern with copy command here because something like config/development folder will be skipped in development zip.
            //ignore: ['ignore', 'patterns', 'here', 'node_modules'],// leave it for an example.
            absolute: false,
        };
        let options = packObj.packPatterns[packFor]?.options;
        if (typeof(options) === 'undefined') {
            options = {};
        }
        let globOptions = {
            ...defaultOptions,
            ...options
        }

        let filesResult = await FS.glob(
            patterns,
            globOptions
        );// use await to wait until glob finish result.

        return filesResult;
    }// globFiles


    /**
     * Initialize the pack task.
     * 
     * @param {Object} argv The CLI arguments.
     */
    static async init(argv) {
        const thisClass = new this();

        if (typeof(argv) === 'object') {
            thisClass.argv = argv;
        }

        const cleanClassObj = new clean(argv);
        const packObj = cleanClassObj.isPackPatternsAvailable();
        if (packObj === false) {
            // if there is NO pack patterns specify in the config file.
            // do nothing here.
            console.log(TextStyles.taskHeader('No pack patterns, skipping pack files.'));
            return ;
        }

        console.log(TextStyles.taskHeader('Pack files and folders.'));

        await thisClass.#doPack(packObj);

        const packageJsonClassObj = new packageJson(argv);
        await packageJsonClassObj.updateRepoVersion(thisClass.repoVersion);

        console.log(TextStyles.taskHeader('End pack files and folders.'));
    }// init


}