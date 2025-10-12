/**
 * JSON path PHP caller worker to work with the class `JSONPathPHPCaller` to get the results such as constant, function names, etc.
 * 
 * @link https://www.php.net/manual/en/language.namespaces.rules.php name resolution rules for PHP.
 */


'use strict';


import fs from 'node:fs';
import _ from "lodash";
// import tasks
import JSONPathPHPWorker from "../Collect/JSONPathPHPWorker.mjs";
// import libraries
import JSONPathPHPCaller from "../../../../Libraries/JSONPathPHPCaller.mjs";
import Path from "../../../../../app/Libraries/Path.mjs";
import TextStyles from "../../../../../app/Libraries/TextStyles.mjs";


export default class JSONPathPHPCallerWorker {


    /**
     * @type {Object} The CLI arguments.
     */
    #argv = {};


    /**
     * @type {object} The WordPress core data object that read from file ".requires-at-least_core-data-php_wordpress*.json"
     */
    #coreDataObj = {};


    /**
     * Current caller file full path.
     */
    #currentCallerFile = '';


    /**
     * @type {object} Parsed code of a whole file.
     */
    #parsedCode = {};


    /**
     * @type {object} The PHP core codes (constants, functions) object that read from file "".php-core-codes.json"
     */
    #phpCoreCodesObj = {};


    /**
     * @type {Array} Store processed data which is code names and their versions.
     */
    #processedData = [];


    /**
     * @type {boolean} Remove unmatched code with WordPress core or not. Default is `true`.
     */
    #removeUnmatchWPCore = true;


    /**
     * @type {object} Store temporary class data.
     */
    #tempClassData = {};


    /**
     * JSON path PHP caller worker.
     * 
     * @param {object} argv The CLI arguments.
     * @param {object} options The options:
     * @param {boolean} options.removeUnmatchWPCore Remove unmatched code with WordPress core or not. Default is `true`.
     */
    constructor(argv = {}, options = {}) {
        if (typeof(argv) === 'object') {
            this.#argv = argv;
        }

        if (typeof(options.removeUnmatchWPCore) === 'boolean') {
            this.#removeUnmatchWPCore = options.removeUnmatchWPCore;
        }
    }// constructor


    /**
     * Getter processed data.
     */
    get processedData() {
        return this.#processedData;
    }// processedData


    /**
     * Check if there is un-resolved class name.
     * 
     * @param {string} fullClassName 
     * @returns {Array} Return indexed array. [fullClassName, unresolveName (boolean), unresolveRemark (string)]
     */
    #checkClassNameUnresolved(fullClassName) {
        let unresolveName = false;
        let unresolveRemark = '';

        if (fullClassName.match(/^\-\d+:/)) {
            // if found prefix name with minus digit and colon (example `-1:`) in full class name.
            // this is marked as un-resolved name
            unresolveName = true;
            const matches = fullClassName.match(/^\-\d+:(?<reason>[\w\-_]+):(?<name>.*)/);
            fullClassName = '';

            if (
                typeof(matches) === 'object' &&
                matches?.groups?.reason &&
                matches?.groups?.name
            ) {
                if (matches.groups.reason === 'name_in_function') {
                    unresolveRemark = 'The class name is in function, unable to resolve.';
                } else if (matches.groups.reason === 'name_in_class') {
                    unresolveRemark = 'The class name is in another class, unable to resolve.';
                }

                if (typeof(matches.groups.name) === 'string') {
                    fullClassName = matches.groups.name.trim();
                }
            }// endif; found matched reason and the name.
        }// endif; found prefix name in full class name.

