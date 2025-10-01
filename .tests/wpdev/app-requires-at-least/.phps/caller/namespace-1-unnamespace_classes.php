<?php
/**
 * Declaring multiple namespaces and unnamespaced code
 * 
 * @link https://www.php.net/manual/en/language.namespaces.definitionmultiple.php Namespace refrence
 */


namespace MyProject {
    // call classes tests. ==================================================
    $Conn = new Connection();// expect class `MyProject\Connection`
    new Connection2;// expect class `MyProject\Connection2`
    new (__NAMESPACE__ . '\\Connection3')();// expect `MyProject\Connection3`
    $Conn->plug();
    print_r($Conn->portNumber);
    if ($Conn->logicPort === 0) {}
    $Conn->isConnect()->pingCheck();

    Connection::test();// expect class `MyProject\Connection`
    \Connection::test();// fqn, expect class `Connection`
    AnotherConnection::test();// expect class `MyProject\AnotherConnection`

    echo (int) Connection::CONSTANT_IN_CLASS;
    $Conn::X;

    $FinalClassName = 'FinalClass';
    $FinalClass = new $FinalClassName;// fqn, expect class `FinalClass`
    $FinalClass->test2();
    echo $FinalClass?->methodNotExists();

    var_dump(new (getSomeClass()));// expect fqn, class `ClassA` but skipped in test
    var_dump(new ('Class' . 'B' . 'e'));// fqn, expect class `ClassBe`
    var_dump(new (ClassD::class));// expect class `MyProject\ClassD`

    echo (new DateTime())->format('Y'), PHP_EOL;// expect class `MyProject\DateTime`
    echo new \DateTimeZone('Asia/Bangkok')->getName() . PHP_EOL;// expect class `DateTimeZone`

    $StandaloneAnonymousClass->writeOut('Hello');// expect `$StandaloneAnonymousClass->writeOut`
    global $wpdb;// read more in namespace-0_classes.php
    echo $wpdb->prefix;

    call_user_func('ClassE::staticMethod2');// fqn, expect `ClassE`
    call_user_func($Conn . '::staticMethod2');// expect class `MyProject\Connection`
    call_user_func(__NAMESPACE__ . '\\ClassH::staticMethod3');// fqn, expect `MyProject\ClassH`
    call_user_func(['ClassC', 'staticMethod']);// fqn, expect class `ClassC`
    call_user_func(['ClassF', 'staticMethod']);// fqn, expect class `ClassF`
    call_user_func([$Conn, 'methodNotExists']);// expect class `MyProject\Connection`

    call_user_func_array('ClassG::staticMethod4', ['two', 'three']);// fqn, expect class `ClassG`
    call_user_func_array([$FinalClass, 'bar'], ['three', 'four']);// expect class `FinalClass`
    call_user_func_array(['ClassH', 'staticMethod3'], ['two']);// fqn, expect class `ClassH`
    // call classes tests. ==================================================
}


namespace {// global code
    use MyProject\ClassC;
    use MyProject\SomeClass as Sc;
    use MyProject\Tasks;
    
    $Cc = new ClassC();// expect class `MyProject\ClassC`
    echo $Cc->run();
    $Sc = new Sc();// expect class `MyProject\SomeClass`
    $TaskOpen = new Tasks\OpenFile();// expect class `MyProject\Tasks\OpenFile`

    new DateTime();// expect class `DateTime`
}
