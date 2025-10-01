<?php
/**
 * This file have no namespace at all.
 * 
 * @link https://www.php.net/manual/en/language.functions.php Function reference
 */

// define constants tests. ==============================================
/**
 * @since 0.0.1
 * @since 0.2.0
 */
const CONNECT_OK = 1;

/**
 * Stores the location of the WordPress directory of functions, classes, and core content.
 *
 * @since 1.0.0
 * @since 2.0.5 This version add specifically for this file (namespace-0.php).
 */
define( 'WPINC', 'wp-includes' );

/**
 * @since 2.6.0
 */
define( 'WP_PLUGIN_DIR', '/plugins' );
// define constants tests. ==============================================

// define classes tests. ================================================
/**
 * @since 0.0.2 class connection
 */
class Connection
{
    /**
     * @since 0.0.3
     */
    const CONSTANT_IN_CLASS = true;

    /**
     * @since 0.0.8
     * @since 5.3.2
     */
    final public const X = "foo";

    /**
     * @since 0.1.13
     */
    public $portNumber;

    /**
     * @since 0.1.18
     */
    final public $logicPort = 0;

    /**
     * @since 0.0.4
     */
    public function plug()
    {
        /**
         * @since 0.1.0 Anonymous class
         */
        return new class
        {
            /**
             * @since 0.1.0
             */
            public function tryToConnect()
            {
            }
        };
    }

    /**
     * @since 0.0.3
     */
    public function isConnect()
    {
        /**
         * @since 0.1.1 Anonymous class on variable.
         */
        $checker = new class
        {
            /**
             * @since 0.1.1
             */
            public function pingCheck()
            {
            }
        };
        return $checker;
    }

    /**
     * @since 0.0.12 Static method.
     * @since 0.0.14
     */
    public static function test()
    {
    }
}

/**
 * Abstract class cannot be instantiated. So, it must not appears when JS worker retrieve class name.
 * 
 * @since 0.0.1 abstract class.
 */
abstract class Shape 
{
}

/**
 * @since 0.2.0 final class
 */
final class FinalClass {
    /**
     * @since 0.2.2
     */
    final protected string $test;

    /**
     * @since 0.2.0
     */
    public function test2() 
    {
    }

    /**
    * @since 0.2.1 Final method
    */
    final public function moreTesting() 
    {
    }
}

/**
 * @since 0.3.0
 */
$StandaloneAnonymousClass = new class
{
    /**
     * @since 0.3.3
     */
    const ANON_CLASS_CONSTANT = 'standing';

    /**
     * @since 0.3.4
     */
    public $anonClassProperty = true;

    /**
     * @since 0.3.2
     */
    public function writeOut($message)
    {
    }
};
// define classes tests. ================================================

// define functions tests. ==============================================
/**
 * @since 0.0.2
 * @since 0.0.3
 */
function connect()
{
}

/**
 * @since 0.0.3
 */
function outerFunction()
{
    /**
     * Functions within functions
     * 
     * @since 0.0.4
     */
    function innerFunction()
    {
    }
}

/**
 * Return reference from a function
 *
 * @since 0.0.5
 */
function &returns_reference()
{
}

/**
 * Anonymous function
 * 
 * @since 0.0.6
 */
$greet = function($name) 
{
    /**
     * @since 0.0.11
     */
    function hellogreet() {
        return 'hello';
    }
    return $name;

    /**
     * This anonymous function can't access from outside.
     * 
     * @since 0.0.12
     */
    $howdoyoudo = function() {
        return 'How do you do?';
    };
};

/**
 * Static anonymous function
 * 
 * @since 0.0.9
 */
$staticAnonymousFuncion = static function()
{
};

/**
 * @since 0.0.10
 */
$sendMessage = function() use ($greet)
{
};

/**
 * Arrow function
 * 
 * @since 0.0.7
 */
$calXY = fn($x) => $x + $y;

/**
 * Static Arrow function
 * 
 * @since 0.0.8
 */
$calXYStatic = static fn($x) => $x + $y;
// define functions tests. ==============================================

bcadd('12', '4', 9);// the '12' must not appears in constant names.
