
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import Path from "../../../../app/Libraries/Path.mjs";


beforeAll(() => {
    const __filename = fileURLToPath(import.meta.url);
    global.WPDEV_APPDIR = path.dirname(path.dirname(path.dirname(path.dirname(path.dirname(__filename)))));
    global.CW_DIR = path.dirname(path.dirname(path.dirname(path.dirname(__filename))));
});


describe('Paths.mjs test', () => {
    test('Test remove begin slashes', () => {
        expect(Path.removeBeginSlash('/var/www/')).toBe('var/www/');
        expect(Path.removeBeginSlash('/var/www')).toBe('var/www');
        expect(Path.removeBeginSlash('\\path\\file.php')).toBe('path\\file.php');
    });


    test('Test remove trailing quotes', () => {
        expect(Path.removeTrailingQuotes('/var/www/"')).toBe('/var/www/');
        expect(Path.removeTrailingQuotes('/var/www/\'')).toBe('/var/www/');
        expect(Path.removeTrailingQuotes('C:\\wwwroot')).toBe('C:\\wwwroot');
        expect(Path.removeTrailingQuotes('C:\\wwwroot\"')).toBe('C:\\wwwroot');
        expect(Path.removeTrailingQuotes('C:\\wwwroot\'')).toBe('C:\\wwwroot');
        expect(Path.removeTrailingQuotes('C:\\wwwroot\\"')).toBe('C:\\wwwroot\\');
    });


    test('Test remove trailing slashes', () => {
        expect(Path.removeTrailingSlash('/var/www/')).toBe('/var/www');
        expect(Path.removeTrailingSlash('/var/www//')).toBe('/var/www');
        expect(Path.removeTrailingSlash('/var/www\\')).toBe('/var/www');
        expect(Path.removeTrailingSlash('/var/www\\//')).toBe('/var/www');
        expect(Path.removeTrailingSlash('/var/www\\//\\')).toBe('/var/www');
    });


    test('Test replace begins of file path with destination', () => {
        expect(Path.replaceDestinationFolder('assets/vendor/bootstrap/js/file.js', 'assets/vendor/bootstrap', ['assets/vendor/bootstrap/**']))
        .toMatch(/^assets\/vendor\/bootstrap\/js\/file\.js$/);
        // on below..
        // anything inside bootstrap folder (refer from glob pattern **) will be change destination to be under assets folder.
        expect(Path.replaceDestinationFolder('assets/vendor/bootstrap/js/file.js', 'assets', ['assets/vendor/bootstrap/**']))
        .toMatch(/^assets\/js\/file\.js$/);
        // from the logic above, anything inside bootstrap folder will be change destination to under nothing or just grabbed path (js/file.js).
        expect(Path.replaceDestinationFolder('assets/vendor/bootstrap/js/file.js', '', ['assets/vendor/bootstrap/**'])).toMatch(/^js\/file\.js$/);
        // same as above but not provide pattern. so, the original file path will be returned (but normalized separator).
        expect(Path.replaceDestinationFolder('assets/vendor/bootstrap/js/file.js', '')).toMatch(/^assets\/vendor\/bootstrap\/js\/file\.js$/);
        // same as above but convert separator to back slash.
        expect(Path.replaceDestinationFolder('assets/vendor/bootstrap/js/file.js', '', '', '\\')).toMatch(/^assets\\vendor\\bootstrap\\js\\file\.js$/);

        expect(Path.replaceDestinationFolder('assets/js/file.js', 'assets', ['assets/**'])).toMatch(/^assets\/js\/file\.js$/);
        expect(Path.replaceDestinationFolder('/assets/js/file.js', 'assets', ['assets/**'])).toMatch(/^assets\/js\/file\.js$/);
        expect(Path.replaceDestinationFolder('\\assets\\js\\file.js', 'assets', ['assets/**'])).toMatch(/^assets\/js\/file\.js$/);
        expect(Path.replaceDestinationFolder('assets/js/file.js', 'new-assets', ['assets/**'])).toMatch(/^new\-assets\/js\/file\.js$/);
        expect(Path.replaceDestinationFolder('assets/js/file.js', 'new-assets', 'assets/**')).toMatch(/^new\-assets\/js\/file\.js$/);
        expect(Path.replaceDestinationFolder('assets/js/file.js', '', 'assets/**')).toMatch(/^js\/file\.js$/);
        expect(Path.replaceDestinationFolder('assets/js/file.js', '')).toMatch(/^assets\/js\/file\.js$/);// no pattern

        expect(Path.replaceDestinationFolder('assets-src/js/file.js', 'assets', ['assets-src/**'])).toMatch(/^assets\/js\/file\.js$/);
        expect(Path.replaceDestinationFolder('assets-src/js/file.js', './assets', ['assets-src/**'])).toMatch(/^assets\/js\/file\.js$/);

        expect(Path.replaceDestinationFolder('assets-src\\js\\file.js', '.\\assets', ['assets-src/**'], '\\')).toMatch(/^assets\\js\\file\.js$/);
        expect(Path.replaceDestinationFolder('assets-src\\js\\file.js', './assets', ['assets-src/**'], '\\')).toMatch(/^assets\\js\\file\.js$/);

        expect(Path.replaceDestinationFolder('assets/js/file.js', '', 'assets/**')).toMatch(/^js\/file\.js$/);
        expect(Path.replaceDestinationFolder('inc/file.php', 'inc', 'inc/**')).toMatch(/^inc\/file\.php$/);
        expect(Path.replaceDestinationFolder('inc/file.php', '', 'inc/**')).toMatch(/^file\.php$/);
        expect(Path.replaceDestinationFolder('file.php', '.', ['*.php'])).toMatch(/^\.\/file\.php$/);
        expect(Path.replaceDestinationFolder('file.php', '', ['*.php'])).toMatch(/^file\.php$/);
        expect(Path.replaceDestinationFolder('file.php', '')).toMatch(/^file\.php$/);// no pattern

        // below is failed to test with glob pattern. it must returns original file path (but remove begin slashes).
        expect(Path.replaceDestinationFolder('assets/js/file.js', 'assets', ['assets/**/*.css'])).toMatch(/^assets\/js\/file\.js$/);
        expect(Path.replaceDestinationFolder('/file.php', '', ['*.phpt'])).toMatch(/^file\.php$/);
    });
});