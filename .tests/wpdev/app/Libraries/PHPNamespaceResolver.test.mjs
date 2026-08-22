
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import PHPNamespaceResolver from "../../../../app/Libraries/PHPNamespaceResolver.mjs";


let tempDir;
let pluginDir;


beforeAll(() => {
    const __filename = fileURLToPath(import.meta.url);
    global.WPDEV_APPDIR = path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(__filename)))));

    // create fixtures in temp folder.
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'php-namespace-resolver-'));

    pluginDir = path.join(tempDir, 'my-plugin');
    fs.mkdirSync(path.join(pluginDir, 'App', 'Controllers', 'Admin'), {
        recursive: true,
    });
    fs.mkdirSync(path.join(pluginDir, 'App', 'Models'), {
        recursive: true,
    });
    fs.mkdirSync(path.join(pluginDir, 'App', 'NoNs'), {
        recursive: true,
    });
    fs.mkdirSync(path.join(pluginDir, 'Vendor'), {
        recursive: true,
    });
    fs.mkdirSync(path.join(pluginDir, 'Helpers'), {
        recursive: true,
    });

    // main plugin file with required header but no namespace.
    fs.writeFileSync(path.join(pluginDir, 'my-plugin.php'), '<?php\n/**\n * Plugin Name: My Plugin\n */\n');

    // existing namespaced files in various depths and syntaxes.
    fs.writeFileSync(path.join(pluginDir, 'App', 'Controllers', 'Existing.php'), '<?php\n\nnamespace MyPlugin\\App\\Controllers;\n\nclass Existing {}\n');
    fs.writeFileSync(path.join(pluginDir, 'App', 'Controllers', 'Admin', 'Dashboard.php'), '<?php\n\nnamespace MyPlugin\\App\\Controllers\\Admin;\n\nclass Dashboard {}\n');
    fs.writeFileSync(path.join(pluginDir, 'App', 'Models', 'User.php'), '<?php\n\nnamespace MyPlugin\\App\\Models {\n\nclass User {}\n}\n');
    fs.writeFileSync(path.join(pluginDir, 'Vendor', 'Helper.php'), '<?php\n\nnamespace MyPlugin\\Vendor;\n\nclass Helper {}\n');
    fs.writeFileSync(path.join(pluginDir, 'App', 'NoNs', 'helpers.php'), '<?php\n\nfunction my_plugin_helpers() {}\n');

    // set current working directory to plugin project root.
    global.CW_DIR = pluginDir;
});


afterAll(() => {
    fs.rmSync(tempDir, {
        recursive: true,
        force: true,
    });
    delete global.CW_DIR;
});


describe('PHPNamespaceResolver.mjs test', () => {
    test('Test detect namespace in a folder', () => {
        const PHPNamespaceResolverObj = new PHPNamespaceResolver();

        expect(PHPNamespaceResolverObj.detectNamespaceInDir(path.join(pluginDir, 'App', 'Controllers')))
        .toBe('MyPlugin\\App\\Controllers');
        expect(PHPNamespaceResolverObj.detectNamespaceInDir(path.join(pluginDir, 'App', 'Models')))
        .toBe('MyPlugin\\App\\Models');
        // non-existent folder must return null.
        expect(PHPNamespaceResolverObj.detectNamespaceInDir(path.join(pluginDir, 'NotExists')))
        .toBeNull();
        // folder with no namespace declaration must return null.
        expect(PHPNamespaceResolverObj.detectNamespaceInDir(path.join(pluginDir, 'App', 'NoNs')))
        .toBeNull();
    });


    test('Test resolve in the same folder as an existing namespaced file', () => {
        const PHPNamespaceResolverObj = new PHPNamespaceResolver();

        expect(PHPNamespaceResolverObj.resolve(path.join(pluginDir, 'App', 'Controllers', 'New.php')))
        .toBe('MyPlugin\\App\\Controllers');
        expect(PHPNamespaceResolverObj.resolve(path.join(pluginDir, 'App', 'Controllers', 'Admin', 'Other.php')))
        .toBe('MyPlugin\\App\\Controllers\\Admin');
        expect(PHPNamespaceResolverObj.resolve(path.join(pluginDir, 'App', 'Models', 'Post.php')))
        .toBe('MyPlugin\\App\\Models');
        expect(PHPNamespaceResolverObj.resolve(path.join(pluginDir, 'Vendor', 'Another.php')))
        .toBe('MyPlugin\\Vendor');
    });


    test('Test resolve appends sub folders from detected ancestor', () => {
        const PHPNamespaceResolverObj = new PHPNamespaceResolver();

        // namespace detected in `Controllers`, append `Admin\Sub`.
        expect(PHPNamespaceResolverObj.resolve(path.join(pluginDir, 'App', 'Controllers', 'Admin', 'Sub', 'Deep.php')))
        .toBe('MyPlugin\\App\\Controllers\\Admin\\Sub');
    });


    test('Test resolve falls back to folder names when no namespace detected', () => {
        const PHPNamespaceResolverObj = new PHPNamespaceResolver();

        // no existing namespaced file under `Helpers`.
        expect(PHPNamespaceResolverObj.resolve(path.join(pluginDir, 'Helpers', 'Number.php')))
        .toBe('Helpers');
        // input `\MyPlugin\Helpers\Number` style: path relative to project root is `MyPlugin\Helpers`.
        const myPluginHelpersDir = path.join(pluginDir, 'MyPlugin', 'Helpers');
        fs.mkdirSync(myPluginHelpersDir, {
            recursive: true,
        });
        expect(PHPNamespaceResolverObj.resolve(path.join(myPluginHelpersDir, 'Number.php')))
        .toBe('MyPlugin\\Helpers');
    });


    test('Test resolve at project root has no namespace', () => {
        const PHPNamespaceResolverObj = new PHPNamespaceResolver();

        // file directly in main project's folder and no namespace found -> empty string.
        expect(PHPNamespaceResolverObj.resolve(path.join(pluginDir, 'SomeRoot.php')))
        .toBe('');
    });
});
