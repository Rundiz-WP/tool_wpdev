
// import command's worker
import JSONPathPHPCallerWorker from "../../../../../app-requires-at-least/Commands/Requires-at-least/Tasks/Check/JSONPathPHPCallerWorker.mjs";
// import libraries
import JSONPathPHP from "../../../../../app-requires-at-least/Libraries/JSONPathPHP.mjs";
import JSONPathPHPCaller from "../../../../../app-requires-at-least/Libraries/JSONPathPHPCaller.mjs";
import PHPParser from "../../../../../app-requires-at-least/Libraries/PHPParser.mjs";
// import test dependencies
import CollectTestDepend from "../../Commands/Requires-at-least/Tasks/Collect/collect-test-dependend.mjs";


const CollectTestDependObj = new CollectTestDepend();
CollectTestDependObj.init();


// `CollectTestDependObj.coreCodeSavedFilePath` will be full path to file ".requires-at-least_core-data-php_wordpress*.json".
describe('JSONPathPHPCaller.mjs call functions', () => {
    test('Test 0 namespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespace-0_functions.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker({}, {'removeUnmatchWPCore': false});
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const functions = JSONPathPHPCallerObj.queryPHPFunction(parsedCode);

        const expectedResults = [{
            'name': 'connect()',
        }, {
            'name': 'MyProject\\ProjectWP\\findHooks()',
        }, {
            'name': 'outerFunction()',
        }, {
            'name': 'innerFunction()',
        }, {
            'name': 'world()',
        }, {
            'name': 'hithere()',
        }, {
            'name': '$greet()',
        }, {
            'name': 'manualWriteFunctionNameInCallUserFuncArray()',
        }, {
            'name': 'stringNum()',
        }, {
            'name': 'current_time()',
        }, {
            'name': 'doSomething()',
        }, {
            'name': 'SomeNamespace\\doAnotherThing()',
        }, {
            'name': 'measureConnection()',
        }];

        JSONPathPHPCallerWorkerObj.getFunctions(namespaces, functions);

        for (const eachName of JSONPathPHPCallerWorkerObj.processedData) {
            try {
                const foundIndex = expectedResults.findIndex(aName => aName.name === eachName.name);
                expect(foundIndex !== -1).toBeTruthy();
                expectedResults.splice(foundIndex, 1);
            } catch (error) {
                throw new Error('The name `' + eachName.name + '` has failed test.');
            }
        }// endfor;
        expect(expectedResults).toEqual([]);
    });// end test();


    test('Test 1 namespace & unnamespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespace-1-unnamespace_functions.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker({}, {'removeUnmatchWPCore': false});
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const functions = JSONPathPHPCallerObj.queryPHPFunction(parsedCode);

        const expectedResults = [{
            'name': 'outerFunction()',
        }, {
            'name': 'innerFunction()',
        }, {
            'name': 'world()',
        }, {
            'name': 'hithere()',
        }, {
            'name': '$greet()',
        }, {
            'name': 'manualWriteFunctionNameInCallUserFuncArray()',
        }, {
            'name': 'MyProject\\stringNum()',
        }, {
            'name': 'MyProject\\current_time()',
        }, {
            'name': 'doSomething()',
        }, {
            'name': 'MyProject\\SomeNamespace\\doAnotherThing()',
        }, {
            'name': 'MyProject\\measureConnection()',
        }, {
            'name': 'MyProject\\myCustomFunction()',
        }, {
            'name': 'MyProject\\AnotherProject\\findFile()',
        }, {// below is for unnamespace
            'name': 'MyProject\\connect()',
        }, {
            'name': 'connect()',
        }, {
            'name': 'MyProject\\connect2()',
        }, {
            'name': 'MyProject\\connect3()',
        }];

        JSONPathPHPCallerWorkerObj.getFunctions(namespaces, functions);

        for (const eachName of JSONPathPHPCallerWorkerObj.processedData) {
            try {
                const foundIndex = expectedResults.findIndex(aName => aName.name === eachName.name);
                expect(foundIndex !== -1).toBeTruthy();
                expectedResults.splice(foundIndex, 1);
            } catch (error) {
                throw new Error('The name `' + eachName.name + '` has failed test.');
            }
        }// endfor;
        expect(expectedResults).toEqual([]);
    });// end test();


    test('Test 2 namespaces, bracket', () => {
        // Simple namespace and bracket namespace have the same test result (tested). So, use only one.
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespaces-2-bracket_functions.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker({}, {'removeUnmatchWPCore': false});
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const functions = JSONPathPHPCallerObj.queryPHPFunction(parsedCode);

        const expectedResults = [{
            'name': 'outerFunction()',
        }, {
            'name': 'innerFunction()',
        }, {
            'name': 'world()',
        }, {
            'name': 'hithere()',
        }, {
            'name': '$greet()',
        }, {
            'name': 'manualWriteFunctionNameInCallUserFuncArray()',
        }, {
            'name': 'MyProject\\stringNum()',
        }, {
            'name': 'MyProject\\current_time()',
        }, {
            'name': 'doSomething()',
        }, {
            'name': 'MyProject\\SomeNamespace\\doAnotherThing()',
        }, {
            'name': 'MyProject\\measureConnection()',
        }, {
            'name': 'MyProject\\myCustomFunction()',
        }, {
            'name': 'MyProject\\AnotherProject\\findFile()',
        }, {// below is for namespace 2
            'name': 'MyProject\\connect()',
        }, {
            'name': 'AnotherProject\\connect()',
        }, {
            'name': 'MyProject\\connect2()',
        }, {
            'name': 'AnotherProject\\connectToEurope()',
        }, {
            'name': 'MyProject\\connect3()',
        }];

        JSONPathPHPCallerWorkerObj.getFunctions(namespaces, functions);

        for (const eachName of JSONPathPHPCallerWorkerObj.processedData) {
            try {
                const foundIndex = expectedResults.findIndex(aName => aName.name === eachName.name);
                expect(foundIndex !== -1).toBeTruthy();
                expectedResults.splice(foundIndex, 1);
            } catch (error) {
                throw new Error('The name `' + eachName.name + '` has failed test.');
            }
        }// endfor;
        expect(expectedResults).toEqual([]);
    });// end test();
});// end describe();
