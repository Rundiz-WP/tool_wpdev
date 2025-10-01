<?php
/**
 * This file have no namespace at all.
 */


use function MyProject\ProjectWP\findHooks;

// call functions test. =================================================
connect();
findHooks();// expect `MyProject\ProjectWP\findHooks()`

$function = 'outer_function';
$function = 'outerFunction';// always use this
$function();

$function2 = 'innerFunction';
call_user_func($function2);

$hello = 'hello';
$$hello = 'world';
$hello();// expect call function `world()`.

$hellohi = 'ohhi';
${'hellohi'} = 'hithere';
$hellohi();// expect call function `hithere()`.

global $greet;
$greet('Rose');// expect anonymous function `$greet()`.

$ClassName = new ClassName();
echo call_user_func_array('manualWriteFunctionNameInCallUserFuncArray', []);
call_user_func_array('ClassName::method', []);// must not appears in function calls
call_user_func_array([$ClassName, 'method'], []);// must not appears in function calls

$intNum = (int) stringNum();

foreach ($array as $value) {
    current_time($value);
}

function myCustomFunction() {
    \doSomething();
    SomeNamespace\doAnotherThing();
    $result = measureConnection();
    return is_array($result);
}
// call functions test. =================================================