        return [fullClassName, unresolveName, unresolveRemark];
    }// #checkClassNameUnresolved


    /**
     * Check required properties before start working.
     */
    #checkRequiredProperties() {
        if (typeof(this.#coreDataObj) !== 'object' || Object.keys(this.#coreDataObj).length <= 0) {
            throw new Error('The core data file was not set. Please set it via `setCoreDataFile()` method.');
        }
        if (typeof(this.#parsedCode) !== 'object' || Object.keys(this.#parsedCode).length <= 0) {
            throw new Error('The parsed code object was not set. Please set it via `setParsedCode()` method.');
        }
        if (typeof(this.#phpCoreCodesObj) !== 'object' || Object.keys(this.#phpCoreCodesObj).length <= 0) {
            throw new Error('The PHP core codes was not set. Please set it via `setPHPCoreCodesFile()` method.');
        }
    }// #checkRequiredProperties


    /**
     * Concatenate `.raw` values into array
     * 
     * @param {object} parsedCode The overall parsed code to use with lookup variable.
     * @param {object} classObj The parsed code of each class that have got while iterating.
     * @param {object} options The options:
     * @param {string} options.namespaceString Namespace string to use with prepend.
     * @returns {string[]} Return each value into array that is ready to `.join('')`,  
     *              but in some case, there is resolution prepend to the name with mark `\\::`.  
     *              For example `uqn\\::ClassName` and name like this need to resolve with the namespace.
     */
    #concatBin(parsedCode, classObj, options = {}) {
        if (typeof(options) !== 'object') {
            throw new Error('The argument `options` must be object.');
        }

        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();

        if (classObj?.kind === 'string' && classObj?.raw) {
            // example `new ('Class' . 'Name')`
            return [JSONPathPHPWorkerObj.cleanValue(classObj.raw)];
        } else if (classObj?.kind === 'variable' && classObj?.name) {
            // example `new ($variable . 'Name')`
            const lookupVar = this.#lookupVariableValue(parsedCode, classObj.name, classObj?.loc?.end?.line);

            if (typeof(lookupVar) === 'string') {
                return [JSONPathPHPWorkerObj.cleanValue(lookupVar)];
            }
            // if looked up result is something else that is not string then it cannot be convert to string and can't concatenate.
            // example `$Conn = new Connection();` and `call_user_func($Conn . '::staticMethod2');`
            // will cause error "Object of class Connection could not be converted to string".
        } else if (classObj?.kind === 'magic' && classObj?.raw) {
            // example `new (__NAMESPACE__ . '\\Class')`, `call_user_func(__NAMESPACE__ . '\\Class::method')`
            if (JSONPathPHPWorkerObj.cleanValue(classObj.raw) === '__NAMESPACE__') {
                JSONPathPHPWorkerObj.getNamespaces([parsedCode]);
                if (Array.isArray(JSONPathPHPWorkerObj.namespaces) && JSONPathPHPWorkerObj.namespaces.length === 1) {
                    return JSONPathPHPWorkerObj.namespaces;
                } else {
                    if (this.#argv.debug) {
                        console.debug('    [debug] The concatenate found magic constant `__NAMESPACE__` but getting namespace result found unexpected. ' + "\n" + JSON.stringify(JSONPathPHPWorkerObj.namespaces, null, 2));
                    }
                }
            }
        } else if (classObj?.kind === 'staticlookup' && classObj?.what?.name) {
            // example `new (MyClass::class . 'Name')`
            if (classObj.what?.resolution) {
                return [classObj.what.resolution + '\\::' + JSONPathPHPWorkerObj.cleanValue(classObj.what.name)];
            } else {
                return [JSONPathPHPWorkerObj.cleanValue(classObj.what?.name)];
            }
        } else if (classObj?.kind === 'bin' && classObj?.type === '.') {
            return [
                ...this.#concatBin(parsedCode, classObj?.left, options),
                ...this.#concatBin(parsedCode, classObj?.right, options)
            ];
        }
        return [];
    }// #concatBin


    /**
     * Get class's member such as class constant, property, method.
     * 
     * @param {object} parsedCode 
     * @param {object} classMemberCalls 
     * @param {string} namespaceString 
     */
    #getClassMember(parsedCode, classMemberCalls, namespaceString) {
        if (typeof(parsedCode) !== 'object') {
            throw new Error('The argument `parsedCode` must be object.');
        }
        if (typeof(classMemberCalls) !== 'object') {
            throw new Error('The argument `classMemberCalls` must be object.');
        }
        if (typeof(namespaceString) !== 'string') {
            throw new Error('The argument `namespaceString` must be string.');
        }

        for (let eachMember of classMemberCalls) {
            let tempClassData = {};
            let fullClassName = '';
            let unresolveName = false;
            let unresolveRemark = '';
            let memberType = null;

            // check class member type. ------------------------------------
            if (typeof(eachMember.arguments) === 'object') {
                // if found arguments.
                // this is calls method but can be both non-static and static.
                if (
                    typeof(eachMember.what?.offset?.name) === 'undefined' ||
                    eachMember.what?.offset?.name !== 'class'
                ) {
                    memberType = 'method';
                } else if (
                    typeof(eachMember.what?.offset?.name) === 'string' &&
                    eachMember.what?.offset?.name === 'class'
                ) {
                    // if found something like `new (ClassD::class)`
                    memberType = 'constant';
                    if (_.some(eachMember, {'kind': 'staticlookup'})) {
                        // if there is `staticlookup` in the kind property.
                        // this update `eachMember` cannot be outside found `ClassD::class` condition.
                        eachMember = _.find(eachMember, {'kind': 'staticlookup'});
                    }
                }
            } else if (typeof(eachMember.arguments) !== 'object') {
                // if there is no argument. 
                // possibility constant or property. method also use `kind=="propertylookup"` but with argument.
                if (
                    (_.some(eachMember, {'kind': 'propertylookup'}) || 
                    _.some(eachMember, {'kind': 'nullsafepropertylookup'}))
                ) {
                    // if calls property
                    memberType = 'property';
                } else if (
                    _.some(eachMember, {'kind': 'staticlookup'}) && 
                    _.some(eachMember, {'offset': {'kind': 'variable'}})
                ) {
                    // if calls property statically
                    memberType = 'property';
                } else if (
                    _.some(eachMember, {'kind': 'staticlookup'}) && 
                    _.some(eachMember, {'offset': {'kind': 'identifier'}})
                ) {
                    // if calls constant
                    memberType = 'constant';
                }

                // the conditions to update `eachMember` object below cannot be outside no argument condition.
                if (_.some(eachMember, {'kind': 'propertylookup'})) {
                    eachMember = _.find(eachMember, {'kind': 'propertylookup'});
                } else if (_.some(eachMember, {'kind': 'nullsafepropertylookup'})) {
                    eachMember = _.find(eachMember, {'kind': 'nullsafepropertylookup'});
                } else if (_.some(eachMember, {'kind': 'staticlookup'})) {
                    eachMember = _.find(eachMember, {'kind': 'staticlookup'});
                }
            }// endif; there is argument or not.
            // end check class member type. --------------------------------

            if ('method' === memberType) {
                // if calls method.
                // process calls method. -----------------------------------
                if (typeof(eachMember.what?.what?.name) === 'string') {
                    // if found class as variable. example `$class->method()`, `Class::method()`.
                    fullClassName = this.#getClassName(parsedCode, eachMember.what, namespaceString);
                } else if (typeof(eachMember.what?.what?.what?.name) === 'string') {
                    // if found class as name. example `(new Class())->method()`
                    fullClassName = this.#getClassName(parsedCode, eachMember.what.what, namespaceString);
                }

                if ('' === fullClassName) {
                    continue;
                }
                [fullClassName, unresolveName, unresolveRemark] = this.#checkClassNameUnresolved(fullClassName);
                const methodName = (typeof(eachMember.what?.offset?.name) === 'string' ? eachMember.what.offset.name + '()' : '');

                // set these data to temporary variable.
                tempClassData = setTempClassMemberData({
                    'tempClassData': tempClassData, 
                    'fullClassName': fullClassName, 
                    'memberName': methodName,
                    'file': this.#currentCallerFile,
                    'line': eachMember.what?.offset?.loc?.start?.line,
                });
                // end process calls method. -------------------------------
            } else if ('property' === memberType) {
                // if calls property.
                // process calls property. ---------------------------------
                let propertyName = eachMember.offset?.name;
                if ('' === propertyName) {
                    continue;
                } else {
                    propertyName = '$' + propertyName;
                }

                fullClassName = this.#getClassName(parsedCode, eachMember, namespaceString);
                if ('' === fullClassName) {
                    continue;
                }
                [fullClassName, unresolveName, unresolveRemark] = this.#checkClassNameUnresolved(fullClassName);

                // set these data to temporary variable.
                tempClassData = setTempClassMemberData({
                    'tempClassData': tempClassData, 
                    'fullClassName': fullClassName, 
                    'memberName': propertyName,
                    'file': this.#currentCallerFile,
                    'line': eachMember.offset?.loc?.start?.line,
                });
                // end process calls property. -----------------------------
            } else if ('constant' === memberType) {
                // if calls class constant.
                // process calls constant. ---------------------------------
                let constantName = eachMember.offset?.name;
                if ('class' === constantName) {
                    // if found calling `ClassName::class`.
                    // this is not `Class::CONSTANT`.
                    continue;
                }

                fullClassName = this.#getClassName(parsedCode, eachMember, namespaceString);
                if ('' === fullClassName) {
                    continue;
                }
                [fullClassName, unresolveName, unresolveRemark] = this.#checkClassNameUnresolved(fullClassName);

                if ('' !== constantName) {
                    constantName = 'const ' + constantName;
                }

                // set these data to temporary variable.
                tempClassData = setTempClassMemberData({
                    'tempClassData': tempClassData, 
                    'fullClassName': fullClassName, 
                    'memberName': constantName,
                    'file': this.#currentCallerFile,
                    'line': eachMember.offset?.loc?.start?.line,
                });
                // end process calls constant. -----------------------------
            }// endif;

            if (this.#isInPHPCoreCodes(fullClassName, 'classes')) {
                continue;
            }
            if ('' !== fullClassName && !this.#isInWPCoreCodes(fullClassName, 'classes') && true === this.#removeUnmatchWPCore) {
                // if not in WP core codes, then do not display in check result.
                continue;
            }

            if (typeof(tempClassData) === 'object' && Object.entries(tempClassData).length > 0) {
                this.#setProcessedDataForClass(fullClassName, tempClassData);
            }
        }// endfor;

        /**
         * Set temporary class member data and return result.
         * 
         * @param {object} tempClassData 
         * @param {string} fullClassName 
         * @param {string} memberName 
         * @param {string} file
         * @param {string|number} line
         * @returns {object}
         */
        function setTempClassMemberData({tempClassData, fullClassName, memberName, file = '', line = ''}) {
            if (!tempClassData.hasOwnProperty(fullClassName)) {
                tempClassData[fullClassName] = {
                    'versions': {},
                    'members': {},
                }
            }// endif; full class name as property not found.
            if (!tempClassData[fullClassName].members.hasOwnProperty(memberName)) {
                tempClassData[fullClassName].members[memberName] = {
                    'versions': {},
                    'file': file,
                    'line': line,
                }
            }// endif; method not found in current class.

            return tempClassData;
        }// setTempClassMemberData
    }// #getClassMember


    /**
     * Get only class name from object `eachClass`.
     * 
     * @param {object} parsedCode
     * @param {object} eachClass Each class object that should be able to access `.what.kind` of class which value can be 'name', 'variable', 'call', 'bin', etc.
     * @param {string} namespaceString 
     * @returns {string}
     */
    #getClassName(parsedCode, eachClass, namespaceString) {
        if (typeof(parsedCode) !== 'object') {
            throw new Error('The argument `parsedCode` must be object.');
        }
        if (typeof(eachClass) !== 'object') {
            throw new Error('The argument `eachClass` must be object.');
        }
        if (typeof(namespaceString) !== 'string') {
            throw new Error('The argument `namespaceString` must be string.');
        }

        const JSONPathPHPCallerObj = new JSONPathPHPCaller();

        let fullClassName = '';
        if (
            eachClass?.what?.kind === 'name' && 
            typeof(eachClass?.what?.name) === 'string'
        ) {
            // if class name is string
            // possibilities: `call_user_func('ClassName')`, 
            // `call_user_func('Class::staticMethod')`,
            // `call_user_func('Class' . 'Name::staticMethod')`,
            // `call_user_func($classString . '::staticMethod')`,
            // `call_user_func(['Class', 'staticMethod'])`,
            // `call_user_func([$class, 'method'])`,
            // `call_user_func([ClassName::class, 'method'])`,
            // `new Class()`,
            // `Class::staticMethod()`, 
            // `Class::CONSTANT`, 
            // `ClassName::class`

            if (['call_user_func', 'call_user_func_array'].includes(eachClass.what.name)) {
                // if the name is `call_user_funcxxx()`.
                // process class name in `call_user_funcxxx()`. ------------------
                const firstArg = (typeof(eachClass.arguments) === 'object' && Array.isArray(eachClass.arguments) ? eachClass.arguments[0] : {});
                if (firstArg.kind === 'string') {
                    // if first argument is string.
                    // for example `call_user_func('Class::method')`
                    if (firstArg.raw.includes('::')) {
                        // if found `::` for `Class::method`.
                        // the class name is already fqn.
                        const classSplitted = JSONPathPHPWorker.staticCleanValue(firstArg.raw).split('::');
                        fullClassName = classSplitted[0];
                        
                        this.#setTempClassData(fullClassName, classSplitted[1] + '()');
                    }
                } else if (firstArg.kind === 'bin') {
                    // if first argument is concatenate.
                    // for example `call_user_func('Class' . '::method')`, `call_user_func($classString . '::method')`.
                    let concatResultArray = this.#concatBin(parsedCode, firstArg, {'namespaceString': namespaceString});
                    if (!concatResultArray.join('').includes('::')) {
                        // if not found calling of `Class::staticMethod`.
                        // it is possible be calls function, do not work here.
                        return '';
                    }

                    concatResultArray = this.#resolveClassNameResolutionFromArray(parsedCode, concatResultArray, {
                        'codeLine': eachClass.loc?.end?.line,
                        'namespaceString': namespaceString,
                    })
                    const concatenated = concatResultArray.join('');
                    const concatenatedSplitted = concatenated.split('::');
                    fullClassName = concatenatedSplitted[0];

                    this.#setTempClassData(fullClassName, concatenatedSplitted[1] + '()');
                } else if (firstArg.kind === 'array') {
                    // if fisrt argument is array. 
                    // for example `call_user_func(['Class', 'method'])`, `call_user_func([$class, 'method'])`
                    if (typeof(firstArg.items) === 'object' && Array.isArray(firstArg.items)) {
                        if (firstArg.items[0].value?.kind === 'string' && firstArg.items[0].value?.raw) {
                            // if first array value is string.
                            // this is already fqn.
                            fullClassName = JSONPathPHPWorker.staticCleanValue(firstArg.items[0].value.raw);
                        } else if (firstArg.items[0].value?.kind === 'variable') {
                            // if first array value is variable. (`[$class, 'method']`)
                            const lookupVarResult = this.#lookupVariableValue(parsedCode, firstArg.items[0].value.name, firstArg.items[0].value?.loc?.end?.line);
                            if (typeof(lookupVarResult) === 'string') {
                                fullClassName = lookupVarResult;
                            } else if (typeof(lookupVarResult) === 'object') {
                                const queriedClass = JSONPathPHPCallerObj.queryPHPClass({'children': lookupVarResult});
                                if (typeof(queriedClass) === 'object' && Array.isArray(queriedClass) && queriedClass.length > 0) {
                                    fullClassName = this.#getClassName(parsedCode, queriedClass[0], namespaceString);
                                }
                            }
                        } else if (firstArg.items[0].value?.kind === 'new') {
                            // if first array value is new object. (`[new ClassName, 'method']`)
                            fullClassName = this.#getClassName(parsedCode, firstArg.items[0].value, namespaceString);
                        } else if (firstArg.items[0].value?.kind === 'staticlookup') {
                            // if first array value is static lookup. (`[ClassName::class, 'method']`)
                            fullClassName = this.#getClassName(parsedCode, firstArg.items[0].value, namespaceString);
                        }

                        // get method from second array.
                        if (firstArg.items[1].value?.kind === 'string' && firstArg.items[1].value?.raw) {
                            this.#setTempClassData(fullClassName, JSONPathPHPWorker.staticCleanValue(firstArg.items[1].value.raw) + '()');
                        } else if (firstArg.items[1].value?.kind === 'variable') {
                            const lookupVarResult = this.#lookupVariableValue(parsedCode, firstArg.items[1].value.name, firstArg.items[1].value?.loc?.end?.line);
                            if (typeof(lookupVarResult) === 'string') {
                                this.#setTempClassData(fullClassName, lookupVarResult + '()');
                            } else {
                                if (this.#argv.debug) {
                                    console.debug('    [debug] Unable to lookup method that use variable `' + firstArg.items[1].value.name + '`. Result:' + JSON.stringify(lookupVarResult, null, 4));
                                }
                            }
                        }// endif;
                        // end get method from second array.
                    }// endif;
                }
                // end process class name in `call_user_funcxxx()`. --------------
            } else {
                // if anything that is not `call_user_funcxxx()`.
                // for example `new Class()`. 
                // for `Class::method()`, some time they are in `new (..)` such as `new(Class::method())` but it's ok to resolve name for all.
                const options = {
                    'namespaceString': namespaceString,
                    'codeLine': eachClass?.what?.loc?.end?.line,
                };
                fullClassName = this.#resolveClassNameResolution(parsedCode, eachClass?.what?.name, eachClass?.what?.resolution, options);

                // `eachClass` does not contain `arguments` property which is one level upper than `eachClass` object.
                // So, can't get class members from here because unable to determine that it is class constant, or method.
            }// endif; the name is `call_user_funcxxx()` or not.
        } else if (eachClass?.what?.kind === 'variable') {
            // if class name is variable. 
            // possibilities: `new $class()`, 
            // `$Conn::X`.
            const lookupClassName = this.#lookupVariableValue(parsedCode, eachClass?.what?.name, eachClass?.loc?.end?.line);

            if (typeof(lookupClassName) === 'string') {
                // if there is class name in variable and its type is string.
                // this class name will always be fqn.
                fullClassName = lookupClassName;
            } else {
                if (
                    typeof(lookupClassName) === 'object' &&
                    Array.isArray(lookupClassName)
                ) {
                    // if looked up result is an object, it's needed to get its name again.
                    if (this.#argv?.debug) {
                        console.debug('    [debug] This class is in a variable and its value is an object (for example `$class = new ClassName();` and use `$class::MY_CONSTANT`), getting the name of that object again.');
                    }
                    if (typeof(lookupClassName[0]?.expression?.right) === 'object') {
                        fullClassName = this.#getClassName(parsedCode, lookupClassName[0].expression.right, namespaceString);
                    }
                } else {
                    if (this.#argv?.debug) {
                        console.debug('    [debug] ' + TextStyles.txtWarning('Unknown class variable value. ' + "\n" + JSON.stringify(lookupClassName, null, 4)));
                    }
                }
            }

            if (!eachClass.arguments && eachClass.offset?.name) {
                this.#setTempClassData(fullClassName, 'const ' + eachClass.offset.name);
            }
        } else if (eachClass?.what?.kind === 'call') {
            // if calling something to be class name.
            // possibilities: `new (getSomeClass())`, 
            // `new (MyClass::getClassName())`
            // this maybe a function, class:method and it is possible to be in other file. 
            // so, it's have to lookup all of them for the result (class name) since this is working only on a single file.
            // this will be set the caller name (such as function) as class name but mark that it is un-resolved (`-1:` prefixed).
            if (eachClass.what?.what?.kind === 'name' && typeof(eachClass.what?.what?.name) === 'string') {
                // if possibility calls function.
                fullClassName = '-1:name_in_function:' + eachClass.what.what.name + '()';
            } else if (eachClass.what?.what?.kind === 'staticlookup' && typeof(eachClass.what?.what?.what?.name) === 'string') {
                // if possibility calls of class and static method (`Class::method()`).
                fullClassName = '-1:name_in_class:' + eachClass.what.what.what.name;
                if (typeof(eachClass.what.what?.offset?.name) === 'string') {
                    fullClassName += '::' + eachClass.what.what.offset.name + '()';
                }
            } else {
                fullClassName = '-1:';
            }
        } else if (eachClass?.what?.kind === 'bin') {
            // if the class name is concatnate string.
            // possibilities: `new ('Class' . 'Tw' . 'o')`, 
            // `new ($className . 'Two')`,
            // `new (ClassD::class . 'uplicate')`,
            // `new (MyProject\ClassD::class . 'uplicate')`
            let concatResultArray = this.#concatBin(parsedCode, eachClass.what, {'namespaceString': namespaceString});
            // resolve each name (if contain name resolution `\\::`) before join them, otherwise it can be wrong result.
            // for example `ClassD::class . 'uplicate'` from `use MyProject\ClassD` 
            // the result with concatenate will be `ClassDuplicate` before lookup `use *\ClassDuplicate` and then not found,
            // while the correct should be lookup `use *\ClassD` and the result with concatenate will be `MyProject\ClassDulicate`.
            concatResultArray = this.#resolveClassNameResolutionFromArray(parsedCode, concatResultArray, {
                'codeLine': eachClass.loc?.end?.line,
                'namespaceString': namespaceString,
            })
            // join resolved name parts.
            fullClassName = concatResultArray.join('');
        } else {
            if (this.#argv?.debug) {
                console.debug('    [debug] ' + TextStyles.txtWarning('Unknown class kind.' + JSON.stringify(eachClass, null, 2)));
            }
        }// endif; what.kind of class calls

        if (typeof(fullClassName) !== 'string') {
            fullClassName = '';
        }
        return fullClassName;
    }// #getClassName


    /**
     * Check if code name (function, constant) is in PHP core code or not.
     * 
     * @param {string} codeName Code name to check.
     * @param {string} type Type of code to check. Accept 'functions', 'constants', 'classes'.
     * @returns {boolean} Return `true` if it is, `false` if it is not.
     */
    #isInPHPCoreCodes(codeName, type) {
        if (typeof(this.#phpCoreCodesObj[type]) === 'object') {
            if (this.#phpCoreCodesObj[type].includes(codeName)) {
                return true;
            }
        }
        return false;
    }// #isInPHPCoreCodes


    /**
     * Check if code name is in WordPress core code or not.
     * 
     * @param {string} codeName Code name to check.
     * @param {string} type Type of code to check. Accept 'functions', 'constants', 'classes'.
     * @returns {boolean} Return `true` if it is, `false` if it is not.
     */
    #isInWPCoreCodes(codeName, type) {
        if (typeof(this.#coreDataObj[type]) === 'object') {
            if (typeof(this.#coreDataObj[type][codeName]) === 'object') {
                return true;
            }
        }
        return false;
    }// #isInWPCoreCodes


    /**
     * Lookup code name that use the `use Namespace`.
     * 
     * @param {object} parsedCode 
     * @param {string} codeName 
     * @param {number|string} codeLine 
     * @param {string} importType The alias/import type. Accepted: 'constants', 'functions', 'classes'. Default is 'constants'.
     * @returns {string} Return value as string. Return empty string if could not found look up `use`.
     */
    #lookupUseAs(parsedCode, codeName, codeLine, importType = 'constants') {
        if (typeof(codeName) !== 'string') {
            throw new Error('The argument `codeName` must be string.');
        }
        if (typeof(codeLine) !== 'string' && typeof(codeLine) !== 'number') {
            throw new Error('The argument `codeLine` must be number.');
        }
        if (typeof(importType) !== 'string') {
            throw new Error('The argument `importType` must be string.');
        }
        if (!['constants', 'functions', 'classes'].includes(importType)) {
            importType = 'constants';
        }

        const JSONPathPHPCallerObj = new JSONPathPHPCaller();

        const codeNameSplitted = codeName.split('\\');
        // example `codeName` is `MPJ\SubProject`.
        // `codeNameSplitted[0]` will be `MPJ`.
        const codeNameFromFirstPath = codeNameSplitted[0];
        const queriedReferedUseAs = JSONPathPHPCallerObj.queryPHPUseAs(parsedCode, codeLine, importType);
        let fullResultName = '';

        if (Array.isArray(queriedReferedUseAs) && queriedReferedUseAs.length > 0) {
            queriedReferedUseAs.reverse();
            loopQueriedReferedUseAs:
            for (const eachQueried of queriedReferedUseAs) {
                let namespaceName = '';
                if (typeof(eachQueried.name) === 'string' && '' !== eachQueried.name) {
                    // if found group `use`.
                    namespaceName = eachQueried.name + '\\';
                }
                if (Array.isArray(eachQueried.items) && eachQueried.items.length > 0) {
                    for (const eachItem of eachQueried.items) {
                        if (eachItem.alias?.name === codeNameFromFirstPath) {
                            // if found in alias name (`use..as..`)
                            fullResultName = namespaceName + JSONPathPHPWorker.staticCleanValue(eachItem.name);
                            codeNameSplitted.splice(0, 1);// remove first namespace segment from code name.
                            if (codeNameSplitted.length > 0) {
                                fullResultName += '\\';
                            }
                            // append with the code name that removed first namespace segment.
                            fullResultName += codeNameSplitted.join('\\');
                            break loopQueriedReferedUseAs;
                        } else if (!eachItem.alias?.name && typeof(eachItem.name) === 'string' && '' !== eachItem.name) {
                            // if not found in alias name (the import is just `use..`)
                            // if not check for matched type, it can mismatch `echo TASK_DATE;` to be `use MyProject\TASK_DATE;` which is not for constant in the "uqn" resolution.
                            let matchedType = false;
                            if ('constants' === importType && eachQueried.type === 'const') {
                                matchedType = true;
                            } else if ('functions' === importType && eachQueried.type === 'function') {
                                matchedType = true;
                            } else if ('classes' === importType && eachQueried.type === null) {
                                matchedType = true;
                            }

                            if (true === matchedType) {
                                const nameSplitted = eachItem.name.split('\\');
                                if (nameSplitted.at(-1) === codeNameFromFirstPath) {
                                    // if found in the last part of `items[{name: "here"}]`.
                                    fullResultName = namespaceName + JSONPathPHPWorker.staticCleanValue(eachItem.name);
                                    codeNameSplitted.splice(0, 1);// remove first namespace segment from code name.
                                    if (codeNameSplitted.length > 0) {
                                        fullResultName += '\\';
                                    }
                                    // append with the code name that removed first namespace segment.
                                    fullResultName += codeNameSplitted.join('\\');
                                    break loopQueriedReferedUseAs;
                                }
                            }// endif; matched type
                        }
                    }// endfor; items
                }
            }// endfor; queried uses
        }

        return fullResultName;
    }// #lookupUseAs


    /**
     * Lookup variable value.
     * 
     * @param {object} parsedCode 
     * @param {string} variableName 
     * @param {number|string} variableLine 
     * @returns {string|object} Return value as string if found basic value, or return as object for otherwise.
     */
    #lookupVariableValue(parsedCode, variableName, variableLine) {
        if (typeof(parsedCode) !== 'object') {
            throw new Error('The argument `parsedCode` must be object.');
        }
        if (typeof(variableName) !== 'string') {
            throw new Error('The argument `variableName` must be string.');
        }
        if (typeof(variableLine) !== 'string' && typeof(variableLine) !== 'number') {
            throw new Error('The argument `variableLine` must be number.');
        }

        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const queriedVariables = JSONPathPHPCallerObj.queryPHPVariable(parsedCode, variableName, variableLine);

        if (queriedVariables.length > 1) {
            queriedVariables.splice(0, (queriedVariables.length) - 1);// remove anything but keep the last one.
        }

        if (
            typeof(queriedVariables[0]) === 'object' &&
            typeof(queriedVariables[0]?.expression?.right?.raw) === 'string' &&
            queriedVariables[0].expression.right.raw
        ) {
            return JSONPathPHPWorker.staticCleanValue(queriedVariables[0].expression.right.raw);
        }

        return queriedVariables;
    }// #lookupVariableValue


    /**
     * Resolve class name resolution with namespace resolution rules.
     * 
     * @link https://www.php.net/manual/en/language.namespaces.rules.php Reference
     * @param {object} parsedCode
     * @param {string} className 
     * @param {string} resolution The name resolution such as fqn, uqn, qn, rn.
     * @param {object} options The options:
     * @param {string} options.namespaceString
     * @param {number|string} options.codeLine
     * @returns {string}
     */
    #resolveClassNameResolution(parsedCode, className, resolution, options = {}) {
        if (typeof(parsedCode) !== 'object') {
            throw new Error('The argument `parsedCode` must be object.');
        }
        if (typeof(className) !== 'string') {
            throw new Error('The argument `className` must be string.');
        }
        if (typeof(resolution) !== 'string') {
            throw new Error('The argument `resolution` must be string.');
        }
        if (typeof(options) !== 'object') {
            throw new Error('The argument `options` must be object.');
        }

        let namespaceString = '';
        if (typeof(options?.namespaceString) === 'string') {
            namespaceString = options.namespaceString;
        }
        if ('' !== namespaceString) {
            namespaceString += '\\';
        }

        if ('fqn' === resolution) {
            return Path.removeBeginSlash(className);
        } else if ('rn' === resolution) {
            return namespaceString + className;
        } else if ('qn' === resolution) {
            const lookupValue = this.#lookupUseAs(parsedCode, className, options?.codeLine, 'classes');
            if ('' !== lookupValue) {
                // if found in `use` or import rule. (PHP name resolution rules 3).
                return lookupValue;
            } else {
                // if no import rule applies. (PHP name resolution rules 4).
                return namespaceString + className;
            }
        } else if ('uqn' === resolution) {
            const lookupValue = this.#lookupUseAs(parsedCode, className, options?.codeLine, 'classes');
            if ('' !== lookupValue) {
                // if found in `use` or import rule. (PHP name resolution rules 5).
                return lookupValue;
            } else {
                // if no import rule applies. (PHP name resolution rules 6).
                return namespaceString + className;
            }
        } else {
            console.warn('    ' + TextStyles.txtWarning('Unknown qualified name "' + resolution + '" for class `' + className + '`.'));
        }

        return className;
    }// #resolveClassNameResolution


    /**
     * Resolve class name resolution from array that have got from `#concateBin()`.
     * 
     * @param {object} parsedCode 
     * @param {Array} concatResultArray 
     * @param {object} options The options
     * @param {string} options.namespaceString The namespace string to use as prepend.
     * @param {number|string} options.codeLine The code line number.
     * @returns 
     */
    #resolveClassNameResolutionFromArray(parsedCode, concatResultArray, options = {}) {
        if (typeof(parsedCode) !== 'object') {
            throw new Error('The argument `parsedCode` must be object.');
        }
        if (!Array.isArray(concatResultArray)) {
            throw new Error('The argument `concatResultArray` must be array.');
        }
        if (typeof(options) !== 'object') {
            throw new Error('The argument `options` must be object.');
        }

        concatResultArray.forEach((item, index) => {
            if (item.match(/^(\w+n)\\::(.*)/)) {
                // if found name resolution prefix. example `uqn\\::ClassName`.
                const matches = item.match(/^(?<resolution>\w+n)\\::(?<classname>.*)/);
                const nameResolution = matches.groups.resolution;
                const className = matches.groups.classname;
                const resolveResolutionOptions = {
                    'namespaceString': (options?.namespaceString ?? ''),
                    'codeLine': (options?.codeLine ?? 0),
                };
                const resolvedName = this.#resolveClassNameResolution(parsedCode, className, nameResolution, resolveResolutionOptions);
                if (typeof(resolvedName) === 'string' && '' !== resolvedName) {
                    concatResultArray[index] = resolvedName;
                }
            }
        });// end forEach;

        return concatResultArray;
    }// #resolveClassNameResolutionFromArray


    /**
     * Resolve unqualified names (UQN).
     * 
     * @link https://www.php.net/manual/en/language.namespaces.rules.php Reference
     * @param {object} parsedCode 
     * @param {object} options The options:
     * @param {string} options.namespacePrepend Namespace string to prepend.
     * @param {string} options.rawCodeName Raw code name without clean value.
     * @param {string|number} options.codeLine Code line number.
     * @param {string} options.type Code type. Accepted 'constants', 'functions'. Default is 'constants'.
     * @returns {string} Return resolved name.
     */
    #resolveUQN(parsedCode, options = {}) {
        if (typeof(parsedCode) !== 'object') {
            throw new Error('The argument `parsedCode` must be object.');
        }
        if (typeof(options) !== 'object') {
            throw new Error('The argument `options` must be object.');
        }
        if (typeof(options.namespacePrepend) !== 'string') {
            throw new Error('The argument `options.namespacePrepend` must be string.');
        }
        if (typeof(options.rawCodeName) !== 'string') {
            throw new Error('The argument `options.rawCodeName` must be string.');
        }
        if (typeof(options.codeLine) !== 'string' && typeof(options.codeLine) !== 'number') {
            throw new Error('The argument `options.codeLine` must be number.');
        }
        if (typeof(options.type) !== 'string' && typeof(options.type) !== 'undefined') {
            throw new Error('The argument `options.type` must be string.');
        }

        if (!['constants', 'functions'].includes(options.type)) {
            options.type = 'constants';
        }

        let fullCodeName = '';
        const cleanedCodeName = JSONPathPHPWorker.staticCleanValue(options.rawCodeName);
        let cleanedCodeNameForCheck = cleanedCodeName;
        if ('functions' === options.type) {
            cleanedCodeNameForCheck += '()';
        }

        const lookupResult = this.#lookupUseAs(parsedCode, options.rawCodeName, options.codeLine, options.type);

        let coreDataObj = {};
        if (typeof(this.#coreDataObj[options.type]) === 'object') {
            coreDataObj = this.#coreDataObj[options.type];
        }

        if ('' !== lookupResult) {
            // if found in the lookup value. (PHP name resolution rules 5).
            fullCodeName = lookupResult;
        } else if (typeof(coreDataObj[options.namespacePrepend + cleanedCodeNameForCheck]) === 'object') {
            // if prepended namespace and found in core data or as namespace with user-defined code. (PHP name resolution rules 7.1).
            fullCodeName = options.namespacePrepend + cleanedCodeName;
        } else {
            // if none of above were found.
            if (typeof(coreDataObj[cleanedCodeNameForCheck]) === 'object') {
                // if the name itself was found in core data or as global user-defined code. (PHP name resolution rules 7.2).
                fullCodeName = cleanedCodeName;
            } else {
                // if the name itself was not found in core data.
                // check with PHP.
                let foundInCore = this.#isInPHPCoreCodes(cleanedCodeName, options.type);

                if (true === foundInCore) {
                    // if found in PHP built-in code. (PHP name resolution rules 7.2).
                    fullCodeName = cleanedCodeName;
                } else {
                    // if not found in PHP.
                    // just back to use prepended namespace.
                    fullCodeName = options.namespacePrepend + cleanedCodeName;
                }// endif;
            }// endif;
        }// endif;

        return fullCodeName;
    }// #resolveUQN


    /**
     * Set class's processed data to `#processedData` property.
     * 
     * @param {string} fullClassName 
     * @param {object} processData 
     */
    #setProcessedDataForClass(fullClassName, processData) {
        if (typeof(fullClassName) !== 'string') {
            throw new Error('The argument `fullClassName` must be string.');
        }
        if (typeof(processData) !== 'object') {
            throw new Error('The argument `processData` must be object.');
        }

        // check not exists first due to it's possible to be duplicated from query explicit class & anonymous class then get class names at once.
        if (!_.some(this.#processedData, fullClassName)) {
            // if class is not exists in processed data property.
            this.#processedData.push(processData);
        } else {
            // if class is already exists but members maybe not.
            for (const [eachMember, value] of Object.entries(processData[fullClassName].members)) {
                const processedDataIndexOfClass = _.findIndex(this.#processedData, fullClassName);

                if (typeof(this.#processedData[processedDataIndexOfClass][fullClassName]?.members[eachMember]) !== 'object') {
                    this.#processedData[processedDataIndexOfClass][fullClassName].members[eachMember] = value;
                }
            }// endfor;
        }
    }// #setProcessedDataForClass


    /**
     * Set temporary class members data such as constants, properties, method to `#tempClassData` property.
     * 
     * @param {string} className 
     * @param {string} memberName The name should already prepend/append with sign.  
     *      For example `const CONSTANT_NAME` for class constant,
     *      `method()` for method,  `$property` for property.
     */
    #setTempClassData(className, memberName) {
        if ('' === className || '' === memberName) {
            return ;
        }

        if (typeof(this.#tempClassData[className]) !== 'object') {
            this.#tempClassData[className] = {
                'members': {},
            };
        }

        if (typeof(this.#tempClassData[className].members) !== 'object') {
            this.#tempClassData[className].members = {};
        }

        if (typeof(this.#tempClassData[className].members[memberName]) !== 'object') {
            this.#tempClassData[className].members[memberName] = {
                'versions': {},
            };
        }
    }// #setTempClassData


    /**
     * Get class calls.
     * 
     * This progress is working on parsed of single file.
     * 
     * On success, get processed data on `processedData` property.
     * 
     * @param {object} namespaces 
     * @param {object} classes 
     * @param {string} namespaceString 
     */
    getClasses(namespaces, classes, namespaceString = '') {
        this.#checkRequiredProperties();

        const JSONPathPHPCallerObj = new JSONPathPHPCaller();

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
                const classesInNS = JSONPathPHPCallerObj.queryPHPClass(eachNS);
                if (classesInNS.length > 0) {
                    this.getClasses(eachNS, classesInNS, namespaceString);
                }
            }// endfor; namespaces
        } else {
            // if there is no namespaces
            let parsedCode = namespaces;
            if (Array.isArray(namespaces) && namespaces.length <= 0) {
                parsedCode = this.#parsedCode;
            }

            for (const eachClass of classes) {
                let fullClassName = '';
                let unresolveName = false;
                let unresolveRemark = '';
                
                fullClassName = this.#getClassName(parsedCode, eachClass, namespaceString);
                fullClassName = fullClassName.replace(/\\\\/g, '\\');

                [fullClassName, unresolveName, unresolveRemark] = this.#checkClassNameUnresolved(fullClassName);

                if (this.#isInPHPCoreCodes(fullClassName, 'classes')) {
                    fullClassName = '';
                }
                if ('' !== fullClassName && !this.#isInWPCoreCodes(fullClassName, 'classes') && true === this.#removeUnmatchWPCore) {
                    // if not in WP core codes, then do not display in check result.
                    fullClassName = '';
                }

                if ('' === fullClassName) {
                    continue;
                }

                const processData = {};
                processData[fullClassName] = {
                    'versions': {},
                    'file': this.#currentCallerFile,
                    'line': eachClass.loc?.start?.line,
                }
                if (true === unresolveName) {
                    processData[fullClassName].unresolveName = true;
                    processData[fullClassName].unresolveRemark = (unresolveRemark ?? '');
                }
                processData[fullClassName].members = {};
                if (
                    typeof(this.#tempClassData[fullClassName]) === 'object' &&
                    typeof(this.#tempClassData[fullClassName]?.members) === 'object'
                ) {
                    processData[fullClassName].members = this.#tempClassData[fullClassName].members;
                }

                this.#setProcessedDataForClass(fullClassName, processData);
            }// endfor classes

            this.#tempClassData = {};
            // get class's member such as class's constants, properties, methods.
            const classMemberCalls = JSONPathPHPCallerObj.queryPHPClassMember(parsedCode);
            this.#getClassMember(parsedCode, classMemberCalls, namespaceString);
        }// endif; there is namespaces or not
    }// getClasses


    /**
     * Get constant calls.
     * 
     * This progress is working on parsed of single file.
     * 
     * On success, get processed data on `processedData` property.
     * 
     * Note that it is possible that these code can get from this method due to **glayzzle/php-parser** use ambiguous `kind`.  
     *      `interface InterfaceName` becomes constant `InterfaceName`.  
     *      `class ClassName implement InterfaceName` becomes constant `InterfaceName`.  
     *      `trait TraitName` becomes constant `TraitName`.  
     *      `use TraitName` becomes constant `TraitName`.  
     *      `catch(\Exception $ex)` becomes constant `Exception`.
     * 
     * @link https://en.wikipedia.org/wiki/Fully_qualified_name fqn definition.
     * @param {object} namespaces 
     * @param {object} constants 
     * @param {string} namespaceString 
     */
    getConstants(namespaces, constants, namespaceString = '') {
        this.#checkRequiredProperties();

        const JSONPathPHPCallerObj = new JSONPathPHPCaller();

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
                const constantsInNS = JSONPathPHPCallerObj.queryPHPConstant(eachNS);
                if (constantsInNS.length > 0) {
                    this.getConstants(eachNS, constantsInNS, namespaceString);
                }
            }// endfor; namespaces
        } else {
            // if there is no namespaces
            let parsedCode = namespaces;
            if (Array.isArray(namespaces) && namespaces.length <= 0) {
                parsedCode = this.#parsedCode;
            }
            const namespacePrepend = ('' !== namespaceString ? namespaceString + '\\' : '');

            for (let eachConstant of constants) {
                if (typeof(eachConstant.right) === 'object') {
                    eachConstant = eachConstant.right;
                }

                let fullConstantName = '';
                let codeStartLine = '';
                if (eachConstant.kind === 'name' && eachConstant.name) {
                    // if constant is simple echo, just call to constant, inside function calls.
                    const constantName = JSONPathPHPWorker.staticCleanValue(eachConstant.name);

                    // resolve full constant name. ------------------------------------------
                    if ('fqn' === eachConstant.resolution) {
                        // if fully qualified name. (PHP name resolution rules 1).
                        fullConstantName = Path.removeBeginSlash(constantName);
                    } else if ('rn' === eachConstant.resolution) {
                        // if relative name. (PHP name resolution rules 2).
                        fullConstantName = namespacePrepend + constantName;
                    } else if ('qn' === eachConstant.resolution) {
                        // if qualified name. (PHP name resolution rules 3 & 4).
                        fullConstantName = this.#lookupUseAs(parsedCode, eachConstant.name, eachConstant.loc.end.line);
                        if ('' === fullConstantName) {
                            fullConstantName = namespacePrepend + constantName;
                        }
                    } else if ('uqn' === eachConstant.resolution) {
                        // if unqualified name.
                        fullConstantName = this.#resolveUQN(parsedCode, {
                            'rawCodeName': eachConstant.name,
                            'codeLine': eachConstant.loc.end.line,
                            'namespacePrepend': namespacePrepend,
                        });
                    } else {
                        console.warn('    ' + TextStyles.txtWarning('Unknown qualified name "' + eachConstant.resolution + '" for constant `' + eachConstant.name + '`.'));
                    }
                    // end resolve full constant name. --------------------------------------

                    codeStartLine = eachConstant.loc?.start?.line;
                } else if (
                    eachConstant.kind === 'call' &&
                    eachConstant.what.name === 'constant' &&
                    typeof(eachConstant.arguments) === 'object' && 
                    typeof(eachConstant.arguments[0]) === 'object'
                ) {
                    // if constant is inside `constant()` function calls.
                    if (eachConstant.arguments[0].kind === 'string') {
                        fullConstantName = JSONPathPHPWorker.staticCleanValue(eachConstant.arguments[0].raw);
                    } else if (eachConstant.arguments[0].kind === 'variable') {
                        const variableName = eachConstant.arguments[0].name;
                        const variableLine = eachConstant.arguments[0].loc.end.line;
                        const lookupVarResult = this.#lookupVariableValue(parsedCode, variableName, variableLine);
                        if (typeof(lookupVarResult) === 'string') {
                            fullConstantName = lookupVarResult;
                            codeStartLine = eachConstant.arguments[0].loc?.start?.line;
                        }
                    }// endif; kind of argument's first value
                }// endif; constant is inside `constant()`.

                if ('' !== fullConstantName && this.#isInPHPCoreCodes(fullConstantName, 'constants')) {
                    fullConstantName = '';
                }
                if ('' !== fullConstantName && !this.#isInWPCoreCodes(fullConstantName, 'constants') && true === this.#removeUnmatchWPCore) {
                    // if not in WP core codes, then do not display in check result.
                    fullConstantName = '';
                }
                if ('' !== fullConstantName) {
                    fullConstantName = fullConstantName.replace(/\\\\/g, '\\');
                }

                if (
                    typeof(fullConstantName) === 'string' && 
                    '' !== fullConstantName &&
                    !_.some(this.#processedData, {'name': fullConstantName})
                ) {
                    // if full constant name is string and not empty and this name is not stored (no duplicated).
                    const result = {
                        'name': fullConstantName,
                        'file': this.#currentCallerFile,
                        'line': codeStartLine,
                    };
                    this.#processedData.push(result);
                }// endif; full constant name is not empty
            }// endfor constants
        }// endif; there is namespaces or not
    }// getConstants


    /**
     * Get functions calls.
     * 
     * This progress is working on parsed of single file.
     * 
     * On success, get processed data on `processedData` property.
     * 
     * @link https://en.wikipedia.org/wiki/Fully_qualified_name fqn definition.
     * 
     * @param {object} namespaces 
     * @param {object} functions 
     * @param {string} namespaceString 
     */
    getFunctions(namespaces, functions, namespaceString = '') {
        this.#checkRequiredProperties();

        const thisClass = this;
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();

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
                const functionsInNS = JSONPathPHPCallerObj.queryPHPFunction(eachNS);
                if (functionsInNS.length > 0) {
                    this.getFunctions(eachNS, functionsInNS, namespaceString);
                }
            }// endfor; namespaces
        } else {
            // if there is no namespaces
            let parsedCode = namespaces;
            if (Array.isArray(namespaces) && namespaces.length <= 0) {
                parsedCode = this.#parsedCode;
            }
            const namespacePrepend = ('' !== namespaceString ? namespaceString + '\\' : '');

            for (const eachFunction of functions) {
                if (!eachFunction.arguments) {
                    // if there is no arguments means it is not function calls.
                    continue;
                }

                let fullFunctionName = '';
                let functionFirstArgsName = [];
                let codeStartLine = '';
                if (eachFunction.what.kind === 'name' && !eachFunction.what.name.match(/^call_user_func/g)) {
                    // if this is normal, basic function calls.
                    const functionName = JSONPathPHPWorker.staticCleanValue(eachFunction.what.name);
                    // resolve full function name. ------------------------------------------
                    if ('fqn' === eachFunction.what.resolution) {
                        // if fully qualified name. (PHP name resolution rules 1).
                        fullFunctionName = Path.removeBeginSlash(functionName);
                    } else if ('rn' === eachFunction.what.resolution) {
                        // if relative name. (PHP name resolution rules 2).
                        fullFunctionName = namespacePrepend + functionName;
                    } else if ('qn' === eachFunction.what.resolution) {
                        // if qualified name. (PHP name resolution rules 3 & 4).
                        fullFunctionName = this.#lookupUseAs(parsedCode, eachFunction.what.name, eachFunction.what.loc.end.line, 'functions');
                        if ('' === fullFunctionName) {
                            fullFunctionName = namespacePrepend + functionName;
                        }
                    } else if ('uqn' === eachFunction.what.resolution) {
                        // if unqualified name.
                        fullFunctionName = this.#resolveUQN(parsedCode, {
                            'rawCodeName': eachFunction.what.name,
                            'codeLine': eachFunction.what.loc.end.line,
                            'namespacePrepend': namespacePrepend,
                            'type': 'functions',
                        });
                    } else {
                        console.warn('    ' + TextStyles.txtWarning('Unknown qualified name "' + eachFunction.what.resolution + '" for function `' + eachFunction.what.name + '()`.'));
                    }
                    // end resolve full function name. --------------------------------------

                    codeStartLine = eachFunction.what?.loc?.start?.line;
                } else if (eachFunction.what.kind === 'variable') {
                    // if this is function calls based on variable. example: `$myFunction()`.
                    const variableLine = eachFunction.loc.end.line;
                    const variableName = eachFunction.what.name;
                    const lookupVarResult = this.#lookupVariableValue(parsedCode, variableName, variableLine);
                    if (typeof(lookupVarResult) === 'string') {
                        fullFunctionName = lookupVarResult;
                    } else {
                        fullFunctionName = '$' + eachFunction.what.name;
                    }

                    codeStartLine = eachFunction.what?.loc?.start?.line;
                } else if (eachFunction.what.name.match(/^call_user_func/g)) {
                    // if this is `call_user_funcxxx()`.
                    if (
                        typeof(eachFunction.arguments) === 'object' &&
                        typeof(eachFunction.arguments[0]) === 'object'
                    ) {
                        if (
                            eachFunction.arguments[0].kind === 'string' &&
                            !eachFunction.arguments[0].raw.includes('::')
                        ) {
                            // if 1st argument of `call_user_funcxxx()` is not calls class::method and is calling function.
                            fullFunctionName = Path.removeBeginSlash(JSONPathPHPWorker.staticCleanValue(eachFunction.arguments[0].raw));
                        } else if (eachFunction.arguments[0].kind === 'variable') {
                            // if 1st argument of `call_user_funcxxx()` is variable.
                            const variableLine = eachFunction.arguments[0].loc.end.line;
                            const variableName = eachFunction.arguments[0].name;
                            const lookupVarResult = this.#lookupVariableValue(parsedCode, variableName, variableLine);
                            if (typeof(lookupVarResult) === 'string') {
                                fullFunctionName = lookupVarResult;
                                codeStartLine = eachFunction.arguments[0].loc?.start?.line;
                            }
                        }// endif; 1st argument is...
                    }// endif; there is argument for `call_user_funcxxx()`.
                }// endif; kind of function calls.

                if ('' !== fullFunctionName && this.#isInPHPCoreCodes(fullFunctionName, 'functions')) {
                    fullFunctionName = '';
                }
                if ('' !== fullFunctionName && !this.#isInWPCoreCodes(fullFunctionName + '()', 'functions') && true === this.#removeUnmatchWPCore) {
                    // if not in WP core codes, then do not display in check result.
                    fullFunctionName = '';
                }
                if ('' !== fullFunctionName) {
                    fullFunctionName = fullFunctionName.replace(/\\\\/g, '\\');
                    fullFunctionName += '()';
                    functionFirstArgsName = setFirstArguments(eachFunction, functionFirstArgsName);
                }

                if ('' === fullFunctionName) {
                    continue;
                } else if (
                    typeof(fullFunctionName) === 'string' && 
                    '' !== fullFunctionName &&
                    !_.some(this.#processedData, {'name': fullFunctionName})
                ) {
                    // if full function name is string and not empty and this name is not stored (no duplicated).
                    let result = {};
                    if (functionFirstArgsName.length > 0) {
                        result = {
                            'name': fullFunctionName,
                            'firstArguments': functionFirstArgsName,// this means one function calls can have many different first arguments. this is useful for check with WordPress hooks.
                            'file': this.#currentCallerFile,
                            'line': codeStartLine,
                        };
                    } else {
                        result = {
                            'name': fullFunctionName,
                            'file': this.#currentCallerFile,
                            'line': codeStartLine,
                        };
                    }
                    this.#processedData.push(result);
                } else {
                    // if function is already add to `#processedData` property.
                    const processDataIndex = _.findIndex(this.#processedData, {'name': fullFunctionName});
                    if (typeof(this.#processedData[processDataIndex].firstArguments) === 'undefined') {
                        this.#processedData[processDataIndex].firstArguments = [];
                    }

                    for (const eachFuncArgName of functionFirstArgsName) {
                        if (!this.#processedData[processDataIndex].firstArguments.includes(eachFuncArgName)) {
                            this.#processedData[processDataIndex].firstArguments.push(eachFuncArgName);
                        }
                    }// endfor;
                }// endif; full function name is not empty
            }// endfor functions
        }// endif; there is namespaces or not


        /**
         * Set first arguments to `functionFirstArgsName` and return result.
         * 
         * @param {object} eachFunction 
         * @param {Array} functionFirstArgsName 
         * @returns {Array} Return value that already set arguments.
         */
        function setFirstArguments(eachFunction, functionFirstArgsName) {
            if (Array.isArray(eachFunction?.arguments)) {
                const firstArgument = eachFunction.arguments[0];

                if (firstArgument?.kind === 'variable') {
                    functionFirstArgsName.push('$' + firstArgument.name);
                } else if (firstArgument?.kind === 'string') {
                    functionFirstArgsName.push(JSONPathPHPWorker.staticCleanValue(firstArgument.raw));
                } else if (firstArgument?.kind === 'bin') {
                    functionFirstArgsName.push(...thisClass.#concatBin(eachFunction, firstArgument, {namespaceString: ''}));
                } else {
                    // if another kind of argument value.
                    let argValue = '';
                    if (typeof(firstArgument?.name) === 'string') {
                        argValue = firstArgument.name;
                    } else if (typeof(firstArgument?.raw) !== 'undefined') {
                        argValue = JSONPathPHPWorker.staticCleanValue(firstArgument.raw);
                    } else {
                        argValue = 'unknown_value';
                    }
                    functionFirstArgsName.push('?' + firstArgument?.kind + '=' + argValue);
                }// endif; kind of argument value.
            }

            return functionFirstArgsName;
        }// setFirstArguments
    }// getFunctions


    /**
     * Get WordPress hooks (filters and actions).
     * 
     * @param {object} parsedCode 
     * @param {object} namespaces 
     */
    getWPHooks(parsedCode, namespaces) {
        const hookActionFunctions = [
            'add_action',
            'did_action',
            'doing_action',
            'has_action',
            'remove_action',
            'remove_all_actions',
        ];
        const hookFilterFunctions = [
            'add_filter',
            'did_filter',
            'doing_filter',
            'has_filter',
            'remove_filter',
            'remove_all_filters',
        ];
        const result = {
            'hook_actions': [],
            'hook_filters': [],
        };

        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const functions = JSONPathPHPCallerObj.queryPHPFunction(parsedCode);
        this.getFunctions(namespaces, functions);

        for (const eachItem of this.#processedData) {
            const functionName = eachItem.name.replace(/\(\)$/, '');
            if (
                hookActionFunctions.includes(functionName) &&
                typeof(eachItem.firstArguments) === 'object' &&
                Array.isArray(eachItem.firstArguments)
            ) {
                for (const eachFirstArg of eachItem.firstArguments) {
                    if (eachFirstArg.match(/^\?/)) {
                        // if first argument is start with '?' then it is unknown or another kind of argument value that is unresolved.
                        continue;
                    }

                    let hookName = eachFirstArg;
                    hookName = matchCoreHook(hookName, this.#coreDataObj.hook_actions);
                    if (!_.some(result.hook_actions, {'name': hookName})) {
                        result.hook_actions.push({
                            'name': hookName,
                        });
                    }
                }// endfor;
            } else if (
                hookFilterFunctions.includes(functionName) &&
                typeof(eachItem.firstArguments) === 'object' &&
                Array.isArray(eachItem.firstArguments)
            ) {
                for (const eachFirstArg of eachItem.firstArguments) {
                    if (eachFirstArg.match(/^\?/)) {
                        // if first argument is start with '?' then it is unknown or another kind of argument value that is unresolved.
                        continue;
                    }

                    let hookName = eachFirstArg;
                    hookName = matchCoreHook(hookName, this.#coreDataObj.hook_filters);
                    if (!_.some(result.hook_filters, {'name': hookName})) {
                        result.hook_filters.push({
                            'name': hookName,
                        });
                    }
                }// endfor;
            }
        }// endfor;

        this.#processedData = result;


        /**
         * Match hook with core hook where it might contain `{$variable}`.
         * 
         * Example: Hook found in user's PHP file is `hook_page` and found in WP core hook `hook_{$name}` will return WP core hook instead.
         * 
         * @param {string} hookName Processing hook name found in PHP file
         * @param {object} coreHooks WordPress core hook data (actions, filters).
         * @returns {string} Return matched hook, if no matched found then return original `hookName` argument.
         */
        function matchCoreHook(hookName, coreHooks) {
            for (const [coreHook, hookItem] of Object.entries(coreHooks)) {
                if (coreHook.includes('{$') === false) {
                    continue;
                }

                const coreHookReplacePH = '^' + RegExp.escape(coreHook.replace(/(\{\$.+?\})/g, '%%%replace%%%')) + '$';
                const coreHookToRegexpPattern = coreHookReplacePH.replace(RegExp.escape('%%%replace%%%'), '(.+?)');
                const coreHookRegexp = new RegExp(coreHookToRegexpPattern, 'g');
                if (coreHookRegexp.test(hookName)) {
                    return coreHook;
                }
            }// endfor;

            return hookName;
        }// matchCoreHook
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
     * Set WordPress core data PHP file to use its content.
     * 
     * @param {string} filePath Full path to core data file that have got from `collect` sub command.  
     *              Usually its name is ".requires-at-least_core-data-php_wordpress*.json".
     */
    setCoreDataFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error('The core data file is not exists. (' + filePath + ')');
        }

        try {
            const fileContent = fs.readFileSync(filePath);
            this.#coreDataObj = JSON.parse(fileContent);
        } catch (error) {
            console.error('  ' + TextStyles.txtError(error));
            process.exit(1);
        }
    }// setCoreDataFile


    /**
     * Set current caller file path.
     * 
     * @param {string} filePath Caller file full path.
     */
    setCurrentCallerFile(filePath) {
        if (typeof(filePath) === 'string') {
            this.#currentCallerFile = filePath;
        }
    }// setCurrentCallerFile


    /**
     * Set PHP core codes file.
     * 
     * @param {string} filePath Full path to PHP core codes file (such as constants, functions).
     *              Usually its name is ".php-core-codes.json".
     */
    setPHPCoreCodesFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error('The PHP core codes file is not exists. (' + filePath + ')');
        }

        try {
            const fileContent = fs.readFileSync(filePath);
            this.#phpCoreCodesObj = JSON.parse(fileContent);
        } catch (error) {
            console.error('  ' + TextStyles.txtError(error));
            process.exit(1);
        }
    }// setPHPCoreCodesFile


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


}// JSONPathPHPCallerWorker
