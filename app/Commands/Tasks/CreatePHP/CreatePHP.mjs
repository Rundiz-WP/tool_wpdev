/**
 * Create PHP task.
 * 
 * @since 0.1.5
 */


'use strict';


import fs from 'node:fs';
import path from 'node:path';
import { stdin, stdout } from 'node:process';
import * as readline from 'node:readline/promises';
// import libraries.
import PHPNamespaceResolver from '../../../Libraries/PHPNamespaceResolver.mjs';
import PHPPathResolver from '../../../Libraries/PHPPathResolver.mjs';
import TextStyles from '../../../Libraries/TextStyles.mjs';


export const createPHP = class CreatePHP {


    /**
     * @type {Object} The CLI arguments.
     */
    argv = {};


    /**
     * @type {Object[]} The resolved PHP file(s). Each item contain `input`, `file`, `namespace`, `objectName`, `objectType` property.
     */
    resolvedPaths = [];


    /**
     * Create PHP OOP file(s).
     * 
     * If the folder of the target file is not exists, it will be created.  
     * If the file is already exists, it will be skipped and shown in warning summary.
     * 
     * @private This method was called from `#createPHPOOPTasks()`.
     */
    #createPHPOOPFiles() {
        const warnings = [];
        const existsFunctions = {
            class: 'class_exists',
            enum: 'enum_exists',
            interface: 'interface_exists',
            trait: 'trait_exists',
        };

        console.log('  Create PHP OOP file(s):');
        for (const item of this.resolvedPaths) {
            const fileDir = path.dirname(item.file);

            if (!fs.existsSync(fileDir)) {
                // if target folder is not exists, create it.
                fs.mkdirSync(fileDir, {
                    recursive: true,
                });
                console.log('    Created folder: ' + fileDir);
            }

            if (fs.existsSync(item.file)) {
                // if target file is already exists, do not overwrite.
                warnings.push('File already exists: ' + item.file);
                console.log('    - Skipped (exists): ' + item.file);
                continue;
            }

            const existsFunction = existsFunctions[item.objectType] ?? 'class_exists';
            const fullObjectName = (item.namespace !== '' ? item.namespace + '\\' + item.objectName : item.objectName);
            // escape back slash to double back slash for PHP double-quoted string.
            const escapedObjectName = fullObjectName.replaceAll('\\', '\\\\');

            let content = '<?php\n\n';
            if (item.namespace !== '') {
                content += 'namespace ' + item.namespace + ';\n\n';
            }

            content += 'if (!' + existsFunction + '("\\\\' + escapedObjectName + '")) {\n';
            content += '    ' + item.objectType + ' ' + item.objectName + '\n';
            content += '    {\n';
            content += '        // Your code here.\n';
            content += '    }// ' + item.objectName + '\n';
            content += '}// endif;\n';

            fs.writeFileSync(item.file, content, {
                encoding: 'utf8',
            });

            console.log('    - Created: ' + item.file);
        }// endfor;

        if (warnings.length > 0) {
            // if there are warnings. show summary at the end.
            console.log('');
            console.log('  ' + TextStyles.txtWarning('Warnings:'));
            for (const warning of warnings) {
                console.warn('  ' + TextStyles.txtWarning(warning));
            }// endfor;
        }
    }// #createPHPOOPFiles


    /**
     * Run create PHP OOP tasks.
     * 
     * @private This method was called from `init()`.
     */
    async #createPHPOOPTasks() {
        await this.#resolvePathAndConfirm();

        // come to this means, user confirmed resolved path.
        // create PHP OOP file based on these path.
        this.#resolveNamespace();
        this.#createPHPOOPFiles();
    }// #createPHPOOPTasks


    /**
     * Resolve namespace of each resolved PHP file.
     * 
     * @private This method was called from `#createPHPOOPTasks()`.
     */
    #resolveNamespace() {
        const PHPNamespaceResolverObj = new PHPNamespaceResolver();

        console.log('  Resolve namespace(s):');
        for (const item of this.resolvedPaths) {
            item.namespace = PHPNamespaceResolverObj.resolve(item.file);
            item.objectName = path.basename(item.file, '.php');
            item.objectType = this.argv.oop;
        }// endfor;
    }// #resolveNamespace


    /**
     * Resolve option `path` to full path of file(s) and ask for confirmation.
     * 
     * The confirmation can be skip with `--yes` or `-y` option.  
     * On not confirm, the process will be stopped.
     * 
     * @private This method was called from `#createPHPOOPTasks()`.
     */
    async #resolvePathAndConfirm() {
        const PHPPathResolverObj = new PHPPathResolver();
        let inputPaths = this.argv.path;

        if (!Array.isArray(inputPaths)) {
            inputPaths = [inputPaths];
        }

        console.log('  Resolve path(s):');
        for (const inputPath of inputPaths) {
            let resolvedPath;
            try {
                resolvedPath = PHPPathResolverObj.resolve(inputPath);
            } catch (err) {
                console.error('  ' + TextStyles.txtError(err.message));
                process.exit(1);
            }

            console.log('  - ' + inputPath);
            console.log('    Resolved to: ' + resolvedPath);
            this.resolvedPaths.push({
                input: inputPath,
                file: resolvedPath,
            });
        }// endfor;

        if (this.argv.yes === true) {
            // if `--yes` or `-y` option was set. skip the confirmation.
            console.log('  ' + TextStyles.txtInfo('Skipped confirmation with `--yes` option.'));
            return ;
        }

        let answer;
        try {
            const rl = readline.createInterface({
                input: stdin,
                output: stdout,
            });
            answer = await rl.question('  Confirm create PHP file(s) above? (y/N): ');
            rl.close();
        } catch (err) {
            console.log('');// enter newline
            console.warn('  ' + TextStyles.txtWarning('Canceled.'));
            process.exit(1);
        }

        if (answer.trim().match(/^y(es)?$/i) === null) {
            // if not confirm. stop process.
            console.warn('  ' + TextStyles.txtWarning('Canceled.'));
            process.exit(1);
        }
    }// #resolvePathAndConfirm


    /**
     * Initialize the class.
     */
    static async init(argv) {
        const thisClass = new this();

        if (typeof(argv) === 'object') {
            thisClass.argv = argv;
        }

        console.log(TextStyles.taskHeader('Create PHP OOP file.'));

        await thisClass.#createPHPOOPTasks();

        console.log(TextStyles.taskHeader('End Create PHP OOP file.'));
    }// init


}