/**
 * JSON path.
 * 
 * @link https://www.rfc-editor.org/rfc/rfc9535.html RFC about JSONPath.
 * @link https://goessner.net/articles/JsonPath/ Description.
 * @link https://www.npmjs.com/package/jsonpath Package reference.
 * @link https://www.npmjs.com/package/jsonpath-plus?activeTab=readme Package reference.
 */


'use strict';


import { JSONPath } from 'jsonpath-plus';


/**
 * JSON path class.
 */
export default class JSONPathPHPCaller {


    /**
     * Query PHP call class only, no class member such as methods.
     * 
     * Possibilities: 
     *      `new ClassName()`; will be `kind=="new"`, `what.kind=="name"`, `what.resolution=="?qn"`, `arguments` class name is in `what.name`  
     *      `ClassName::staticMethod()`; will be `what.kind=="staticlookup"`, `what.what.resolution="?qn"` class name is in `what.what.name`
     *      `ClassName::CONSTANT`; will be `kind=="staticlookup"`, `what.kind=="name"`, `what.resolution=="?qn"` class name is in `what.name`
     *      `$class::CONSTANT`; will be `kind=="staticlookup"`, `what.kind=="variable"` lookup variable name to class name from `what.name`
     *      `new $className()`; will be `kind=="new"`, `what.kind=="variable"`, `arguments` lookup variable name to class name from `what.name`
     *      `new ('Class' . 'B' . 'e')`; will be `kind=="new"`, `what.kind=="bin"`, `arguments` concat name in `what..raw`
     *      `(new DateTime())->format('Y')`; will be (`what.kind=="propertylookup"` or `what.kind=="nullsafepropertylookup"`),  
     *          `what.what.kind=="new"`, `what.what.what.kind=="name"`, `what.what.what.resolution=="?qn"`, `what.what.arguments` 
     *          class name is in `what.what.name`
     *      `call_user_func(['Class', 'staticMethod'])`; will be `kind=="call"`, `arguments`, `what.kind=="name"`, 
     *          `what.name=="call_user_func"` 
     *          class name is in first argument
     * 
     * @param {object} parsedCode 
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPClass(parsedCode) {
        return [
            ...JSONPath({path: '$.children..[?(@.kind=="new" && @.arguments && @.what.kind!="staticlookup")]', json: parsedCode, ignoreEvalErrors: true}),
            ...JSONPath({path: '$.children..[?(@.kind=="staticlookup")]', json: parsedCode, ignoreEvalErrors: true}),
            ...JSONPath({
                path: '$.children..[?('
                    + '@.kind=="call" && @.arguments && @.what.kind=="name" '
                    + '&& ('
                    + '  @.what.name=="call_user_func" '
                    + '  || @.what.name=="call_user_func_array"'
                    + ')'
                + ')]',
                json: parsedCode,
                ignoreEvalErrors: true
            }),
        ];
    }// queryPHPClass


    /**
     * QUery PHP call class's member such as constant, property, method.
     * 
     * Class's member possibilities:
     *      `$class->method()`; will be (`what.kind=="propertylookup"` or `what.kind=="nullsafepropertylookup"`),  
     *          `what.what.kind=="variable"`, `what.offset.kind=="identifier"`, `arguments`  
     *          lookup variable name to class name from `what.what.name`  
     *          method name is in `what.offset.name`
     *      `(new DateTime())->format('Y')`; will be (`what.kind=="propertylookup"` or `what.kind=="nullsafepropertylookup"`),  
     *          `what.what.kind=="new"`, `what.offset.kind=="identifier"`, `arguments`  
     *          method name is in `what.offset.name`
     *      `$class->property`; will be (`kind=="propertylookup"` or `kind=="nullsafepropertylookup"`),  
     *          `what.kind=="variable"`, `what.offset.kind=="identifier"`, no `arguments`  
     *          lookup variable name to class name from `what.name`  
     *          property name is in `offset.name`
     *      `ClassName::staticMethod()`; will be `what.kind=="staticlookup"`, `what.what.kind=="name"`, `what.offset.kind=="identifier"`, `arguments`  
     *          method name is in `what.offset.name`
     *      `ClassName::CONSTANT`; will be `kind=="staticlookup"`, `what.kind=="name"`, `offset.kind=="identifier"`, no arguments
     *          constant name is in `offset.name`
     *      `$class::CONSTANT`; will be `kind=="staticlookup"`, `what.kind=="variable"`, `offset.kind=="identifier"`, no arguments
     *          constant name is in `offset.name`
     *      `ClassName::$staticProperty`; will be `kind=="staticlookup"`, `what.kind=="name"`, `offset.kind=="variable"`, no arguments
     *          property name is in `offset.name`
     *      `call_user_func(['Class', 'staticMethod'])`; will be inside argument `kind=="array"`, `items[1].kind=="entry"`
     *          method name is in `items[1].value.raw`
     * 
     * These are already queried with `queryPHPClass`:
     *      `$class::CONSTANT`,
     *      `call_user_func('Class::staticMethod')` including concatenate strings, variables,
     *      `call_user_func(['Class', 'staticMethod'])`
     *      `call_user_func(['Class', $staticMethod])`
     *      `call_user_func([new ClassName, 'method])`
     *      `call_user_func([$class, 'method])`
     *      `call_user_func([ClassName::class, $staticMethod])`
     * 
     * @param {object} parsedCode 
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPClassMember(parsedCode) {
        return [
            ...JSONPath({
                path: '$.children..[?('
                    + '(@.kind=="propertylookup" || @.kind=="nullsafepropertylookup")'
                + ')]',
                json: parsedCode,
                ignoreEvalErrors: true,
                resultType: 'parent',
            }),// `$class->method()`, `$class->property`
            ...JSONPath({
                path: '$.children..[?('
                    + '@.kind=="staticlookup"'
                + ')]',
                json: parsedCode,
                ignoreEvalErrors: true,
                resultType: 'parent',
            }),// `Class::method()`, `Class::CONSTANT`, `Class::$property`
        ];
    }// queryPHPClassMember


    /**
     * Query PHP calls constant only.
     * 
     * Possibilities: These are how PHP becomes in AST by current Node package.
     *      `echo MY_CONSTANT`; will be `kind=="name"`, `resolution="?qn"` constant name is in `name`  
     *      just call `MY_CONSTANT`; will be `kind=="name"`, `resolution="?qn"` constant name is in `name`  
     *      `myFunc(MY_CONSTANT)`; will be `kind=="name"`, `resolution="?qn"` constant name is in `name`  
     *      `constant('MY_CONSTANT')`; will be `kind=="call"`, `what.name=="constant"` constant name is in `arguments[0].raw`  
     *      `constant($constantViaVar)`; will be `kind=="call"`, `what.name=="constant"` constant name is in `arguments[0].name` but need to lookup for that variable value    
     *      `echo \MyNamespace\MY_CONSTANT`; will be `kind=="name"`, `resolution="fqn"` constant name is in `name`    
     * 
     * @param {object} parsedCode 
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPConstant(parsedCode) {
        const results = [];

        const queriedResults = JSONPath({
            path: '$.children..[?(@.kind=="name" && @.resolution!="")]', 
            json: parsedCode, 
            ignoreEvalErrors: true, 
            resultType: 'parent'
        });

        for (const eachQueriedResult of queriedResults) {
            if (typeof(eachQueriedResult.arguments) === 'object') {
                // if there is arguments.
                // but constant don't have it.
                continue;
            }
            if (Array.isArray(eachQueriedResult)) {
                results.push(...eachQueriedResult);
            } else {
                results.push(eachQueriedResult);
            }
        }// endfor; queried results

        results.push(
            ...JSONPath({path: '$.children..[?(@.kind=="call" && @.what.name=="constant")]', json: parsedCode, ignoreEvalErrors: true}),
        );

        return results;
    }// queryPHPConstant


    /**
     * Query PHP calls function only.
     * 
     * Possibilities:
     *      `myFunction()`; will be `kind=="call"`, `what.kind=="name"`, `what.resolution=="?qn"` and contains `arguments`.  
     *      `$function()`; will be `kind=="call"`, `what.kind=="variable"` and contains `arguments`. 
     *          Need to lookup variable on for function name, if not found then it is anonymous function use that variable.  
     *      `call_user_func($name)`; will be `kind=="call"`, `what.kind=="name"`, `what.name=="call_user_func"` and contain `arguments`. 
     *          Need to lookup variable for function name if `arguments[0].kind=="variable"`.
     *      `call_user_func_array('myFunction')`; will be `kind=="call"`, `what.kind=="name"`, `what.name=="call_user_func_array"`and contains `arguments`.
     *          Need to lookup variable for function name if `arguments[0].kind=="variable"`.
     * 
     * @param {object} parsedCode 
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPFunction(parsedCode) {
        return JSONPath({
            path: '$.children..[?('
                + '@.kind=="call" '
                + '&& ('
                + '  @.what.kind=="name"'
                + '  || @.what.kind=="variable"'
                + ') '
                + '&& @.what.resolution!=""'
            + ')]',
            json: parsedCode,
            ignoreEvalErrors: true
        });
    }// queryPHPFunction


    /**
     * Query PHP `use ... as` to get its full namespace.
     * 
     * @link https://www.php.net/manual/en/language.namespaces.importing.php Reference
     * @param {object} parsedCode 
     * @param {number|string} endLine 
     * @param {string} importType The alias/import type. Accepted: 'constants', 'functions', 'classes'. Default is 'constants'.
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPUseAs(parsedCode, endLine, importType = 'constants') {
        if (typeof(endLine) !== 'number' && typeof(endLine) !== 'string') {
            throw new Error('The argument `endLine` must be number.');
        }
        if (typeof(importType) !== 'string') {
            throw new Error('The argument `importType` must be string.');
        }
        if (!['constants', 'functions', 'classes'].includes(importType)) {
            importType = 'constants';
        }

        const queryPathExpression = '$..[?(@.kind=="usegroup" && @.loc.end.line<="' + endLine + '" %condition%)]';
        // query `use Namespace1\SubName` and `use Namespace1\SubName as NameSub`. this type will be `null`.
        // this query is for namespace and class.
        let queriedNS = JSONPath({path: queryPathExpression.replace(/%condition%/, ' && @.type==null'), json: parsedCode, ignoreEvalErrors: true});

        let queriedPerType = [];
        if ('constants' === importType) {
            // query `use const ...` which may use alias or not.
            queriedPerType = JSONPath({path: queryPathExpression.replace(/%condition%/, ' && @.type=="const"'), json: parsedCode, ignoreEvalErrors: true});
        }
        if ('functions' === importType) {
            // query `use function ...` which may use alias or not.
            queriedPerType = JSONPath({path: queryPathExpression.replace(/%condition%/, ' && @.type=="function"'), json:parsedCode, ignoreEvalErrors: true});
        }
        return [
            ...queriedNS,
            ...queriedPerType,
        ];
    }// queryPHPUseAs


    /**
     * Query PHP variable declaration to get its value.
     * 
     * @param {object} parsedCode 
     * @param {string} variableName The variable name to query its value
     * @param {number|string} endLine Search for variable where end line less than or equal to this number.
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPVariable(parsedCode, variableName, endLine) {
        if (typeof(variableName) !== 'string') {
            throw new Error('The argument `variableName` must be string.');
        }
        if (typeof(endLine) !== 'number' && typeof(endLine) !== 'string') {
            throw new Error('The argument `endLine` must be number.');
        }

        return JSONPath({
            path: '$.children..[?('
                + '@.expression.kind=="assign" '
                + '&& ('
                + '  @.expression.left.name=="' + variableName + '" '
                + '  || @.expression.left.name.name=="' + variableName + '" '
                + '  || @.expression.left.name.raw=="\'' + variableName + '\'" '
                + ')'
                + '&& @.expression.right.loc.end.line<="' + endLine + '"'
            + ')]', 
            json: parsedCode,
            ignoreEvalErrors: true
        });
    }// queryPHPVariable


}// JSONPathPHPCaller
