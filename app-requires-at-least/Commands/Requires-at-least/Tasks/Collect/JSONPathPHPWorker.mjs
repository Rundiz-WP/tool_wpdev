/**
 * JSON path PHP worker to work with the class `JSONPathPHP` to get the results such as constant, function names, etc.
 */


'use strict';


import _ from "lodash";
// import libraries
import JSONPathPHP from "../../../../Libraries/JSONPathPHP.mjs";


/**
 * JSON path PHP worker class.  
 * This class should initialize for each file process only to prevent process mixed with other files and have incorrect result.
 */
export default class JSONPathPHPWorker {


    /**
     * @type {Array} Store extracted namespace names.
     */
    #namespaces = [];


    /**
     * @type {object} Parsed code of a whole file.
     */
    #parsedCode = {};


    /**
     * @type {Array} Store processed data which is code names and their versions.
     */
    #processedData = [];


    /**
     * Getter namespaces.
     */
    get namespaces() {
        return this.#namespaces;
    }// namespaces


    /**
     * Getter processed data.
     */
    get processedData() {
        return this.#processedData;
    }// processedData


    /**
     * Get hook name (for WordPress hook action & filter).
     * 
     * This method was called from `getWPHooks()`.
     * 
     * @param {object} firstHookArgument 
     * @returns {string}
     */
    #getWPHookName(firstHookArgument) {
        let hookName = '';
        
        if (firstHookArgument?.raw) {
            hookName = this.cleanValue(firstHookArgument.raw);
        } else if (
            firstHookArgument?.kind === 'variable' &&
            firstHookArgument?.name
        ) {
            hookName = '$' + this.cleanValue(firstHookArgument.name);
        }

