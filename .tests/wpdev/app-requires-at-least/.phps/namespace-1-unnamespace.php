<?php
/**
 * Declaring multiple namespaces and unnamespaced code
 * 
 * @link https://www.php.net/manual/en/language.namespaces.definitionmultiple.php Namespace refrence
 * @link https://www.php.net/manual/en/language.functions.php Function reference
 */

namespace MyProject {

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
     * @since 1.9.10 This version add specifically for this file (namespace-1-unnamespace.php).
     */
    define( 'WPINC', 'wp-includes' );
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
     * @since 0.0.1
     * @since 0.3.1
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

}


namespace {// global code

    // define constants tests. ==============================================
    /**
     * Executing Ajax process.
     *
     * @since 2.1.0
     * @since 2.1.1
     */
    define( 'DOING_AJAX', true );
    // define constants tests. ==============================================
    
    // define classes tests. ================================================
    /**
     * @since 0.0.1
     * @since 0.1.2
     */
    class UnNamespaceClass
    {
        /**
         * @since 0.1.2
         */
        const UN_NAMESPACE = true;

        /**
         * @since 0.0.5
         */
        public $unit = 'km';

        /**
         * @since 0.0.1
         * @since 0.2.1
         */
        public function measure($x, $y)
        {
            /**
             * Anonymous class on `$calc`.
             * 
             * @since 0.2.1
             */
            $calc = new class
            {
                /**
                 * @since 0.2.1
                 * @since 0.2.3
                 */
                public function add($x, $y)
                {
                }
            };

            return $calc;
        }
    }
    // define classes tests. ================================================

    // define functions tests. ==============================================
    /**
     * This function is in un-namespace.
     * 
     * @since 0.0.6
     */
    function connectUnNamespace()
    {
    }

    /**
     * Anonymous function
     * 
     * @since 0.0.7
     */
    $greet = function($name) 
    {
        /**
         * @since 0.0.8
         */
        function hellogreet() {
            return 'hello';
        }
        return $name;
    };
    // define functions tests. ==============================================

    session_start();
    $a = MyProject\connect();
    echo MyProject\Connection::test();
}