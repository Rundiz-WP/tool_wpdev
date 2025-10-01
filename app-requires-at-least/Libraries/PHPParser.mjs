/**
 * Based on npm php-parser
 */


'use strict';


import fs from 'node:fs';
import engine from 'php-parser';
// import libraries
import PHPNamespaceFixer from './PHPNamespaceFixer.mjs';
// import dependency option
import ParserOptions from '../Commands/Requires-at-least/Tasks/parserOptions.mjs';


export default class PHPParser {


    /**
     * Parse code from a file.
     * 
     * @param {string} PHPFile Full path to PHP file.
     * @returns {object}
     */
    static parseCode(PHPFile) {
        if (typeof(PHPFile) !== 'string') {
            throw new Error('The argument `PHPFile` must be string.');
        }

        const parser = new engine(ParserOptions.phpParser());
        const fileContent = fs.readFileSync(PHPFile);
        return PHPNamespaceFixer.staticFixNamespaces(parser.parseCode(fileContent));
    }// parseCode


}// PHPParser
