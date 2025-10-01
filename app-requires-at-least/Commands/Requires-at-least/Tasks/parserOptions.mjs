/**
 * Parser options for common use between main app & tests
 */


'use strict';


export default class ParserOptions {


    /**
     * PHP parser options.
     * 
     * @link https://github.com/glayzzle/php-parser Read more
     * @returns {object}
     */
    static phpParser() {
        return {
            parser: {
                extractDoc: true,
                locations: true,
                suppressErrors: true,
            },
            ast: {
                withPositions: true,
                //withSource: true,// even if enabled, the code `$class->method()`, aside `propertylookup` & inside `loc.source` becomes `$class->method`.
            },
            lexer: {
                all_tokens: true,
            },
        };
    }// phpParser


}// ParserOptions
