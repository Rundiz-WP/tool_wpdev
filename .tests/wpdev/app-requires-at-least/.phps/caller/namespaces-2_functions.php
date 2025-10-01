<?php
/**
 * Declaring multiple namespaces and unnamespaced code
 * 
 * @link https://www.php.net/manual/en/language.namespaces.definitionmultiple.php Namespace refrence
 */


namespace MyProject;
    // call functions test. =================================================
    connect();// uqn, expect `MyProject\connect()`
    \date('Y-m-d');// fqn

    $function = 'outer_function';
    $function = 'outerFunction';// always use this
    $function();

    $function2 = 'innerFunction';
    call_user_func($function2);// fqn

    $hello = 'hello';
    $$hello = 'world';
    $hello();// fqn, expect `world()`.

    $hellohi = 'ohhi';
    ${'hellohi'} = 'hithere';
    $hellohi();// fqn, expect `hithere()`.

    global $greet;
    $greet('Rose');// expect anonymous function `$greet()`.

    echo call_user_func_array('manualWriteFunctionNameInCallUserFuncArray', []);

    $intNum = (int) stringNum();// expect `MyProject\stringNum()`

    foreach ($array as $value) {
        current_time($value);// expect `MyProject\current_time()`
    }

    function myCustomFunction() {
        \doSomething();
        SomeNamespace\doAnotherThing();// qn, expect `MyProject\SomeNamespace\doAnotherThing()`
        $result = measureConnection();// expect `MyProject\measureConnection()`
        return is_array($result);// expect `is_array()`
    }

    function connect2() {}

    myCustomFunction();// uqn, expect `MyProject\myCustomFunction()`
    echo namespace\AnotherProject\findFile();// rn, expect `MyProject\AnotherProject\findFile()`
    // call functions test. =================================================



namespace AnotherProject;
    use MyProject as MPJ;
    use function MyProject\connect2;

    // call functions test. =================================================
    MPJ\connect();// qn, expect `MyProject\connect()`

    connect();// uqn, expect `AnotherProject\connect()`
    connect2();// uqn, expect `MyProject\connect2()` but can't check with `function_exists()`.
    connectToEurope();// uqn, expect `AnotherProject\connectToEurope()`

    $function = 'MyProject\\connect3';
    $function();

    call_user_func($function);// expect `MyProject\connect3()`.

    function connect() {}
    // call functions test. =================================================
