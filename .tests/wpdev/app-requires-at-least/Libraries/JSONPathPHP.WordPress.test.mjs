
// import command's worker
import JSONPathPHPWorker from "../../../../app-requires-at-least/Commands/Requires-at-least/Tasks/Collect/JSONPathPHPWorker.mjs";
// import libraries
import JSONPathPHP from "../../../../app-requires-at-least/Libraries/JSONPathPHP.mjs";
import PHPParser from "../../../../app-requires-at-least/Libraries/PHPParser.mjs";
// import test dependencies


describe('JSONPathPHP.mjs WP hooks', () => {
    test('Test WordPress hook actions', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/wordpress-hooks.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const hooks = JSONPathPHPObj.queryWPPHPHookActions(parsedCode);

        const expectedResults = [{
            'name': 'do_feed_{$feed}',
            'versions': ['2.1.0', '4.4.0'],
        }, {
            'name': 'do_robotstxt',
            'versions': ['2.1.0'],
        }, {
            'name': 'wpmu_delete_user',
            'versions': ['3.0.0', '5.5.0'],
        }, {
            'name': '$page_hook',
            'versions': ['1.5.0'],
        }, {
            'name': 'after_mu_upgrade',
        }, {
            'name': 'wp_ajax_nopriv_{$action}',
            'versions': ['2.8.0'],
        }, {
            'name': 'wp_default_styles',
            'versions': ['2.6.0'],
        }, {
            'name': 'phpmailer_init',
        }, {
            'name': '$hook',
            'versions': ['2.1.0'],
        }, {
            'name': 'wp_blacklist_check',
            'versions': ['1.5.0'],
        }, {
            'name': 'delete_blog',
            'versions': ['3.0.0'],
        }, {
            'name': 'setted_transient',
            'versions': ['3.0.0', '3.6.0'],
        }, {
            'name': 'cron_reschedule_event_error',
            'versions': ['6.1.0'],
        }, {
            'name': 'activate_wp_head',
            'versions': ['3.0.0'],
        }, {
            'name': 'customize_controls_init',
            'versions': ['3.4.0'],
        }];

        JSONPathPHPWorkerObj.getWPHooks(hooks, parsedCode);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
            let successNameTest = false;
            let foundIndex = -1;
            try {
                foundIndex = expectedResults.findIndex(aName => aName.name === eachName.name);
                successNameTest = foundIndex !== -1;
                expect(foundIndex !== -1).toBeTruthy();
            } catch (error) {
                throw new Error('The name `' + eachName.name + '` has failed test.');
            }

            if (true === successNameTest) {
                let processedVersions = [];
                let expectedVersions = [];
                try {
                    processedVersions = eachName.versionDescription?.versions;
                    expectedVersions = (typeof(expectedResults[foundIndex]?.versions) !== 'undefined' ? expectedResults[foundIndex].versions : []);
                    expect(processedVersions.sort()).toEqual(expectedVersions.sort());
                } catch (error) {
                    throw new Error('The name `' + eachName.name + '` has failed test version.'
                        + "\n" + '  Expected `' + JSON.stringify(expectedVersions, null, 2) + '`'
                        + "\n" + '  Actual `' + JSON.stringify(processedVersions, null, 2) + '`'
                    );
                }
            }

            if (true === successNameTest) {
                expectedResults.splice(foundIndex, 1);
            }
        }// endfor;

        if (expectedResults.length > 0) {
            for (const eachExpectedResult of expectedResults) {
                console.error('Expected name `' + eachExpectedResult.name + '` was not found in processed data.');
            }// endfir;
        }
        expect(expectedResults.length).toBe(0);
    });// end test();


    test('Test WordPress hook filters', () => {
        const PHPFile = '.tests/wpdev/app-requires-at-least/.phps/wordpress-hooks.php';
        const parsedCode = PHPParser.parseCode(PHPFile);

        const JSONPathPHPObj = new JSONPathPHP();
        const JSONPathPHPWorkerObj = new JSONPathPHPWorker();
        const hooks = JSONPathPHPObj.queryWPPHPHookFilters(parsedCode);

        const expectedResults = [{
            'name': 'comment_post_redirect',
            'versions': ['2.0.5'],
        }, {
            'name': 'myblogs_options',
            'versions': ['3.0.0'],
        }, {
            'name': 'admin_email_remind_interval',
            'versions': ['5.3.1'],
        }, {
            'name': 'editable_slug',
            'versions': ['2.6.0', '4.4.0'],
        }, {
            'name': 'all_themes',
            'versions': ['3.1.0'],
        }, {
            'name': 'emoji_url',
            'versions': ['4.2.0'],
        }, {
            'name': 'option_page_capability_{$option_page}',
            'versions': ['3.2.0'],
        }, {
            'name': '$filter_use_var',
            'versions': ['0.0.2'],
        }, {
            'name': 'comments_pre_query',
            'versions': ['5.3.0', '5.6.0'],
        }, {
            'name': 'login_headertitle',
            'versions': ['2.1.0'],
        }, {
            'name': 'http_api_transports',
            'versions': ['3.7.0'],
        }, {
            'name': 'login_site_html_link',
            'versions': ['5.7.0'],
        }, {
            'name': 'login_language_dropdown_args',
            'versions': ['5.9.0'],
        }, {
            'name': 'enable_login_autofocus',
            'versions': ['4.8.0'],
        }, {
            'name': 'auto_core_update_send_email',
            'versions': ['3.7.0'],
        }, {
            'name': 'comments_per_page',
            'versions': ['2.6.0'],
        }, {
            'name': 'bulk_actions-{$screenid}',
            'versions': ['3.1.0', '5.6.0'],
        }, {
            'name': 'update_bulk_plugins_complete_actions',
            'versions': ['3.0.0'],
        }, {
            'name': 'wp_get_default_privacy_policy_content',
            'versions': ['4.9.6', '5.0.0'],
        }];

        JSONPathPHPWorkerObj.getWPHooks(hooks, parsedCode);

        for (const eachName of JSONPathPHPWorkerObj.processedData) {
            let successNameTest = false;
            let foundIndex = -1;
            try {
                foundIndex = expectedResults.findIndex(aName => aName.name === eachName.name);
                successNameTest = foundIndex !== -1;
                expect(foundIndex !== -1).toBeTruthy();
            } catch (error) {
                throw new Error('The name `' + eachName.name + '` has failed test.');
            }

            if (true === successNameTest) {
                let processedVersions = [];
                let expectedVersions = [];
                try {
                    processedVersions = eachName.versionDescription?.versions;
                    expectedVersions = (typeof(expectedResults[foundIndex]?.versions) !== 'undefined' ? expectedResults[foundIndex].versions : []);
                    expect(processedVersions.sort()).toEqual(expectedVersions.sort());
                } catch (error) {
                    throw new Error('The name `' + eachName.name + '` has failed to test version.'
                        + "\n" + '  Expected `' + JSON.stringify(expectedVersions, null, 2) + '`'
                        + "\n" + '  Actual `' + JSON.stringify(processedVersions, null, 2) + '`'
                    );
                }
            }

            if (true === successNameTest) {
                expectedResults.splice(foundIndex, 1);
            }
        }// endfor;

        if (expectedResults.length > 0) {
            for (const eachExpectedResult of expectedResults) {
                console.error('Expected name `' + eachExpectedResult.name + '` was not found in processed data.');
            }// endfir;
        }
        expect(expectedResults.length).toBe(0);
    });// end test();
});// end describe();