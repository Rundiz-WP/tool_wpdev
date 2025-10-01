<?php
/**
 * Declaring multiple namespaces and unnamespaced code
 * 
 * @link https://www.php.net/manual/en/language.namespaces.definitionmultiple.php Namespace refrence
 */


namespace MyProject {
    use const AnotherProject\Connector\IS_CONNECTED;

    // call constants tests. ================================================
    const CONNECT_OK2 = 'ok';
    const CONNECT_OK3 = 'not ok';
    const CONNECT_OK5 = 'pending..';
    const PROJECT_MGR = 'Sophana';// for test with unnamespace & namespace `MyProject`

    echo CONNECT_OK;// uqn, 
    // expect `CONNECT_OK` if there is `define('CONNECT_OK', '')` as global namespace
    //     but define constant use `const CONNECT_OK` under `namespace {..}` will not work
    // expect `MyProject\CONNECT_OK` if there is this constant under `MyProject` namesapce
    // in this example, expect `MyProject\CONNECT_OK`

    echo ' ' . \PROJECT_MGR;// fqn, 
    // expect `PROJECT_MGR` 
    // but there is no `define('PROJECT_MGR', '')` in this example. so, it will be errors

    if (file_exists(WPINC)) {}// uqn

    for ($i = 0; $i <= 5; ++$i) {
        if ($i === 3) {
            echo DOING_AJAX;// uqn
            echo PROJECT_MGR;// uqn, expect `MyProject\PROJECT_MGR` because found under this namespace.
        }
    }

    echo constant('CONNECT_OKCONSTANT_UNDER_MYPROJECT_NAMESPACE');// fqn itself

    $constantName = 'WP_INC';
    $constantName = 'WP_CONTENT_DIR';// always use this. always fqn itself.
    doSomething(constant($constantName));

    function showMeDir()
    {
        $wpdir = 'WP_PLUGIN_DIR';
        echo constant($wpdir);// fqn
    }

    echo IS_CONNECTED;// uqn, expect `AnotherProject\Connector\IS_CONNECTED`
    echo \MyProject\CONNECT_OK2;// fqn
    echo PHP_EOL;// uqn, expect `PHP_EOL`
    echo \PHP_VERSION;
    echo namespace\AnotherProject\CONNECT_OK5;// rn, expect `MyProject\AnotherProject\CONNECT_OK5`
    // call constants tests. ================================================
}


namespace {// global code
    use MyProject\CONNECT_OK3;
    use MyProject AS MPJ;

    // call constants tests. ================================================
    const PROJECT_MGR = 'Miki';// for test with unnamespace & namespace `MyProject`
    const PROJECT_BRANCH = 'Bangna';

    echo PROJECT_BRANCH;// expect `PROJECT_BRANCH`

    echo MPJ\PROJECT_MGR;// qn, expect `MyProject\PROJECT_MGR`.
    echo MPJ\PROJECT_TESTER;// qn, expect `MyProject\PROJECT_TESTER`.
    // call constants tests. ================================================

    // prepare things just for prevent errors in the editor. ================
    if (!function_exists('doSomething')) {
        function doSomething() {}
    }
}