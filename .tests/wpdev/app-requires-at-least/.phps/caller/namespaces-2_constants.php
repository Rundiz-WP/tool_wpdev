<?php
/**
 * Declaring multiple namespaces, simple combination syntax
 * 
 * @link https://www.php.net/manual/en/language.namespaces.definitionmultiple.php Namespace refrence
 */

namespace MyProject;
    // call constants tests. ================================================
    const PROJECT_MGR = 'Sophana';// for test with unnamespace
    const TASK_DATE = '';

    echo CONNECT_OK;// uqn, 
    // expect `CONNECT_OK` if there is `define('CONNECT_OK', '')` as global namespace
    //     but define constant use `const CONNECT_OK` under `namespace {..}` will not work
    // expect `MyProject\CONNECT_OK` if there is this constant under `MyProject` namesapce
    // in this example, expect `MyProject\CONNECT_OK`
    echo CONNECT_OK4;// uqn, expect `MyProject\CONNECT_OK4`

    echo ' ' . \PROJECT_MGR;// fqn, 
    // expect `PROJECT_MGR` 
    // but there is no `define('PROJECT_MGR', '')` in this example. so, it will be errors

    if (file_exists(WPINC)) {}

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
        echo constant($wpdir);
    }

    echo \MyProject\CONNECT_OK2;// fqn
    // call constants tests. ================================================


namespace AnotherProject;
    use MyProject\TASK_DATE;
    use MyProject AS MPJ;
    use const MyProject\SubProject\TASK_DATE as MSPTD;

    // call constants tests. ================================================
    const PROJECT_MGR = 'Minnie';// for test with unnamespace
    const CONNECT_OK4 = 'ok';

    echo CONNECT_OK2;// uqn, expect `AnotherProject\CONNECT_OK2`
    echo TASK_DATE;// uqn, expect `AnotherProject\TASK_DATE`
    echo MSPTD;// expect `MyProject\SubProject\TASK_DATE`

    echo ' ' . \WP_UPLOAD_DIR;// fqn

    for ($i = 0; $i <= 5; ++$i) {
        if ($i === 3) {
            echo PROJECT_MGR;// uqn, expect `AnotherProject\PROJECT_MGR`
        }
    }

    echo constant('CONNECT_OKCONSTANT_UNDER_ANOTHERPROJECT_NAMESPACE');

    echo MPJ\PROJECT_MGR;// qn, expect `MyProject\PROJECT_MGR`.
    echo MPJ\PROJECT_TESTER;// qn, expect `MyProject\PROJECT_TESTER`.
    // call constants tests. ================================================
