/**
 * Path class.
 */


'use strict';


import { minimatch } from 'minimatch'


export default class Path {

    
    /**
     * Remove begin slash(es).
     * 
     * @param {String} filePath The file path.
     * @returns {String} Return removed begin slashes.
     */
    static removeBeginSlash(filePath) {
        return filePath.replace(/^[\\\/]+/, '');
    }// removeBeginSlash


    /**
     * Remove trailing double quote and quote.
     * 
     * @param {String} filePath The file path.
     * @returns {String} Return removed trailing quotes (single and double).
     */
    static removeTrailingQuotes(filePath) {
        return filePath.replace(/[\"\']+$/, '');// remove " or ' sign.
    }// removeTrailingQuotes


    /**
     * Sanitize an array of destination paths that came from a CLI option that accept multiple 
     * values (such as `--destination` on `watch` command).
     * 
     * On Windows, quoting a path that ends with a backslash (example: `"C:\my\path\"`) is a trap: 
     * the shell/OS command line parser reads that trailing `\"` as an escaped double quote 
     * character rather than as "a backslash followed by the closing quote". This means the quoted 
     * string is never closed, so the parser keeps consuming everything after it - including any 
     * following quoted `--destination` value(s) - as a single argument, and it inserts a literal 
     * `"` character at the point where the accidental escape happened. For example, the CLI input:  
     * `--destination="C:\path\one\" "C:\path\two\"`  
     * is received by this app as ONE corrupted value: `C:\path\one" C:\path\two"` instead of two 
     * separate paths.
     * 
     * This method detects that corruption pattern (a `"` immediately followed by whitespace) and 
     * splits it back into separate paths, then removes wrapping quotes and trailing slashes 
     * (forward and back) from every resulting path.
     * 
     * @param {string[]} destinations Array of destination paths. Example: `argv.destination`.
     * @returns {string[]} Return the cleaned-up (possibly longer) array of destination paths.
     */
    static sanitizeCliDestinations(destinations) {
        if (!Array.isArray(destinations)) {
            return destinations;
        }

        const result = [];
        for (const destination of destinations) {
            if (typeof(destination) !== 'string') {
                result.push(destination);
                continue;
            }

            // recover destination(s) that were merged together because of the Windows 
            // trailing-backslash-escapes-quote issue explained in the docblock above.
            const splitted = destination.split(/\"\s+/);

            for (let eachPath of splitted) {
                eachPath = eachPath.replace(/^[\"\']+/, '');// remove begin quote(s).
                eachPath = Path.removeTrailingQuotes(eachPath);// remove trailing quote(s).
                eachPath = Path.removeTrailingSlash(eachPath);// remove trailing slash(es) or backslash(es).
                eachPath = eachPath.trim();

                if (eachPath !== '') {
                    result.push(eachPath);
                }
            }// endfor;
        }// endfor;

        return result;
    }// sanitizeCliDestinations


    /**
     * Remove trailing slash(es).
     * 
     * @param {String} filePath The file path.
     * @returns {String} Return removed trailing slashes.
     */
    static removeTrailingSlash(filePath) {
        return filePath.replace(/[\\\/]+$/, '');
    }// removeTrailingSlash


    /**
     * Replace begin of file path with destination.
     * 
     * If file path is only file.ext then it will be prepend destination to it. Example: file path is file.js, destination is assets, the result will be assets/file.js
     * 
     * @param {string} filePath File path. Example: `assets-src/js/file.js`.
     * @param {string} destination Destination folder. Do not begins with dot. Example: `assets`.
     * @param {string|string[]} patterns The glob patterns that used in fetching files list. Example: `assets-src/**`.
     * @param {string} sep The folder separator. Default is `/` (forward slash).
     * @returns {string} Return replaced file path with destination. The result will be always removed begin slash. Example: `assets/js/file.js`.
     */
    static replaceDestinationFolder(filePath, destination, patterns = '', sep = '/') {
        if (typeof(filePath) !== 'string' || typeof(destination) !== 'string') {
            throw new Error('The arguments `filePath` and `destination` must be string.');
        }
        if (
            (
                typeof(patterns) !== 'string' && 
                typeof(patterns) !== 'object'
            ) ||
            (
                typeof(patterns) === 'object' &&
                !Array.isArray(patterns)
            )
        ) {
            throw new Error('The argument `patterns` must be string or array.');
        }
        if (typeof(sep) !== 'string') {
            throw new Error('The argument `sep` must be string.');
        }

        // normalize all path on `filePath` and `destination`.
        filePath = filePath.replaceAll(/[\\\/]/g, sep);
        if ('' !== destination) {
            destination = destination.replaceAll(/[\\\/]/g, sep);
        }

        // remove begin dot sign with separator on destination.
        let regexp = new RegExp('^\.' + RegExp.escape(sep));
        destination = destination.replace(regexp, '');
        // remove begin separator on destination.
        destination = Path.removeBeginSlash(destination);

        if ('' === patterns && '' === destination) {
            // if provide no patterns, no destination.
            // returns the original file path (but normalized separator).
            return Path.removeBeginSlash(filePath);
        }

        if (typeof(patterns) === 'string' && patterns !== '') {
            patterns = [patterns];
        }

        for (const eachPattern of patterns) {
            // convert glob pattern to regexp.
            const regexFromGlobPattern = minimatch.makeRe(eachPattern);
            // capture begin path of glob pattern before parentheses `()`.
            const beginPathinGlobPattern = regexFromGlobPattern.toString().match(/^\/?\^?(?<beginpath>.*?)\(/);

            if (typeof(beginPathinGlobPattern?.groups?.beginpath) !== 'undefined') {
                // if found glob pattern to regexp pattern matched.
                // example: pattern `assets-src/**` will be convert to regular expression pattern `^assets\-src(?:\/|(?:(?!(?:\/|^)\.).)*?)?$`
                // and this regular expression pattern will match the code `regexFromGlobPattern.toString().match(..)` above.
                const regexBeginPath = new RegExp(beginPathinGlobPattern.groups.beginpath + '(.+)');
                const removedBeginPath = filePath.replace(regexBeginPath, "$1");
                const remapDest = Path.removeTrailingSlash(destination) + sep + Path.removeBeginSlash(removedBeginPath);
                if (remapDest) {
                    return Path.removeBeginSlash(remapDest);
                }
            }// endif;

            // the above check is not matched, try with another.
            if (!eachPattern.includes('**')) {
                // if not found glob `**` sign.
                let filePathExp = filePath.split(sep);
                const filePathFilename = filePathExp.at(-1);
                filePathExp.splice(-1, 1);
                const destinationExp = destination.split(sep);
                if ('' !== destination && destinationExp.length > 0) {
                    for (const [index, eachDestExp] of destinationExp.entries()) {
                        if (typeof(eachDestExp) === 'string') {
                            filePathExp[index] = destinationExp[index];
                        }
                    }// endfor;
                }
                filePathExp.push(filePathFilename);
                filePath = filePathExp.join(sep);
                return Path.removeBeginSlash(filePath);
            } else {
                console.error('Unknown pattern. Please report this problem on GitHub ( https://github.com/Rundiz-WP/tool_wpdev ). Pattern: "' + JSON.stringify(eachPattern, null, 4) + '"');
            }
        }// endif;

        // come to this line means failed to work with it. return original file path
        return Path.removeBeginSlash(filePath);
    }// replaceDestinationFolder


}