        return hookName;
    }// #getWPHookName


    /**
     * Set parsed code for use later.
     * 
     * @param {object} parsedCode The whole file parsed code for use with another queries later.
     */
    setParsedCode(parsedCode) {
        if (typeof(parsedCode) !== 'object') {
            throw new Error('The argument `parsedCode` must be object.');
        }

        this.#parsedCode = parsedCode;
    }// setParsedCode


    /**
     * Set the value of code with versions & descriptions that will be store to this class's property.
     * 
     * This method was called from `getConstants()`, `getAnonymousArrowFunctions()`, `getFunctions()`.
     * 
     * @param {string} codeName Code name such as constant name, function name, etc.
     * @param {string[]} versions Array of versions that have got from `getCodeVersionDescription()`.
     * @param {string[]} descriptions Array of descriptions that have got from `getCodeVersionDescription()`.
     * @return {object} Return structure with data that will be set to this class's property.
     */
    #setStoreCodeWithVersionDescriptionValue(codeName, versions, descriptions) {
        if (typeof(codeName) !== 'string') {
            throw new Error('The argument `codeName` must be string.');
        }
        if (!Array.isArray(versions)) {
            throw new Error('The argument `versions` must be array.');
        }
        if (!Array.isArray(descriptions)) {
            throw new Error('The argument `descriptions` must be array.');
        }

        const versionDesc = this.#setStoreVersionDescriptionValue(versions, descriptions);
        const returns = Object.assign({}, {'name': codeName}, versionDesc);
        // example of return format: 
        // {
        //     'name': codeName,
        //     'versionDescription': {
        //         'versions': [],
        //         'descriptions': [],
        //     }
        // }
        return returns;
    }// #setStoreCodeWithVersionDescriptionValue


    /**
     * Set the value of versions & descriptions only.
     * 
     * This method was called from `#setStoreCodeWithVersionDescriptionValue()`.
     * 
     * @param {string[]} versions Array of versions that have got from `getCodeVersionDescription()`.
     * @param {string[]} descriptions Array of descriptions that have got from `getCodeVersionDescription()`.
     * @return {object} Return structure of versions & descriptions.
     */
    #setStoreVersionDescriptionValue(versions, descriptions) {
        if (!Array.isArray(versions)) {
            throw new Error('The argument `versions` must be array.');
        }
        if (!Array.isArray(descriptions)) {
            throw new Error('The argument `descriptions` must be array.');
        }

        return {
            'versionDescription': {
                'versions': versions,
                'descriptions': descriptions,
            }
        };
    }// #setStoreVersionDescriptionValue
    
        
    /**
     * Clean value string by trim and remove single quote, double quote from beginning and trailing.
     * 
     * @param {string} valueString 
     * @returns {string}
     */
    cleanValue(valueString) {
        if (typeof(valueString) !== 'string') {
            return valueString;
        }

        valueString = valueString.trim();
        valueString = valueString.replace(/^([\'\"]+)/, '');
        valueString = valueString.replace(/([\'\"]+)$/, '');
        return valueString;
    }// cleanValue


    /**
     * Get anonymous functions, arrow functions.
     * 
     * This progress is working on parsed of single file.
     * 
     * Set processed data on `processedData` property.
     * 
     * @param {object} namespaces 
     * @param {object} functions 
     * @param {string} namespaceString 
     */
    getAnonymousArrowFunctions(namespaces, functions, namespaceString = '') {
        const JSONPathPHPObj = new JSONPathPHP();
        if (Array.isArray(namespaces) && namespaces.length > 0) {
            // if there is namespaces
            // loop each namespace
            for (const eachNS of namespaces) {
                if (typeof(eachNS.name) === 'string') {
                    namespaceString = eachNS.name;
                } else if (typeof(eachNS.name) !== 'string') {
                    namespaceString = '';
                }

                // query AA function per namespace.
                const aaFunctionsInNS = JSONPathPHPObj.queryPHPAnonymousAndArrowFunction(eachNS);
                if (aaFunctionsInNS.length > 0) {
                    this.getAnonymousArrowFunctions(eachNS, aaFunctionsInNS, namespaceString);
                }
            }// endfor; namespaces
        } else {
            // if there is no namespaces
            for (const eachFunction of functions) {
                if (typeof(eachFunction.expression?.left?.name) === 'string') {
                    // if there is function name.
                    let fullFunctionName = '$' + this.cleanValue(eachFunction.expression.left.name) + '()';
                    if (typeof(fullFunctionName) === 'string') {
                        let versions = [];
                        let descriptions = [];

                        const lastLeadingComments = eachFunction.leadingComments?.at(-1);
                        if (lastLeadingComments?.value?.match(/@since.+?\d+/)) {
                            [versions, descriptions] = this.getCodeVersionDescription(lastLeadingComments.value);
                        }

                        // It's possible to contain duplicated `$var = function() {};`. Check to make sure not add duplicates.
                        if (!_.some(this.#processedData, {'name': fullFunctionName})) {
                            // if this function is not exists in processed data property.
                            this.#processedData.push(
                                this.#setStoreCodeWithVersionDescriptionValue(fullFunctionName, versions, descriptions)
                            );
                        } else {
                            // if this function is already exists in processed data property.
                            // push versions and descriptions to exists one.
                            const processedIndex = _.findIndex(this.#processedData, {'name': fullFunctionName});
                            this.#processedData[processedIndex].versionDescription.versions.push(...versions);
                            this.#processedData[processedIndex].versionDescription.descriptions.push(...descriptions);
                        }
                    }// endif; full function name is string
                }// endif; function name is string
            }// endfor; functions
        }// endif; there is namespaces or not
    }// getAnonymousArrowFunctions


    /**
     * Get classes with class member such as class's constants, properties, methods.
     * 
     * This progress is working on parsed of single file.
     * 
     * Set processed data on `processedData` property.
     * 
     * @param {object} namespaces 
     * @param {object} constants 
     * @param {string} namespaceString
     */
    getClasses(namespaces, classes, namespaceString = '') {
        const JSONPathPHPObj = new JSONPathPHP();
        if (Array.isArray(namespaces) && namespaces.length > 0) {
            // if there is namespaces
            // loop each namespace
            for (const eachNS of namespaces) {
                if (typeof(eachNS.name) === 'string') {
                    namespaceString = eachNS.name;
                } else if (typeof(eachNS.name) !== 'string') {
                    namespaceString = '';
                }

                // query class per namespace.
                const constantsInNS = JSONPathPHPObj.queryPHPClass(eachNS);
                if (constantsInNS.length > 0) {
                    this.getClasses(eachNS, constantsInNS, namespaceString);
                }
                // query anonmyous class per namespace.
                const anonymousClasses = JSONPathPHPObj.queryPHPAnonymousClass(eachNS);
                if (anonymousClasses.length > 0) {
                    this.getClasses(eachNS, anonymousClasses, '');
                }
            }// endfor; namespaces
        } else {
            // if there is no namespaces
            for (let eachClass of classes) {
                if (
                    typeof(eachClass.name?.name) === 'string' ||// using by explicit class
                    (
                        eachClass.expression?.kind === 'assign' &&
                        eachClass.expression?.right?.kind === 'new' &&
                        typeof(eachClass.expression?.left?.name) === 'string'
                    )// using by anonymous class
                ) {
                    // if there is class name
                    let fullClassName = namespaceString;
                    if (typeof(eachClass.name?.name) === 'string') {
                        // if explicit class (basic class)
                        if ('' !== namespaceString) {
                            fullClassName += '\\';
                        }
                        fullClassName += this.cleanValue(eachClass.name?.name);
                    } else if (
                        eachClass.expression?.kind === 'assign' &&
                        eachClass.expression?.right?.kind === 'new' &&
                        typeof(eachClass.expression?.left?.name) === 'string'
                    ) {
                        // if anonymous class
                        if ('' !== namespaceString) {
                            fullClassName += ':';
                        }
                        fullClassName += '$' + this.cleanValue(eachClass.expression?.left?.name);
                        // re-assign `eachClass` variable to use object of anonymous class
                        eachClass = eachClass.expression.right?.what;
                    }
                    let versions = [];
                    let descriptions = [];

                    const lastLeadingComments = eachClass.leadingComments?.at(-1);
                    if (lastLeadingComments?.value?.match(/@since.+?\d+/)) {
                        [versions, descriptions] = this.getCodeVersionDescription(lastLeadingComments.value);
                    }

                    let processData = {};
                    processData[fullClassName] = this.#setStoreVersionDescriptionValue(versions, descriptions);
                    processData[fullClassName]['members'] = {};

                    // get class's member such as class's constants, properties, methods.
                    const classMember = JSONPathPHPObj.queryPHPClassMember(eachClass);

                    // loop class's constants. ---------------------------------------
                    for (const eachConst of classMember.constants) {
                        if (
                            typeof(eachConst.constants) === 'object' && 
                            Array.isArray(eachConst.constants)
                        ) {
                            for (const eachConstConstants of eachConst.constants) {
                                const classConstantName = 'const ' + this.cleanValue(eachConstConstants.name?.name);
                                let versions = [];
                                let descriptions = [];

                                const lastLeadingComments = eachConst.leadingComments?.at(-1);
                                if (lastLeadingComments?.value?.match(/@since.+?\d+/)) {
                                    [versions, descriptions] = this.getCodeVersionDescription(lastLeadingComments.value);
                                }

                                processData[fullClassName]['members'][classConstantName] = this.#setStoreVersionDescriptionValue(versions, descriptions);
                            }// endfor eachConst.constatns
                        }// endif; eachConst.constants is array
                    }// endfor; class constants
                    // end loop class's constants. ------------------------------------

                    // loop class's properties. ---------------------------------------
                    for (const eachProperty of classMember.properties) {
                        if (
                            typeof(eachProperty.properties) === 'object' &&
                            Array.isArray(eachProperty.properties)
                        ) {
                            for (const eachPropertyProperties of eachProperty.properties) {
                                const propertyName = '$' + this.cleanValue(eachPropertyProperties.name?.name);
                                let versions = [];
                                let descriptions = [];

                                const lastLeadingComments = eachProperty.leadingComments?.at(-1);
                                if (lastLeadingComments?.value?.match(/@since.+?\d+/)) {
                                    [versions, descriptions] = this.getCodeVersionDescription(lastLeadingComments.value);
                                }

                                processData[fullClassName]['members'][propertyName] = this.#setStoreVersionDescriptionValue(versions, descriptions);
                            }// endfor; eachProperty.properties
                        }// endif; eachProperty.properties is array
                    }// endfor; class properties
                    // end loop class's properties. -----------------------------------

                    // loop class's methods. ------------------------------------------
                    for (const eachMethod of classMember.methods) {
                        if (
                            typeof(eachMethod.name?.name) === 'string' &&
                            eachMethod.isAbstract !== true
                        ) {
                            const methodName = this.cleanValue(eachMethod.name.name) + '()';
                            let versions = [];
                            let descriptions = [];

                            const lastLeadingComments = eachMethod.leadingComments?.at(-1);
                            if (lastLeadingComments?.value?.match(/@since.+?\d+/)) {
                                [versions, descriptions] = this.getCodeVersionDescription(lastLeadingComments.value);
                            }

                            processData[fullClassName]['members'][methodName] = this.#setStoreVersionDescriptionValue(versions, descriptions);

                            if (
                                typeof(eachMethod.body?.children) === 'object' &&
                                Array.isArray(eachMethod.body?.children) &&
                                eachMethod.body?.children.length > 0
                            ) {
                                // if there is children object which maybe anonymous class.
                                const subClasses = JSONPathPHPObj.queryPHPAnonymousClass(eachMethod.body);
                                if (subClasses.length > 0) {
                                    this.getClasses(namespaces, subClasses, 'subClassOf:' + fullClassName + '->' + methodName);
                                }
                            }
                        }// endif; method name is string
                    }// endfor; class methods
                    // end loop class's methods. --------------------------------------

                    // finish, push data to this class's property array. 
                    // check not exists first due to it's possible to be duplicated from query explicit class & anonymous class then get class names at once.
                    if (!_.some(this.#processedData, fullClassName)) {
                        // if class is not exists in processed data property.
                        this.#processedData.push(processData);
                    }
                }// endif; class name is string
            }// endfor; classes
        }// endif; there is namespaces or not
    }// getClasses


    /**
     * Get code version & description.
     * 
     * @link https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string Reference of regular expression version string.
     * @param {string} codeComment The code comment that maybe contain `@since` data.
     * @returns {Array} Return indexed array where first is versions (array), second is descriptions which matched array index as versions.
     */
    getCodeVersionDescription(codeComment) {
        if (typeof(codeComment) !== 'string') {
            throw new Error('The argument `codeComment` must be string, ' + typeof(codeComment) + ' given.');
        }

        const regexVersionString = '\\@since'
        + '.*?'// for anything such as `MU(`.
        + '(?<vname>'
            + '\\d+\\.\\d+\\.?\\d*'// WP contain `@since` number like `3.0.0`, `0.71`. So, it must supported all those.
            + '(?:-'
                + '('
                    + '(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)'
                    + '(?:\.'
                        + '(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)'
                    + ')*'
                + ')'
            + ')?'
            + '(?:\\+'
                + '([0-9a-zA-Z-]+'
                    + '(?:\\.[0-9a-zA-Z-]+)*'
                + ')'
            + ')?'
        + ')'// close capture group `<vname>`.
        + '\\)?'// for `)` after `MU(3.0.0`.
        + '[ ]*'// space(s)
        //+ '(?<description>.*)'// description (one line).
        + '(?<description>[\\s\\S]*?)'// description 
        + '(?=@|\\*\\\/|\\*\\s*\\r?\\n)'// .. description with positive look ahead that is not contain `@`, `*/`, end of string.
        //+ '$';// end of line (use with description one line)
        // note that to use description one line, the flag `m` must be set on `new RegExp()`.

        const regexVersion = new RegExp(regexVersionString, 'g');
        const matches = codeComment.matchAll(regexVersion);
        const versions = [];
        const descriptions = [];

        for (const eachMatch of matches) {
            if (!versions.includes(eachMatch.groups.vname?.trim())) {
                versions.push(eachMatch.groups.vname?.trim());
                let description = eachMatch.groups.description?.trim();
                if (typeof(description) !== 'string') {
                    description = '';
                } else {
                    description = description.replace(/^[ \t]*\*[ \t]*/gm, '');
                    description = description.replace(/\r?\n/g, "\n");
                    description = description.trim();
                }
                descriptions.push(description);
            }
        }

        return [versions, descriptions];
    }// getCodeVersionDescription


    /**
     * Get constants.
     * 
     * This progress is working on parsed of single file.
     * 
     * Set processed data on `processedData` property.
     * 
     * @param {object} namespaces 
     * @param {object} constants 
     * @param {string} namespaceString
     */
    getConstants(namespaces, constants, namespaceString = '') {
        const JSONPathPHPObj = new JSONPathPHP();
        if (Array.isArray(namespaces) && namespaces.length > 0) {
            // if there is namespaces
            // loop each namespace
            for (const eachNS of namespaces) {
                if (typeof(eachNS.name) === 'string') {
                    namespaceString = eachNS.name;
                } else if (typeof(eachNS.name) !== 'string') {
                    namespaceString = '';
                }

                // query constant per namespace.
                const constantsInNS = JSONPathPHPObj.queryPHPConstant(eachNS);
                if (constantsInNS.length > 0) {
                    this.getConstants(eachNS, constantsInNS, namespaceString);
                }
            }// endfor; namespaces
        } else {
            // if there is no namespaces
            for (const eachConst of constants) {
                if (
                    typeof(eachConst?.constants) === 'object' &&
                    Array.isArray(eachConst.constants)
                ) {
                    // if there is constant code `const CONSTANT_NAME = 'value';`.
                    for (const eachConstConstants of eachConst.constants) {
                        let fullConstantName = ('' !== namespaceString ? namespaceString + '\\' : '');
                        fullConstantName += this.cleanValue(eachConstConstants.name?.name);
                        if (typeof(fullConstantName) === 'string') {
                            let versions = [];
                            let descriptions = [];

                            const lastLeadingComments = eachConst.leadingComments?.at(-1);
                            if (lastLeadingComments?.value?.match(/@since.+?\d+/)) {
                                [versions, descriptions] = this.getCodeVersionDescription(lastLeadingComments.value);
                            }

                            if (!_.some(this.#processedData, {'name': fullConstantName})) {
                                this.#processedData.push(
                                    this.#setStoreCodeWithVersionDescriptionValue(fullConstantName, versions, descriptions)
                                );
                            }
                        }// endif; full constant name is string
                    }// endfor; 
                }// endif;

                if (
                    eachConst.expression?.what?.name === 'define' &&
                    typeof(eachConst.expression?.arguments) === 'object' &&
                    typeof(eachConst.expression.arguments[0]) === 'object'
                ) {
                    // if there is constant code `define('CONSTANT_NAME', 'value');`.
                    // note that `define()` cannot set constant under namespace like `const` did.
                    const fullConstantName = this.cleanValue(eachConst.expression.arguments[0].raw);
                    if (typeof(fullConstantName) === 'string') {
                        let versions = [];
                        let descriptions = [];

                        const lastLeadingComments = eachConst.leadingComments?.at(-1);
                        if (lastLeadingComments?.value?.match(/@since.+?\d+/)) {
                            [versions, descriptions] = this.getCodeVersionDescription(lastLeadingComments.value);
                        }

                        if (!_.some(this.#processedData, {'name': fullConstantName})) {
                            this.#processedData.push(
                                this.#setStoreCodeWithVersionDescriptionValue(fullConstantName, versions, descriptions)
                            );
                        }
                    }// endif; full constant name is string.
                }// endif;
            }// endfor; constants
        }// endif; there is namespaces or not
    }// getConstants


    /**
     * Get functions.
     * 
     * This method supported only user-defined function (`function myFunction() {}`). Not support anomymous, or arrow function.
     * 
     * This progress is working on parsed of single file.
     * 
     * Set processed data on `processedData` property.
     * 
     * @param {object} namespaces 
     * @param {object} functions 
     * @param {string} namespaceString 
     */
    getFunctions(namespaces, functions, namespaceString = '') {
        const JSONPathPHPObj = new JSONPathPHP();
        if (Array.isArray(namespaces) && namespaces.length > 0) {
            // if there is namespaces
            // loop each namespace
            for (const eachNS of namespaces) {
                if (typeof(eachNS.name) === 'string') {
                    namespaceString = eachNS.name;
                } else if (typeof(eachNS.name) !== 'string') {
                    namespaceString = '';
                }

                // query function per namespace.
                const functionsInNS = JSONPathPHPObj.queryPHPFunction(eachNS);
                if (functionsInNS.length > 0) {
                    this.getFunctions(eachNS, functionsInNS, namespaceString);
                }
            }// endfor; namespaces
        } else {
            // if there is no namespaces
            for (const eachFunction of functions) {
                if (typeof(eachFunction.name?.name) === 'string') {
                    // if there is function name.
                    let fullFunctionName = ('' !== namespaceString ? namespaceString + '\\' : '');
                    fullFunctionName += this.cleanValue(eachFunction.name.name) + '()';
                    if (typeof(fullFunctionName) === 'string') {
                        let versions = [];
                        let descriptions = [];

                        // sometimes, parser can't get correct doc block ( https://github.com/glayzzle/php-parser/issues/1166 ).
                        let lastLeadingComments = {};
                        if (eachFunction.leadingComments?.at(-1)) {
                            lastLeadingComments = eachFunction.leadingComments?.at(-1);
                        } else {
                            const codeComments = JSONPathPHPObj.queryPHPCodeCommentBlock(this.#parsedCode, eachFunction.loc?.start?.line);
                            codeComments.reverse();
                            lastLeadingComments = codeComments[0];
                        }
                        // get version & description.
                        if (lastLeadingComments?.value?.match(/@since.+?\d+/)) {
                            [versions, descriptions] = this.getCodeVersionDescription(lastLeadingComments.value);
                        }

                        if (!_.some(this.#processedData, {'name': fullFunctionName})) {
                            this.#processedData.push(
                                this.#setStoreCodeWithVersionDescriptionValue(fullFunctionName, versions, descriptions)
                            );
                        }
                    }// endif; full function name is string
                }// endif; function name is string
            }// endfor; functions
        }// endif; there is namespaces or not
    }// getFunctions


    /**
     * Get namespaces.
     * 
     * @param {object} namespaces 
     */
    getNamespaces(namespaces) {
        const JSONPathPHPObj = new JSONPathPHP();
        for (const eachNS of namespaces) {
            if (
                typeof(eachNS?.name) === 'string' && 
                !this.#namespaces.includes(eachNS.name)
            ) {
                // if namespace name is string and not in the result. make sure that its name is string because `namespace {}` can be array `['']`.
                this.#namespaces.push(eachNS.name);
            }

            const otherNamespaces = JSONPathPHPObj.queryPHPNamespace(eachNS);
            if (otherNamespaces.length > 0) {
                this.getNamespaces(otherNamespaces);
            }
        }// endfor;
    }// getNamespaces


    /**
     * Get WordPress hook actions, filters.
     * 
     * This progress is working on parsed of single file.
     * 
     * Set processed data on `processedData` property.
     * 
     * @param {object[]} hooks 
     * @param {object} parsedCode The original process code from source file (a whole file).
     */
    getWPHooks(hooks, parsedCode) {
        if (typeof(parsedCode) !== 'object') {
            throw new Error('The argument `parsedCode` must be object.');
        }

        const JSONPathPHPObj = new JSONPathPHP();
        if (Array.isArray(hooks) && hooks.length > 0) {
            // if there is hook
            for (let eachHook of hooks) {
                const eachHookArguments = eachHook.arguments;
                let hookName = '';
                if (
                    typeof(eachHookArguments) === 'object' &&
                    typeof(eachHookArguments[0]) === 'object'
                ) {
                    hookName = this.#getWPHookName(eachHookArguments[0]);
                }// endif;  there is hook .arguments

                if (typeof(hookName) === 'string' && '' !== hookName) {
                    let versions = [];
                    let descriptions = [];
                    const hookLine = eachHook.what?.loc?.start?.line;
                    const commentBlocks = JSONPathPHPObj.queryPHPCodeCommentBlock(parsedCode, (hookLine ?? 0));

                    if (typeof(commentBlocks) === 'object' && Array.isArray(commentBlocks)) {
                        const maxCommentBlocks = 3;
                        if (commentBlocks.length > maxCommentBlocks) {
                            commentBlocks.splice(0, (commentBlocks.length - maxCommentBlocks));
                        }
                        commentBlocks.reverse();

                        const lastLeadingComments = commentBlocks.at(0);
                        if (lastLeadingComments?.value?.match(/@since.+?\d+/)) {
                            [versions, descriptions] = this.getCodeVersionDescription(lastLeadingComments.value);
                        }
                    }

                    if (!_.some(this.#processedData, {'name': hookName})) {
                        this.#processedData.push(
                            this.#setStoreCodeWithVersionDescriptionValue(hookName, versions, descriptions)
                        );
                    }
                }// endif;
            }// endfor; hooks
        }// endif; there is hook or not
    }// getWPHooks


    /**
     * Reset property `processedData` to initial state.
     * 
     * Recommend to call this method every time that the processed data was stored to somewhere else 
     * to prevent too many data and duplicates in the loops.
     */
    resetProcessedData() {
        this.#processedData = [];
    }// resetProcessedData


    /**
     * Static method of `cleanValue()`.
     * 
     * @param {string} valueString 
     * @returns {string}
     */
    static staticCleanValue(valueString) {
        const thisClass = new JSONPathPHPWorker();
        return thisClass.cleanValue(valueString);
    }// staticCleanValue


}// JSONPathPHPWorker
