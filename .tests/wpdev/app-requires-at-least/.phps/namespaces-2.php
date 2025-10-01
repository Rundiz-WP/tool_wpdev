<?php
/**
 * Declaring multiple namespaces, simple combination syntax
 * 
 * @link https://www.php.net/manual/en/language.namespaces.definitionmultiple.php
 */

namespace MyProject;

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
    // define classes tests. ================================================

    // define functions tests. ==============================================
    /**
     * @since 0.0.2
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
     * @since 0.0.6
     */
    $findNetwork = function()
    {
    };
    // define functions tests. ==============================================



namespace AnotherProject;

    // define constants tests. ==============================================
    /**
     * @since 0.0.1
     * @since 0.2.5
     */
    const CONNECT_OK = 1;

    /**
     * Executing Ajax process.
     *
     * @since 2.1.0
     * @since 2.1.1 Test version description.
     */
    define( 'DOING_AJAX', true );

    /**
     * @since 0.0.3
     */
    define( 'CONSTANT_UNDER_ANOTHERPROJECT_NAMESPACE', true );
    // define constants tests. ==============================================

    // define classes tests. ================================================
    /**
     * @since 0.0.2 class connection
     */
    class ConnectionFiber
    {
        /**
         * @since 0.0.3
         */
        const CONSTANT_IN_CLASS_F = true;

        /**
         * @since 0.0.8
         */
        final public const X_F = "foo";

        /**
         * @since 0.1.13
         */
        public $portNumberFiber;

        /**
         * @since 0.1.18
         */
        final public $logicPortFiber = 0;

        /**
         * @since 0.0.4
         */
        public function plugFiber()
        {
            /**
             * @since 0.1.0 Anonymous class
             */
            return new class
            {
                /**
                 * @since 0.1.0
                 */
                public function tryToConnect2()
                {
                }
            };
        }

        /**
         * @since 0.0.3
         */
        public function isConnectFiber()
        {
            /**
             * @since 0.1.1 Anonymous class on variable.
             */
            $checker2 = new class
            {
                /**
                 * @since 0.1.1
                 */
                public function pingCheck2()
                {
                }
            };
            return $checker2;
        }

        /**
         * @since 0.0.12 Static method.
         */
        public static function test2()
        {
        }
    }

    /**
     * @since 0.2.0 final class
     */
    final class FinalClass {
        /**
         * @since 0.2.2
         */
        final protected string $test3;

        /**
         * @since 0.2.0
         */
        public function test3() 
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
     * @since 0.0.6
     */
    function connect() 
    {
    }

    /**
     * @since 0.0.7
     */
    function outerFunction()
    {
        /**
         * Functions within functions
         * 
         * @since 0.0.8
         */
        function innerFunction()
        {
        }
    }

    /**
     * Return reference from a function
     *
     * @since 0.0.9
     */
    function &returns_reference()
    {
    }

    /**
     * @since 0.0.10
     * @since 0.1.0 Update 1
     */
    function measureConnection()
    {
    }

    /**
     * Anonymous function
     * 
     * @since 0.0.11
     */
    $greet = function($name) 
    {
        /**
         * @since 0.0.12
         */
        function hellogreet() {
            return 'hello';
        }
        return $name;
    };

    /**
     * Static anonymous function
     * 
     * @since 0.0.13
     */
    $staticAnonymousFuncion = static function()
    {
    };

    /**
     * @since 0.0.14
     */
    $sendMessage = function() use ($greet)
    {
    };

    /**
     * Arrow function
     * 
     * @since 0.0.15
     */
    $calXY = fn($x) => $x + $y;

    /**
     * Static Arrow function
     * 
     * @since 0.0.16
     */
    $calXYStatic = static fn($x) => $x + $y;
    // define functions tests. ==============================================
