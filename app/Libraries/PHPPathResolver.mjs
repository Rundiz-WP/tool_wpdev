/**
 * PHP path resolver.
 * 
 * Resolve relative path from current working directory (CWD).  
 * Resolve absolute path from main project's folder.
 * 
 * To detect main project's folder.
 * 1. Check for required header of plugin such as `Plugin Name:`. See ( https://developer.wordpress.org/plugins/plugin-basics/header-requirements/ ).
 * 2. If #1 is not found then check for required header of theme such as `Theme Name:`. See ( https://developer.wordpress.org/themes/core-concepts/main-stylesheet/ ).
 * 
 * If none found then this is not WordPress plugins nor themes. > Show the error.
 * 
 * Example for relative path:  
 * Project is my-plugin. Input 'Admin/ListNotes' from the folder 'my-plugin/App/Controllers' 
 * will be resolved to '/var/www/wp-content/plugins/my-plugin/App/Controllers/Admin/ListNotes.php'.
 * 
 * Example for absolute path:  
 * Project is my-theme. Input '\Inc/Libraries/PaginationHelper' from any folder in this project
 * will be resolved to '/var/www/wp-content/themes/my-theme/Inc/Libraries/PaginationHelper.php'.  
 * Yes, the directory separator must start with back slash (\) and the rest can be back slash or slash or mixed.
 * 
 * @since 0.1.5
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';


export default class PHPPathResolver {


    /**
     * @type {string|null} Cached main project's folder. The value will be `null` if it was not resolved yet.
     */
    #projectRoot = null;


    /**
     * Find main project's folder (WordPress plugin or theme) by walking up from start directory.
     * 
     * @param {string} startDir The directory to start finding from. Default is current working directory.
     * @returns {string} Return full path of main project's folder.
     * @throws {Error} Throw error when main project's folder was not found.
     */
    findProjectRoot(startDir = CW_DIR) {
        if (this.#projectRoot !== null) {
            // if it was already resolved, use the cached value for better performance.
            return this.#projectRoot;
        }

        let currentDir = path.resolve(startDir);

        while (true) {
            if (this.isPluginDir(currentDir) || this.isThemeDir(currentDir)) {
                this.#projectRoot = currentDir;
                return currentDir;
            }

            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) {
                // if reached the top most folder.
                break;
            }
            currentDir = parentDir;
        }// endwhile;

        throw new Error(
            'Unable to locate WordPress plugin or theme main folder from current working directory (' + startDir + ').' + 
            ' The plugin must contain main plugin file with `Plugin Name:` header,' + 
            ' the theme must contain style.css file with `Theme Name:` header.'
        );
    }// findProjectRoot


    /**
     * Check that the directory is WordPress plugin folder.
     * 
     * The folder will be checked for any .php file that contain `Plugin Name:` required header.
     * 
     * @param {string} dir Full path of directory to check.
     * @returns {boolean} Return `true` if it is WordPress plugin folder. Return `false` for otherwise.
     */
    isPluginDir(dir) {
        if (!fs.existsSync(dir)) {
            return false;
        }

        const dirItems = fs.readdirSync(dir, {
            withFileTypes: true,
        });

        for (const item of dirItems) {
            if (item.isFile() && item.name.toLowerCase().endsWith('.php')) {
                const fileContent = fs.readFileSync(path.join(dir, item.name), {
                    encoding: 'utf8',
                    flag: 'r',
                }).slice(0, 8192);// WordPress reads only first 8 KB for file headers.

                if (fileContent.match(/^[ \t\/*#@]*Plugin Name:[ \t]*\S+/mi) !== null) {
                    // if found `Plugin Name:` required header with non-empty value.
                    return true;
                }
            }
        }// endfor;

        return false;
    }// isPluginDir


    /**
     * Check that the directory is WordPress theme folder.
     * 
     * The folder will be checked for style.css file that contain `Theme Name:` required header.
     * 
     * @param {string} dir Full path of directory to check.
     * @returns {boolean} Return `true` if it is WordPress theme folder. Return `false` for otherwise.
     */
    isThemeDir(dir) {
        const styleFile = path.join(dir, 'style.css');

        if (!fs.existsSync(styleFile)) {
            return false;
        }

        const fileContent = fs.readFileSync(styleFile, {
            encoding: 'utf8',
            flag: 'r',
        }).slice(0, 8192);// WordPress reads only first 8 KB for file headers.

        return (fileContent.match(/^[ \t\/*#@]*Theme Name:[ \t]*\S+/mi) !== null);
    }// isThemeDir


    /**
     * Resolve input path to full path of PHP file.
     * 
     * The absolute path (must begin with back slash `\`) will be resolved from main project's folder.  
     * The relative path will be resolved from current working directory.  
     * The `.php` extension will be appended if it is missing.
     * 
     * @param {string} inputPath The input path. Example: `Admin/ListNotes`, `\Inc/Libraries/PaginationHelper`.
     * @returns {string} Return resolved full path of PHP file.
     * @throws {Error} Throw error when input path is invalid or main project's folder was not found.
     */
    resolve(inputPath) {
        if (typeof(inputPath) !== 'string' || inputPath.trim() === '') {
            throw new Error('The input path must be a non-empty string.');
        }

        inputPath = inputPath.trim();

        if (inputPath.startsWith('/')) {
            // the absolute path must start with back slash (\) only. forward slash is not allowed.
            throw new Error('The absolute path must start with back slash (`\\`). (' + inputPath + ')');
        }

        const projectRoot = this.findProjectRoot();
        const isAbsolute = inputPath.startsWith('\\');
        // normalize mixed directory separators (slash and back slash) to forward slash.
        const normalizedInput = inputPath.replace(/^[\\\/]+/, '').replaceAll(/[\\\/]+/g, '/');

        let target;
        if (isAbsolute === true) {
            // if it is absolute path. resolve from main project's folder.
            target = path.resolve(projectRoot, normalizedInput);
        } else {
            // if it is relative path. resolve from current working directory.
            target = path.resolve(CW_DIR, normalizedInput);
        }

        if (!target.toLowerCase().endsWith('.php')) {
            // if the `.php` extension is missing.
            target += '.php';
        }

        return target;
    }// resolve


}