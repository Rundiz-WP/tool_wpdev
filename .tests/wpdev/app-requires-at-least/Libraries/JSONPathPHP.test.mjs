
// import command's worker
import JSONPathPHPWorker from "../../../../app-requires-at-least/Commands/Requires-at-least/Tasks/Collect/JSONPathPHPWorker.mjs";
// import libraries
import JSONPathPHP from "../../../../app-requires-at-least/Libraries/JSONPathPHP.mjs";
import PHPParser from "../../../../app-requires-at-least/Libraries/PHPParser.mjs";
// import test dependencies


describe('JSONPathPHP.mjs namespaces', () => {
    test('Test 0 namespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespace-0.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);

        JSONPathPHPWorkerObj.getNamespaces(namespaces);
        expect(JSONPathPHPWorkerObj.namespaces.length).toBe(0);
    });// end test();


    test('Test 1 namespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespace-1.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);

        JSONPathPHPWorkerObj.getNamespaces(namespaces);
        expect(JSONPathPHPWorkerObj.namespaces.length).toBe(1);
    });// end test();


    test('Test 1 namespace & unnamespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespace-1-unnamespace.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);

        JSONPathPHPWorkerObj.getNamespaces(namespaces);
        expect(JSONPathPHPWorkerObj.namespaces.length).toBe(1);
        // This PHP file, in fact, contain 2 namespace word and can be loops without recursive call. 
        // Maybe, this is special result of namespace + unnamespace that processed by php parser.
    });// end test();


    test('Test 2 namespaces, simple', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespaces-2.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);

        JSONPathPHPWorkerObj.getNamespaces(namespaces);
        expect(JSONPathPHPWorkerObj.namespaces.length).toBe(2);
    });// end test();


    test('Test 2 namespaces, bracket', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespaces-2-bracket.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);

        JSONPathPHPWorkerObj.getNamespaces(namespaces);
        expect(JSONPathPHPWorkerObj.namespaces.length).toBe(2);
    });// end test();
});// end describe();


