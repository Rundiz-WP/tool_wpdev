/**
 * PHP namespace resolver.
 * 
 * Detect namespace from existing PHP files start from the deepest folder of input file path.  
 * If not found or folder is not exists then detect from outer 1 level until found (up to main project's folder).
 * 
 * If none found, it is possible that this project has no namespace. Map the namespace from folder names 
 * relative to main project's folder.  
 * Example: input `\MyPlugin\Helpers\Number` that resolved to file `/var/www/wp-content/plugins/my-plugin/MyPlugin/Helpers/Number.php` 
 * will be mapped to namespace `MyPlugin\Helpers`.
 * 
 * @since 0.1.5
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';
// import libraries.
import PHPPathResolver from './PHPPathResolver.mjs';


export default class PHPNamespaceResolver {


    /**
     * @type {Map} Cached detected namespace of each folder. The key is full path of folder, 
     *              the value is detected namespace string or `null` if not found.
     */
    #namespaceCache = new Map();


    /**
     * @type {PHPPathResolver} The PHP path resolver instance for locate main project's folder.
     */
    #pathResolver;


    /**
     * Class constructor.
     */
    constructor() {
        this.#pathResolver = new PHPPathResolver();
    }// constructor


    /**
     * Detect namespace from existing PHP files in the folder.
     * 
     * The folder will be checked for any .php file that contain `namespace` declaration.
     * 
     * @param {string} dir Full path of directory to check.
     * @returns {string|null} Return detected namespace (without begin and end separator). Return `null` if not found or folder is not exists.
     */
    detectNamespaceInDir(dir) {
        if (this.#namespaceCache.has(dir)) {
            // if it was already checked, use the cached value for better performance.
            return this.#namespaceCache.get(dir);
        }

        let namespace = null;

        if (fs.existsSync(dir)) {
            const dirItems = fs.readdirSync(dir, {
                withFileTypes: true,
            });

            for (const item of dirItems) {
                if (item.isFile() && item.name.toLowerCase().endsWith('.php')) {
                    const fileContent = fs.readFileSync(path.join(dir, item.name), {
                        encoding: 'utf8',
                        flag: 'r',
                    }).slice(0, 8192);// namespace declaration is at the top of file, first 8 KB is enough.

                    const matched = fileContent.match(/^[ \t]*namespace[ \t]+(?<namespace>[A-Za-z_\x80-\xff][A-Za-z0-9_\x80-\xff\\]*)[ \t]*[;{]/mi);
                    if (matched !== null) {
                        // if found `namespace` declaration.
                        namespace = matched.groups.namespace;
                        break;
                    }
                }
            }// endfor;
        }

        this.#namespaceCache.set(dir, namespace);
        return namespace;
    }// detectNamespaceInDir


    /**
     * Resolve namespace of PHP file.
     * 
     * @param {string} file Full path of PHP file. Example: result of `PHPPathResolver.resolve()`.
     * @returns {string} Return namespace (without begin and end separator). 
     *              Return empty string if it could not be detected nor mapped (the file is in main project's folder root).
     */
    resolve(file) {
        const projectRoot = this.#pathResolver.findProjectRoot();
        const targetDir = path.dirname(file);
        // start detecting from the deepest folder (the file path itself as folder) then walk outward 1 level until found.
        let currentDir = file.replace(/\.php$/i, '');

        while (true) {
            const detected = this.detectNamespaceInDir(currentDir);

            if (detected !== null) {
                // if namespace was found. append sub folders between detected folder and target's folder (if any).
                const subFolders = path.relative(currentDir, targetDir);
                if (subFolders === '' || subFolders.startsWith('..')) {
                    return detected;
                }
                return detected + '\\' + subFolders.split(path.sep).join('\\');
            }

            if (currentDir === projectRoot) {
                // if walked up to main project's folder and still not found.
                break;
            }

            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir) {
                // if reached the top most folder.
                break;
            }
            currentDir = parentDir;
        }// endwhile;

        // come to this means no namespace found. map the namespace from folder names relative to main project's folder.
        const relativeDir = path.relative(projectRoot, targetDir);
        if (relativeDir === '' || relativeDir.startsWith('..')) {
            return '';
        }
        return relativeDir.split(path.sep).join('\\');
    }// resolve


}
