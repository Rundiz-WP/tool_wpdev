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
export default class JSONPathPHP {


    /**
     * Query PHP anonymous function, arrow function. The PHP function to query here is not from caller (`echo $myFunction();`).
     * 
     * Need to call method `queryPHPFunction()` to query user-defined function (`function myFunction() {}`).
     * 
     * @param {object} parsedCode 
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPAnonymousAndArrowFunction(parsedCode) {
        return JSONPath({path: '$.children[?(@.kind=="expressionstatement" && (@.expression.right.kind=="closure" || @.expression.right.kind=="arrowfunc"))]', json: parsedCode, ignoreEvalErrors: true});
    }// queryPHPAnonymousAndArrowFunction


    /**
     * Query PHP anonymous class. The PHP class to query here is not from caller (`new $myClass();`).
     * 
     * Need to call method `queryPHPClass()` to query explicit class (`class myClass {}`).
     * 
     * @param {object} parsedCode 
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPAnonymousClass(parsedCode) {
        return JSONPath({path: '$.children[?(@.kind=="expressionstatement" && @.expression.right.what.kind=="class")]', json: parsedCode, ignoreEvalErrors: true});
    }// queryPHPAnonymousClass


    /**
     * Query PHP class only. The PHP class to query here is not from caller (`new myClass();`).
     * 
     * This method supported only explicit class (`class myClass {}`). Not support anomymous class.  
     * Need to call method `queryPHPAnonymousClass()` to query anonymous class (`$myClass = new class {};`).
     * 
     * @param {object} parsedCode 
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPClass(parsedCode) {
        return JSONPath({path: '$.children[?(@.kind=="class" && @.isAbstract==false)]', json: parsedCode, ignoreEvalErrors: true});
    }// queryPHPClass


    /**
     * Query PHP class's member such as constant, property, method.
     * 
     * @param {object} parsedCode 
     * @returns {object} Return object with properties: `constants`, `properties`, `methods`. Each property type is array.
     */
    queryPHPClassMember(parsedCode) {
        return {
            'constants': JSONPath({path: '$.body[?(@.kind=="classconstant")]', json: parsedCode, ignoreEvalErrors: true}),
            'properties': JSONPath({path: '$.body[?(@.kind=="propertystatement")]', json: parsedCode, ignoreEvalErrors: true}),
            'methods': JSONPath({path: '$.body[?(@.kind=="method" && @.isAbstract==false)]', json: parsedCode, ignoreEvalErrors: true}),
        };
    }// queryPHPClassMember


    /**
     * Query PHP code comment block.
     * 
     * @param {object} parsedCode 
     * @param {number|string} endLine Search for comment where end line less than or equal to this number.
     * @param {number|string} endNotOverThanNLine End line not over than (ELNOT) N line means if end line is 10, ELNOT is 1 then end line is (<= 10 and >= 9).  
     *              Default is -1.  
     *              Value less than zero means ignore this.
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPCodeCommentBlock(parsedCode, endLine, endNotOverThanNLine = -1) {
        if (typeof(endLine) !== 'number' && typeof(endLine) !== 'string') {
            throw new Error('The argument `endLine` must be number.');
        }

        let queryString = '$.comments[?'
            + '('
            + '@.kind == "commentblock" '
            + ' && @.loc.end.line <= "' + endLine + '"';
            if (endNotOverThanNLine >= 0) {
                queryString += ' && @.loc.end.line >= "' + (parseFloat(endLine) - parseFloat(endNotOverThanNLine)) + '"';
            }
        queryString += ')';
        queryString += ']';
        return JSONPath({path: queryString, json: parsedCode, ignoreEvalErrors: true});
    }// queryPHPCodeCommentBlock


    /**
     * Query PHP constant only. The PHP constant to query here is not from caller (`echo MY_CONSTANT;`).
     * 
     * @param {object} parsedCode 
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPConstant(parsedCode) {
        return JSONPath({path: '$.children[?(@.kind=="constantstatement" || @.kind=="expressionstatement")]', json: parsedCode, ignoreEvalErrors: true});
    }// queryPHPConstant


    /**
     * Query PHP function only. The PHP function to query here is not from caller (`echo myFunction();`).
     * 
     * This method supported only user-defined function (`function myFunction() {}`). Not support anomymous, or arrow function.  
     * Need to call method `queryPHPAnonymousAndArrowFunction()` to query anonymous, arrow function (`$myFunction = function() {};`, `$myFunction2 = fn($x) => $x + $y;`).
     * 
     * @param {object} parsedCode 
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPFunction(parsedCode) {
        return [
            ...JSONPath({path: '$.children[?(@.kind=="function")]', json: parsedCode, ignoreEvalErrors: true}),
            ...JSONPath({path: '$.children..children[?(@.kind=="function")]', json: parsedCode, ignoreEvalErrors: true}),// for function inside function.
        ];
    }// queryPHPFunction


    /**
     * Query PHP namespace only.  
     * The queried result need to check there is another namespace recursively.  
     * Can't recursive query with `$.children..`, read description inside the code.
     * 
     * @param {object} parsedCode 
     * @returns {Array} Return JSON queried path that contain AST object.
     */
    queryPHPNamespace(parsedCode) {
        // Can't use `$.children..` because if 2 or more PHP namespaces, when queried the 2nd namespace will be child of first, 3rd will be child of 2nd.
        // With `children..` it will retrieve duplicates code (functions, etc) on namespace 2 or more to mixed with the first namespace.
        return JSONPath({path: '$.children[?(@.kind=="namespace")]', json: parsedCode, ignoreEvalErrors: true});
    }// queryPHPNamespace


    /**
     * Query WordPress PHP hook action only.
     * 
     * This query can't get code comment above `do_action` line.
     * 
     * @param {object} parsedCode 
     * @returns  {Array} Return JSON queried path that contain AST object.
     */
    queryWPPHPHookActions(parsedCode) {
        return JSONPath({path: '$.children..[?('
            + '  @.kind=="name" '
            + '  && ('
            + '    @.name=="do_action"'
            + '    || @.name=="do_action_ref_array"'
            + '    || @.name=="do_action_deprecated"'
            + '  )'
            + ')]',
            json: parsedCode, 
            ignoreEvalErrors: true,
            resultType: 'parent',
        });
    }// queryWPPHPHookActions


    /**
     * Query WordPress PHP hook filter only.
     * 
     * This query can't get code comment above `apply_filters` line.
     * 
     * @param {object} parsedCode 
     * @returns  {Array} Return JSON queried path that contain AST object.
     */
    queryWPPHPHookFilters(parsedCode) {
        return JSONPath({path: '$.children..[?('
            + '  @.kind=="name" '
            + '  && ('
            + '    @.name=="apply_filters"'
            + '    || @.name=="apply_filters_ref_array"'
            + '    || @.name=="apply_filters_deprecated"'
            + '  )'
            + ')]',
            json: parsedCode, 
            ignoreEvalErrors: true,
            resultType: 'parent',
        });
    }// queryWPPHPHookFilters


}// JSONPathPHP
