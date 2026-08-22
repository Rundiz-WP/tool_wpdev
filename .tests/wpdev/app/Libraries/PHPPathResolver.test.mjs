
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import PHPPathResolver from "../../../../app/Libraries/PHPPathResolver.mjs";


let tempDir;
let pluginDir;
let pluginSubDir;
let themeDir;
let themeSubDir;
let plainDir;


beforeAll(() => {
    const __filename = fileURLToPath(import.meta.url);
    global.WPDEV_APPDIR = path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(__filename)))));

    // create fixtures in temp folder.
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'php-path-resolver-'));

    // plugin project with main plugin file that contain required header.
    pluginDir = path.join(tempDir, 'my-plugin');
    pluginSubDir = path.join(pluginDir, 'App', 'Controllers');
    fs.mkdirSync(pluginSubDir, {
        recursive: true,
    });
    fs.writeFileSync(path.join(pluginDir, 'my-plugin.php'), '<?php\n/**\n * Plugin Name: My Plugin\n */\n');

    // theme project with style.css that contain required header.
    themeDir = path.join(tempDir, 'my-theme');
    themeSubDir = path.join(themeDir, 'Inc', 'Libraries');
    fs.mkdirSync(themeSubDir, {
        recursive: true,
    });
    fs.writeFileSync(path.join(themeDir, 'style.css'), '/**\n * Theme Name: My Theme\n */\n');

    // plain folder that is not WordPress plugin nor theme.
    plainDir = path.join(tempDir, 'plain');
    fs.mkdirSync(plainDir, {
        recursive: true,
    });
});


afterAll(() => {
    fs.rmSync(tempDir, {
        recursive: true,
        force: true,
    });
    delete global.CW_DIR;
});


describe('PHPPathResolver.mjs test', () => {
    test('Test find project root from plugin folder and its sub folder', () => {
        const PHPPathResolverObj = new PHPPathResolver();

        global.CW_DIR = pluginDir;
        expect(PHPPathResolverObj.findProjectRoot()).toBe(pluginDir);

        global.CW_DIR = pluginSubDir;
        expect(PHPPathResolverObj.findProjectRoot()).toBe(pluginDir);
    });


    test('Test find project root from theme sub folder', () => {
        const PHPPathResolverObj = new PHPPathResolver();

        global.CW_DIR = themeSubDir;
        expect(PHPPathResolverObj.findProjectRoot()).toBe(themeDir);
    });


    test('Test find project root on non WordPress project must throw error', () => {
        const PHPPathResolverObj = new PHPPathResolver();

        expect(() => {
            PHPPathResolverObj.findProjectRoot(plainDir);
        }).toThrow();
    });


    test('Test is plugin dir and is theme dir', () => {
        const PHPPathResolverObj = new PHPPathResolver();

        expect(PHPPathResolverObj.isPluginDir(pluginDir)).toBe(true);
        expect(PHPPathResolverObj.isPluginDir(themeDir)).toBe(false);
        expect(PHPPathResolverObj.isThemeDir(themeDir)).toBe(true);
        expect(PHPPathResolverObj.isThemeDir(pluginDir)).toBe(false);
        expect(PHPPathResolverObj.isThemeDir(plainDir)).toBe(false);
    });


    test('Test resolve relative path from current working directory', () => {
        const PHPPathResolverObj = new PHPPathResolver();

        global.CW_DIR = pluginSubDir;
        expect(PHPPathResolverObj.resolve('Admin/ListNotes'))
        .toBe(path.join(pluginSubDir, 'Admin', 'ListNotes.php'));
        expect(PHPPathResolverObj.resolve('Admin\\ListNotes'))
        .toBe(path.join(pluginSubDir, 'Admin', 'ListNotes.php'));
        // `.php` extension should not be appended if it is already there.
        expect(PHPPathResolverObj.resolve('Admin/ListNotes.php'))
        .toBe(path.join(pluginSubDir, 'Admin', 'ListNotes.php'));
    });


    test('Test resolve absolute path from main project\'s folder', () => {
        const PHPPathResolverObj = new PHPPathResolver();

        global.CW_DIR = themeSubDir;
        // mixed directory separators are allowed after the begin back slash.
        expect(PHPPathResolverObj.resolve('\\Inc\\Libraries/PaginationHelper'))
        .toBe(path.join(themeDir, 'Inc', 'Libraries', 'PaginationHelper.php'));
        expect(PHPPathResolverObj.resolve('\\Inc/Libraries/PaginationHelper'))
        .toBe(path.join(themeDir, 'Inc', 'Libraries', 'PaginationHelper.php'));
    });


    test('Test resolve invalid input path must throw error', () => {
        const PHPPathResolverObj = new PHPPathResolver();

        global.CW_DIR = pluginDir;

        expect(() => {
            PHPPathResolverObj.resolve('');
        }).toThrow();
        expect(() => {
            PHPPathResolverObj.resolve(123);
        }).toThrow();
        // the absolute path must start with back slash (\). forward slash is not allowed.
        expect(() => {
            PHPPathResolverObj.resolve('/Inc/Libraries/PaginationHelper');
        }).toThrow();
    });
});
