
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
describe('JSONPathPHPCaller.mjs call constants', () => {
    test('Test 0 namespace', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespace-0_constants.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker({}, {'removeUnmatchWPCore': false});
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const constants = JSONPathPHPCallerObj.queryPHPConstant(parsedCode);

        const expectedResults = [{
            'name': 'CONNECT_OK',
        }, {
            'name': 'Some\\Where\\NORTH_BLUE',
        }, {
            'name': 'Some\\Where\\SOMEWHERE_CONST',
        }, {
            'name': 'MyProject\\TIMER_COUNT',
        }, {
            'name': 'WPINC',
        }, {
            'name': 'DOING_AJAX',
        }, {
            'name': 'CONNECT_OKCONSTANT_UNDER_NO_NAMESPACE',
        }, {
            'name': 'WP_CONTENT_DIR',
        }, {
            'name': 'WP_PLUGIN_DIR',
        }, {
            'name': 'MyProject\\CONNECT_OK',
        }];

        JSONPathPHPCallerWorkerObj.getConstants(namespaces, constants);

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
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespace-1-unnamespace_constants.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker({}, {'removeUnmatchWPCore': false});
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const constants = JSONPathPHPCallerObj.queryPHPConstant(parsedCode);

        const expectedResults = [{
            'name': 'MyProject\\CONNECT_OK',
        }, {
            'name': 'PROJECT_MGR',
        }, {
            'name': 'WPINC',
        }, {
            'name': 'DOING_AJAX',
        }, {
            'name': 'MyProject\\PROJECT_MGR',
        }, {
            'name': 'CONNECT_OKCONSTANT_UNDER_MYPROJECT_NAMESPACE',
        }, {
            'name': 'WP_CONTENT_DIR',
        }, {
            'name': 'WP_PLUGIN_DIR',
        }, {
            'name': 'AnotherProject\\Connector\\IS_CONNECTED',
        }, {
            'name': 'MyProject\\CONNECT_OK2',
        }, {
            'name': 'MyProject\\AnotherProject\\CONNECT_OK5',
        }, // below is on unnamespace
        {
            'name': 'PROJECT_BRANCH',
        }, {
            'name': 'MyProject\\PROJECT_TESTER',
        }, // some duplicated constants will not test here
        ];

        JSONPathPHPCallerWorkerObj.getConstants(namespaces, constants);

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
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespaces-2-bracket_constants.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerObj = new JSONPathPHPCaller();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker({}, {'removeUnmatchWPCore': false});
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);
        const constants = JSONPathPHPCallerObj.queryPHPConstant(parsedCode);

        const expectedResults = [{
            'name': 'MyProject\\CONNECT_OK',
        }, {
            'name': 'MyProject\\CONNECT_OK4',
        }, {
            'name': 'PROJECT_MGR',
        }, {
            'name': 'WPINC',
        }, {
            'name': 'DOING_AJAX',
        }, {
            'name': 'MyProject\\PROJECT_MGR',
        }, {
            'name': 'CONNECT_OKCONSTANT_UNDER_MYPROJECT_NAMESPACE',
        }, {
            'name': 'WP_CONTENT_DIR',
        }, {
            'name': 'WP_PLUGIN_DIR',
        }, {
            'name': 'MyProject\\CONNECT_OK2',
        }, // below is on \AnotherProject namespace
        {
            'name': 'AnotherProject\\CONNECT_OK2',
        }, {
            'name': 'AnotherProject\\TASK_DATE',
        }, {
            'name': 'MyProject\\SubProject\\TASK_DATE',
        }, {
            'name': 'WP_UPLOAD_DIR',
        }, {
            'name': 'AnotherProject\\PROJECT_MGR',
        }, {
            'name': 'CONNECT_OKCONSTANT_UNDER_ANOTHERPROJECT_NAMESPACE',
        }, {
            'name': 'MyProject\\PROJECT_TESTER',
        }, // some duplicated constants will not test here
        ];

        JSONPathPHPCallerWorkerObj.getConstants(namespaces, constants);

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
