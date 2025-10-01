
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


describe('JSONPathPHPCaller.mjs WP call hooks', () => {
    test('Test WordPress call hook actions', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespace-1-unnamespace_hooks.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker();
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);

        const expectedResults = [{
            'name': 'registered_post_type',
        }, {
            'name': 'do_robotstxt',
        }, {
            'name': 'do_feed_{$feed}',
        }, {
            'name': 'after_mu_upgrade',
        }, {
            'name': 'phpmailer_init',
        }, {
            'name': 'wp_blacklist_check',
        }, {
            'name': 'delete_blog',
        },
        // below is from namespace `MyProject`
        {
            'name': 'setup_theme',
        }, {
            'name': 'wpmu_delete_user',
        }, {
            'name': 'wp_default_styles',
        }];

        JSONPathPHPCallerWorkerObj.getWPHooks(parsedCode, namespaces);

        for (const eachName of JSONPathPHPCallerWorkerObj.processedData.hook_actions) {
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


    test('Test WordPress call hook filters', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/caller/namespace-1-unnamespace_hooks.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPCallerWorkerObj = new JSONPathPHPCallerWorker();
        JSONPathPHPCallerWorkerObj.setCurrentCallerFile(PHPFile);
        JSONPathPHPCallerWorkerObj.setPHPCoreCodesFile(CollectTestDependObj.phpCoreCodesFilePath);
        JSONPathPHPCallerWorkerObj.setCoreDataFile(CollectTestDependObj.coreCodeSavedFilePath);
        JSONPathPHPCallerWorkerObj.setParsedCode(parsedCode);
        const namespaces = JSONPathPHPObj.queryPHPNamespace(parsedCode);

        const expectedResults = [{
            'name': 'body_class',
        }, {
            'name': 'comment_post_redirect',
        }, {
            'name': 'admin_email_remind_interval',
        },
        // below is from namespace `MyProject` 
        {
            'name': 'attachment_fields_to_edit',
        }, {
            'name': 'myblogs_options',
        }, {
            'name': 'option_page_capability_{$option_page}',
        }, {
            'name': 'editable_slug',
        }, {
            'name': 'all_themes',
        }, {
            'name': 'emoji_url',
        }, {
            'name': 'comments_pre_query',
        }];

        JSONPathPHPCallerWorkerObj.getWPHooks(parsedCode, namespaces);

        for (const eachName of JSONPathPHPCallerWorkerObj.processedData.hook_filters) {
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