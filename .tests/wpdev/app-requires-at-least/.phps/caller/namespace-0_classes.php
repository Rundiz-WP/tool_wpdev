<?php
/**
 * This file have no namespace at all.
 * 
 * @link https://www.php.net/manual/en/language.oop5.basic.php Class reference
 */

use MyProject\InHistory as SomeProject;
use MyProject\Duplicator\ClassDuplicate;

// call classes tests. ==================================================
$Conn = new Connection();// uqn
new Connection2;// uqn
new \Building\Structure\Reporter();// fqn, expect `Building\Structure\Reporter`
$Conn->plug();
print_r($Conn->portNumber);
if ($Conn->logicPort === 0) {}
$Conn->isConnect()->pingCheck();

Connection::test();// class name is uqn
AnotherConnection::staticIsConnect();// class name is uqn
Connection::$staticProperty;// uqn

echo (int) Connection::CONSTANT_IN_CLASS;// class name is uqn
$Conn::X;

$FinalClassName = 'FinalClass';
$FinalClass = new $FinalClassName;// fqn, expect `FinalClass`
$FinalClass->test2();
echo $FinalClass?->methodNotExists();

new (MyClass::getClassName());// not resolve name in class; expect `MyClass`; expect `MyClass::getClassName()` with unresolved mark;
var_dump(new (getSomeClass()));// not resolve name in function; expect `getSomeClass()` with unresolved mark
var_dump(new (ClassD::class));// uqn, expect `ClassD`
echo Connection2::class;// uqn, expect `Connection2`

// test concatenate class name.
var_dump(new ('Class' . 'B' . 'e'));// fqn, expect `ClassBe`
var_dump(new ($FinalClassName . 'Second'));// expect `FinalClassSecond`
new (ClassDuplicate::class . 's');// uqn, expect `MyProject\Duplicator\ClassDuplicate`, `MyProject\Duplicator\ClassDuplicates`
new (SomeProject\Classes\ClassD::class . 'efinition');// qn, expect `MyProject\InHistory\Classes\ClassD`, `MyProject\InHistory\Classes\ClassDefinition`
new (Workspace\FirstFloor\ClassD::class . 'oubleRoom');// qn, expect `Workspace\FirstFloor\ClassD`, `Workspace\FirstFloor\ClassDoubleRoom`
new (\Connection2::class . 'Monitor');// fqn, expect `Connection2`, `Connection2Monitor`

echo (new DateTime())->format('Y'), PHP_EOL;
echo new DateTimeZone('Asia/Bangkok')->getName() . PHP_EOL;

$StandaloneAnonymousClass->writeOut('Hello');
global $wpdb;// this need to lookup core data AND check with class's member calls below. just skip this for now.
echo $wpdb->prefix;
$method = 'methodFromVariable';

call_user_func('ClassE::staticMethod2');// fqn, expect `ClassE`
call_user_func('Class' . 'NameConcat' . '::' . 'method' . 'Name');// fqn, expect `ClassNameConcat`
call_user_func($FinalClassName . 'Number2' . '::staticMethod5');// fqn, expect `FinalClassNumber2`
call_user_func(['ClassC', 'staticMethod1']);// fqn, expect `ClassC`
call_user_func(['ClassC', $method]);
call_user_func([new NewRoad(), 'methodNotExists']);// expect `NewRoad`
call_user_func([ClassD::class, 'staticMethod6']);// uqn, expect `ClassD`

call_user_func_array('ClassG::staticMethod4', ['two', 'three']);// fqn, expect `ClassG`
call_user_func_array([$FinalClass, 'bar'], ['three', 'four']);// expect `FinalClass`
call_user_func_array(['ClassC', 'staticMethod3'], ['two']);// fqn, expect `ClassC`
// call classes tests. ==================================================


// below is just prevent errors in editor.
class Connection2 {}
class ClassD {}
function getSomeClass(): string
{
    return 'ClassA';
}