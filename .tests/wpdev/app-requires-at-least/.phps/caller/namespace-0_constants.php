<?php
/**
 * This file have no namespace at all.
 */


use const Some\Where\NORTH_BLUE;
use const Some\Where\{SOMEWHERE_CONST};
use const MyProject\TIMER_COUNT as MTCOUNT;

// call constants tests. ================================================
echo CONNECT_OK;
echo NORTH_BLUE;// expect `Some\Where\NORTH_BLUE`
echo SOMEWHERE_CONST;// expect `Some\Where\SOMEWHERE_CONST`
echo MTCOUNT;// expect `MyProject\TIMER_COUNT`

if (file_exists(WPINC)) {}

for ($i = 0; $i <= 5; ++$i) {
    if ($i === 3) {
        echo DOING_AJAX;
    }
}

echo constant('CONNECT_OKCONSTANT_UNDER_NO_NAMESPACE');

$constantName = 'WP_INC';
$constantName = 'WP_CONTENT_DIR';// always use this
doSomething(constant($constantName));

function showMeDir()
{
    $wpdir = 'WP_PLUGIN_DIR';
    echo constant($wpdir);
}

echo \MyProject\CONNECT_OK;// fqn constant
// call constants tests. ================================================
