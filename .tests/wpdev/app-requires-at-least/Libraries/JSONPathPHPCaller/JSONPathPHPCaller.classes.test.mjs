
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
describe('JSONPathPHPCaller.mjs call classes', () => {
    test('Test 0 namespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespace-0_classes.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker({debug: true}, {'removeUnmatchWPCore': false});
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const classes = JSONPathPHPCallerObj.queryPHPClass(parsedCode);

        const expectedResults = [{
            'name': 'Connection',
            'members': [
                'const CONSTANT_IN_CLASS',
                'const X',
                '$portNumber',
                '$logicPort',
                '$staticProperty',
                'isConnect()',
                'plug()',
                'test()',
            ],
        }, {
            'name': 'Connection2',
        }, {
            'name': 'Building\\Structure\\Reporter',
        }, {
            'name': 'AnotherConnection',
            'members': ['staticIsConnect()'],
        }, {
            'name': 'FinalClass',
            'members': [
                'bar()',
                'methodNotExists()',
                'test2()',
            ]
        }, {
            'name': 'MyClass',
            'members': ['getClassName()'],
        }, {
            'name': 'MyClass::getClassName()',
            // the result will comes with properties `unresolveName` (boolean), `unresolveRemark` (string).
        }, {
            'name': 'ClassD',
            'members': ['staticMethod6()'],
        }, {
            'name': 'getSomeClass()',
            // it's function name, always end with `()`.
            // the result will comes with properties `unresolveName` (boolean), `unresolveRemark` (string).
        }, {
            'name': 'ClassBe',
        }, {
            'name': 'FinalClassSecond',
        }, {
            'name': 'MyProject\\Duplicator\\ClassDuplicate',
        }, {
            'name': 'MyProject\\Duplicator\\ClassDuplicates',
        }, {
            'name': 'MyProject\\InHistory\\Classes\\ClassD',
        }, {
            'name': 'MyProject\\InHistory\\Classes\\ClassDefinition',
        }, {
            'name': 'Workspace\\FirstFloor\\ClassD',
        }, {
            'name': 'Workspace\\FirstFloor\\ClassDoubleRoom',
        }, {
            'name': 'Connection2Monitor',
        }, {
            'name': 'ClassE',
            'members': ['staticMethod2()'],
        }, {
            'name': 'ClassNameConcat',
            'members': ['methodName()'],
        }, {
            'name': 'FinalClassNumber2',
            'members': ['staticMethod5()'],
        }, {
            'name': 'ClassC',
            'members': [
                'methodFromVariable()',
                'staticMethod1()',
                'staticMethod3()',
            ],
        }, {
            'name': 'NewRoad',
            'members': ['methodNotExists()'],
        }, {
            'name': 'ClassG',
            'members': ['staticMethod4()'],
        }];
    
        JSONPathPHPCallerWorkerObj.getClasses(namespaces, classes);

        for (const eachName of JSONPathPHPCallerWorkerObj.processedData) {
            let successNameTest = false;
            let foundIndex = -1;
            const eachNameString = Object.keys(eachName)[0];

            try {
                foundIndex = expectedResults.findIndex(aName => aName.name === eachNameString);
                successNameTest = foundIndex !== -1;
                expect(foundIndex !== -1).toBeTruthy();
                expect(Object.keys(eachName[eachNameString]).length).toBeGreaterThanOrEqual(1);// have member objects such as `versions`.
            } catch (error) {
                throw new Error('The name `' + eachNameString + '` has failed test.');
            }// endtry;

            if (
                true === successNameTest && 
                typeof(eachName[eachNameString].members) === 'object' &&
                Object.keys(eachName[eachNameString].members).length > 0
            ) {
                try {
                    const processedClassMembers = Object.keys(eachName[eachNameString].members);
                    const expectedRow = expectedResults[foundIndex];
                    expect(processedClassMembers.sort()).toEqual(expectedRow.members?.sort());
                    Reflect.deleteProperty(expectedResults[foundIndex], 'members');
                } catch (error) {
                    const newMessage = `Expect error for class \`${eachNameString}\`: ${error.message}`;
                    throw new Error(newMessage, { cause: error });
                }// endtry;
            }

            if (true === successNameTest) {
                if (typeof(expectedResults[foundIndex]?.members) === 'undefined') {
                    expectedResults.splice(foundIndex, 1);
                }
            }
        }// endfor;
        expect(expectedResults).toEqual([]);
    });// end test();


    test('Test 1 namespace & unnamespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespace-1-unnamespace_classes.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker({debug: true}, {'removeUnmatchWPCore': false});
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const classes = JSONPathPHPCallerObj.queryPHPClass(parsedCode);

        const expectedResults = [{
            'name': 'MyProject\\Connection',
        }, {
            'name': 'MyProject\\Connection2',
        }, {
            'name': 'MyProject\\Connection3',
        }, {
            'name': 'Connection',
        }, {
            'name': 'MyProject\\AnotherConnection',
        }, {
            'name': 'FinalClass',
        }, {
            'name': 'getSomeClass()',
            // it's function name, always end with `()`.
            // the result will comes with properties `unresolveName` (boolean), `unresolveRemark` (string).
        }, {
            'name': 'ClassBe',
        }, {
            'name': 'MyProject\\ClassD',
        }, {
            'name': 'MyProject\\DateTime',
        }, {
            'name': 'ClassE',
        }, {
            'name': 'MyProject\\ClassH',
        }, {
            'name': 'ClassC',
        }, {
            'name': 'ClassF',
        }, {
            'name': 'ClassG',
        }, {
            'name': 'ClassH',
        },
        // below is based on unnamespace but must not duplicated with above
        {
            'name': 'MyProject\\ClassC',
        }, {
            'name': 'MyProject\\SomeClass',
        }, {
            'name': 'MyProject\\Tasks\\OpenFile',
        }];

        JSONPathPHPCallerWorkerObj.getClasses(namespaces, classes);

        for (const eachName of JSONPathPHPCallerWorkerObj.processedData) {
            try {
                const eachNameString = Object.keys(eachName)[0];
                const foundIndex = expectedResults.findIndex(aName => aName.name === eachNameString);
                expect(foundIndex !== -1).toBeTruthy();
                expect(Object.keys(eachName[eachNameString]).length).toBeGreaterThanOrEqual(1);// have member objects such as `versions`.
                expectedResults.splice(foundIndex, 1);
            } catch (error) {
                throw new Error('The name `' + Object.keys(eachName)[0] + '` has failed test.');
            }
        }// endfor;
        expect(expectedResults).toEqual([]);
    });// end test();


    test('Test 2 namespaces, bracket', () => {
        // Simple namespace and bracket namespace have the same test result (tested). So, use only one.
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespaces-2-bracket_classes.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker({debug: true}, {'removeUnmatchWPCore': false});
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const classes = JSONPathPHPCallerObj.queryPHPClass(parsedCode);

        const expectedResults = [{
            'name': 'OtherProject\\Cabinets\\FinanceReport',
        },
        // below is based on namespace `AnotherProject` but must not duplicated with above
        {
            'name': 'AnotherProject\\PowerPlan',
        }, {
            'name': 'AnotherProject\\MyProject\\PowerPlan',
        }, {
            'name': 'MyProject\\PowerPlan',
        }, {
            'name': 'AnotherProject\\ClassA',
        }];

        JSONPathPHPCallerWorkerObj.getClasses(namespaces, classes);

        for (const eachName of JSONPathPHPCallerWorkerObj.processedData) {
            try {
                const eachNameString = Object.keys(eachName)[0];
                const foundIndex = expectedResults.findIndex(aName => aName.name === eachNameString);
                expect(foundIndex !== -1).toBeTruthy();
                expect(Object.keys(eachName[eachNameString]).length).toBeGreaterThanOrEqual(1);// have member objects such as `versions`.
                expectedResults.splice(foundIndex, 1);
            } catch (error) {
                throw new Error('The name `' + Object.keys(eachName)[0] + '` has failed test.');
            }
        }// endfor;
        expect(expectedResults).toEqual([]);
    });// end test();
});// end describe()