describe('JSONPathPHP.mjs constants', () => {
    test('Test 0 namespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespace-0.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const constants = JSONPathPHPObj.queryPHPConstant(parsedCode);

        const expectedResults = [{
            'name': 'CONNECT_OK',
        }, {
            'name': 'WPINC',
        }, {
            'name': 'WP_PLUGIN_DIR',
        }];

        JSONPathPHPWorkerObj.getConstants(namespaces, constants);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
            try {
                const foundIndex = expectedResults.findIndex(aName => aName.name === eachName.name);
                expect(foundIndex !== -1).toBeTruthy();
                expectedResults.splice(foundIndex, 1);
            } catch (error) {
                throw new Error('The name `' + eachName.name + '` has failed test.');
            }
        }// endfor;
        expect(expectedResults.length).toBe(0);
    });// end test();


    test('Test 1 namespace & unnamespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespace-1-unnamespace.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const constants = JSONPathPHPObj.queryPHPConstant(parsedCode);

        const expectedResults = [{
            'name': 'MyProject\\CONNECT_OK',
        }, {
            'name': 'WPINC',
        }, {
            'name': 'DOING_AJAX',
        }];

        JSONPathPHPWorkerObj.getConstants(namespaces, constants);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
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
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespaces-2-bracket.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const constants = JSONPathPHPObj.queryPHPConstant(parsedCode);

        const expectedResults = [{
            'name': 'MyProject\\CONNECT_OK',
        }, {
            'name': 'WPINC',
        }, {
            'name': 'AnotherProject\\CONNECT_OK',
        }, {
            'name': 'DOING_AJAX',
        }, {
            'name': 'CONSTANT_UNDER_ANOTHERPROJECT_NAMESPACE',
        }];

        JSONPathPHPWorkerObj.getConstants(namespaces, constants);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
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


describe('JSONPathPHP.mjs functions', () => {
    test('Test 0 namespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespace-0.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const functions = JSONPathPHPObj.queryPHPFunction(parsedCode);
        const anonymousArrowFunctions = JSONPathPHPObj.queryPHPAnonymousAndArrowFunction(parsedCode);

        const expectedResults = [{
            'name': 'connect()',
        }, {
            'name': 'outerFunction()',
        }, {
            'name': 'innerFunction()',
        }, {
            'name': 'returns_reference()',
        }, {
            'name': '$greet()',
        }, {
            'name': 'hellogreet()',
        }, {
            'name': '$staticAnonymousFuncion()',
        }, {
            'name': '$sendMessage()',
        }, {
            'name': '$calXY()',
        }, {
            'name': '$calXYStatic()',
        }];

        JSONPathPHPWorkerObj.getFunctions(namespaces, functions);
        JSONPathPHPWorkerObj.getAnonymousArrowFunctions(namespaces, anonymousArrowFunctions);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
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
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespace-1-unnamespace.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const functions = JSONPathPHPObj.queryPHPFunction(parsedCode);
        const anonymousArrowFunctions = JSONPathPHPObj.queryPHPAnonymousAndArrowFunction(parsedCode);

        const expectedResults = [{
            'name': 'MyProject\\connect()',
        }, {
            'name': 'MyProject\\outerFunction()',
        }, {
            'name': 'MyProject\\innerFunction()',
        }, {
            'name': 'MyProject\\returns_reference()',
        }, {
            'name': 'MyProject\\hellogreet()',
        }, {
            'name': 'connectUnNamespace()',
        }, {
            'name': '$greet()',
        }, {
            'name': 'hellogreet()',
        }, {
            'name': '$staticAnonymousFuncion()',
        }, {
            'name': '$sendMessage()',
        }, {
            'name': '$calXY()',
        }, {
            'name': '$calXYStatic()',
        }];

        JSONPathPHPWorkerObj.getFunctions(namespaces, functions);
        JSONPathPHPWorkerObj.getAnonymousArrowFunctions(namespaces, anonymousArrowFunctions);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
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
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespaces-2-bracket.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const functions = JSONPathPHPObj.queryPHPFunction(parsedCode);
        const anonymousArrowFunctions = JSONPathPHPObj.queryPHPAnonymousAndArrowFunction(parsedCode);

        const expectedResults = [{
            'name': 'MyProject\\connect()',
        }, {
            'name': 'MyProject\\outerFunction()',
        }, {
            'name': 'MyProject\\innerFunction()',
        }, {
            'name': 'MyProject\\returns_reference()',
        }, {
            'name': 'AnotherProject\\connect()',
        }, {
            'name': 'AnotherProject\\outerFunction()',
        }, {
            'name': 'AnotherProject\\innerFunction()',
        }, {
            'name': 'AnotherProject\\returns_reference()',
        }, {
            'name': 'AnotherProject\\measureConnection()',
        }, {
            'name': 'AnotherProject\\hellogreet()',
        }, {
            'name': '$greet()',
        }, {
            'name': '$staticAnonymousFuncion()',
        }, {
            'name': '$sendMessage()',
        }, {
            'name': '$calXY()',
        }, {
            'name': '$calXYStatic()',
        }, {
            'name': '$findNetwork()',
        }];

        JSONPathPHPWorkerObj.getFunctions(namespaces, functions);
        JSONPathPHPWorkerObj.getAnonymousArrowFunctions(namespaces, anonymousArrowFunctions);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
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


describe('JSONPathPHP.mjs classes', () => {
    test('Test 0 namespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespace-0.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const classes = JSONPathPHPObj.queryPHPClass(parsedCode);

        const expectedResults = [
            'Connection',
            'FinalClass',
            '$StandaloneAnonymousClass',
            'subClassOf:Connection->isConnect():$checker',
        ];

        JSONPathPHPWorkerObj.getClasses(namespaces, classes);
        // query and get anonymous classes
        const anonymousClasses = JSONPathPHPObj.queryPHPAnonymousClass(parsedCode);
        JSONPathPHPWorkerObj.getClasses(namespaces, anonymousClasses);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
            try {
                const eachNameString = Object.keys(eachName)[0];
                const foundIndex = expectedResults.findIndex(aName => aName === eachNameString);
                expect(foundIndex !== -1).toBeTruthy();
                expect(Object.keys(eachName[eachNameString]).length).toBeGreaterThanOrEqual(1);// have member objects such as `versions`.
                expectedResults.splice(foundIndex, 1);
            } catch (error) {
                throw new Error('The name `' + Object.keys(eachName)[0] + '` has failed test.');
            }
        }// endfor;
        expect(expectedResults).toEqual([]);
    });// end test();


    test('Test 1 namespace & unnamespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespace-1-unnamespace.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const classes = JSONPathPHPObj.queryPHPClass(parsedCode);

        const expectedResults = [
            'MyProject\\Connection',
            'subClassOf:MyProject\\Connection->isConnect():$checker',
            'MyProject\\FinalClass',
            '$StandaloneAnonymousClass',
            'UnNamespaceClass',
            'subClassOf:UnNamespaceClass->measure():$calc',
        ];

        JSONPathPHPWorkerObj.getClasses(namespaces, classes);
        // query and get anonymous classes
        const anonymousClasses = JSONPathPHPObj.queryPHPAnonymousClass(parsedCode);
        JSONPathPHPWorkerObj.getClasses(namespaces, anonymousClasses);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
            try {
                const eachNameString = Object.keys(eachName)[0];
                const foundIndex = expectedResults.findIndex(aName => aName === eachNameString);
                expect(foundIndex !== -1).toBeTruthy();
                expect(Object.keys(eachName[eachNameString]).length).toBeGreaterThanOrEqual(1);
                expectedResults.splice(foundIndex, 1);
            } catch (error) {
                throw new Error('The name `' + Object.keys(eachName)[0] + '` has failed test.');
            }
        }// endfor;
        expect(expectedResults).toEqual([]);
    });// end test();


    test('Test 2 namespaces, bracket', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/namespaces-2-bracket.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const classes = JSONPathPHPObj.queryPHPClass(parsedCode);

        const expectedResults = [
            'MyProject\\Connection',
            'subClassOf:MyProject\\Connection->isConnect():$checker',
            'MyProject\\FinalClass',
            'AnotherProject\\ConnectionFiber',
            'subClassOf:AnotherProject\\ConnectionFiber->isConnectFiber():$checker2',
            'AnotherProject\\FinalClass',
            '$StandaloneAnonymousClass',
        ];

        JSONPathPHPWorkerObj.getClasses(namespaces, classes);
        // query and get anonymous classes
        const anonymousClasses = JSONPathPHPObj.queryPHPAnonymousClass(parsedCode);
        JSONPathPHPWorkerObj.getClasses(namespaces, anonymousClasses);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
            try {
                const eachNameString = Object.keys(eachName)[0];
                const foundIndex = expectedResults.findIndex(aName => aName === eachNameString);
                expect(foundIndex !== -1).toBeTruthy();
                expect(Object.keys(eachName[eachNameString]).length).toBeGreaterThanOrEqual(1);
                expectedResults.splice(foundIndex, 1);
            } catch (error) {
                throw new Error('The name `' + Object.keys(eachName)[0] + '` has failed test.');
            }
        }// endfor;
        expect(expectedResults).toEqual([]);
    });// end test();
});// end describe();