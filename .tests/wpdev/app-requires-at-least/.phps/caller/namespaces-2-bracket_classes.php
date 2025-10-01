<?php
/**
 * Declaring multiple namespaces, bracketed syntax
 * 
 * @link https://www.php.net/manual/en/language.namespaces.definitionmultiple.php Namespace refrence
 */


namespace MyProject {
    use OtherProject\Cabinets\FinanceReport as OPCFinanceReport;
    // call classes tests. ==================================================
    new OPCFinanceReport();// uqn, expect `OtherProject\Cabinets\FinanceReport`
    // call classes tests. ==================================================

    class PowerPlan
    {
        public function initiate()
        {}
    }
}


namespace AnotherProject {

    // call classes tests. ==================================================
    new PowerPlan();// uqn, expect `AnotherProject\PowerPlan`
    new MyProject\PowerPlan();// qn, expect `AnotherProject\MyProject\PowerPlan`
    new \MyProject\PowerPlan();// fqn, expect `MyProject\PowerPlan`
    call_user_func(__NAMESPACE__ . '\\ClassA::staticMethod');// fqn, expect `AnotherProject\ClassA`
    // call classes tests. ==================================================
}
