<?php
/**
 * Get list of core codes and save to JSON file beside this file.
 */


$constants = get_defined_constants(true);
unset($constants['user']);
$constants = array_keys(array_merge(...array_values($constants)));

$functions = get_defined_functions();

$coreClasses = [];
foreach (get_declared_classes() as $class) {
    $reflection = new \ReflectionClass($class);
    // only include internal classes (built-in, not user-defined)
    if ($reflection->isInternal()) {
        $coreClasses[] = $class;
    }
}// endforeach;
unset($class, $reflection);


$fileContents = new \stdClass();
$fileContents->php_version = PHP_VERSION;
$fileContents->constants = $constants;
$fileContents->functions = $functions['internal'];
$fileContents->classes = $coreClasses;
unset($constants, $coreClasses, $functions);

$file = __DIR__ . DIRECTORY_SEPARATOR . '.php-core-codes.json';
file_put_contents($file, json_encode($fileContents, JSON_PRETTY_PRINT));

if (is_file($file)) {
    echo 'success';
} else {
    echo 'failed';
}