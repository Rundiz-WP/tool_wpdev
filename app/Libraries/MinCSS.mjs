/**
 * Minify CSS.
 */


'use strict';


import { SourceMapConsumer, SourceMapGenerator } from 'source-map';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as sass from 'sass';
import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import path from 'node:path';
// import this app's useful class.
import TextStyles from './TextStyles.mjs';
// import class that extends from.
import BasedBundler from './BasedBundler.mjs';


export default class MinCSS extends BasedBundler {


    /**
     * @type {boolean} Mark as run `minify()` or not. Result will be `true` if it is already runned.
     */
    #minified = false;


    /**
     * @type {Object} Sass options. See https://sass-lang.com/documentation/js-api/interfaces/options/
     */
    options = {};

    
    /**
     * @type {string[]} The source files array.
     */
    sourceFiles = [];


    /**
     * Class constructor.
     * 
     * @param {Object} Object Accept arguments
     * @param {string|string[]} Object.sourceFiles The source files. Relative from this RundizBones module's folder.
     * @param {import('sass').Options<"sync">} Object.options Accept options
     */
    constructor({sourceFiles, options = {}} = {}) {
        super();

        if (sourceFiles) {
            if (!Array.isArray(sourceFiles)) {
                sourceFiles = [sourceFiles];
            }
            this.sourceFiles = sourceFiles;
        } else {
            throw new Error('The `sourceFiles` argument is required.');
        }

        const defaults = {
            style: 'compressed',
            sourceMap: false,
        };

        if (typeof(options) === 'object') {
            this.options = {
                ...defaults,
                ...options
            };
        }
    }// constructor


    /**
     * Inline `.css` @imports recursively and track each line's original file/line.
     * This lets us correctly remap source maps back to original files.
     *
     * @param {string} content The CSS content string.
     * @param {string} filePath The absolute path of the file this content came from.
     * @param {string|null} rebaseTo Absolute path to rebase url() against, or null.
     * @returns {{ content: string, lineMap: Array<{file: string, line: number}> }}
     */
    _inlineWithLineMap(content, filePath, rebaseTo = null) {
        const outputLines = [];
        const lineMap = []; // lineMap[i] = original {file, line} for line (i+1) in output

        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.match(/@import\s+['"]([^'"]+\.css)['"]\s*;/);
            if (match) {
                // Inline the imported file instead of keeping the @import.
                const importPath = match[1];
                const fullPath = path.resolve(path.dirname(filePath), importPath);
                if (fs.existsSync(fullPath)) {
                    let importedContent = fs.readFileSync(fullPath, 'utf8');
                    if (rebaseTo) {
                        importedContent = this._rebaseUrls(importedContent, path.dirname(fullPath), rebaseTo);
                    }
                    const { content: nested, lineMap: nestedMap } =
                        this._inlineWithLineMap(importedContent, fullPath, rebaseTo);
                    outputLines.push(...nested.split('\n'));
                    lineMap.push(...nestedMap);
                } else {
                    console.warn('    ' + 'Warning: Could not find import: ' + importPath);
                    // Keep the @import line as-is if file not found.
                    outputLines.push(line);
                    lineMap.push({ file: filePath, line: i + 1 });
                }
            } else {
                outputLines.push(line);
                lineMap.push({ file: filePath, line: i + 1 });
            }
        }

        return { content: outputLines.join('\n'), lineMap };
    }// _inlineWithLineMap


    /**
     * Rebase relative url() paths in CSS content from one directory to another.
     *
     * @param {string} content The CSS content string.
     * @param {string} fromDir The directory the URLs are currently relative to.
     * @param {string} toDir The directory to rebase URLs relative to.
     * @returns {string} CSS content with rebased URLs.
     */
    _rebaseUrls(content, fromDir, toDir) {
        return content.replace(
            /url\(\s*(['"]?)([^)'"]+)\1\s*\)/g,
            (match, quote, urlValue) => {
                // Skip absolute URLs, data URIs, hash-only, etc.
                if (/^(https?:\/\/|\/\/|\/|data:|#)/.test(urlValue)) {
                    return match;
                }
                const absolutePath = path.resolve(fromDir, urlValue);
                const rebased = path.relative(toDir, absolutePath).replace(/\\/g, '/');
                return `url(${quote}${rebased}${quote})`;
            }
        );
    }// _rebaseUrls


    /**
     * Minify CSS file.
     * 
     * @async This method is asynchronous, it must call with `await` to hold processed and then go to next method.
     * @param {string} destinationFile The destination file name only, no path.
     * @return {Promise} Return Promise object with full path to destination file.
     */
    async minify(destinationFile) {
        if (typeof(destinationFile) !== 'string') {
            throw new Error('The argument `destinationFile` must be string.');
        }

        if (typeof(destinationFile) === 'string') {
            this._destinationFile = destinationFile;
        }

        const generateSourceMap = this.options.sourceMap === true;
        const { rebaseTo: rebaseToOption, ...sassOptions } = this.options;
        const rebaseTo = rebaseToOption
            ? path.resolve(CW_DIR, rebaseToOption)
            : null;

        const generator = generateSourceMap
            ? new SourceMapGenerator({ file: destinationFile })
            : null;

        let combinedCss = '';
        let lineOffset = 0;

        for (const sourceFile of this.sourceFiles) {
            const sourceFullPath = path.resolve(CW_DIR, sourceFile);
            if (!fs.existsSync(sourceFullPath)) {
                console.warn('    ' + TextStyles.txtWarning('Warning: ' + sourceFullPath + ' is not found.'));
                continue;
            }

            const rawContent = await fsPromise.readFile(sourceFullPath, 'utf8');

            // Inline @imports and build line map: inlined line → {original file, original line}.
            const { content: inlinedContent, lineMap } =
                this._inlineWithLineMap(rawContent, sourceFullPath, rebaseTo);

            // Compile inlined content — Sass now sees one flat file but source map
            // will be remapped to original files using lineMap below.
            const result = sass.compileString(inlinedContent, {
                ...sassOptions,
                syntax: 'css',
                sourceMap: generateSourceMap,
                url: pathToFileURL(sourceFullPath),
            });

            combinedCss += result.css;

            if (generateSourceMap && result.sourceMap) {
                // Base directory for making source paths relative (avoids file:// protocol errors in browser).
                const baseForRelative = rebaseTo ?? path.resolve(CW_DIR);
                // Track source file contents for sourcesContent embedding.
                const sourceContents = new Map();

                const consumer = await new SourceMapConsumer(result.sourceMap);
                consumer.eachMapping((mapping) => {
                    if (mapping.originalLine === null) return;

                    // Sass maps: compiled → inlined line.
                    // lineMap maps: inlined line → original {file, line}.
                    const originalInfo = lineMap[mapping.originalLine - 1];
                    if (!originalInfo) return;

                    const relativeSource = path.relative(baseForRelative, originalInfo.file)
                        .replace(/\\/g, '/');

                    generator.addMapping({
                        generated: {
                            line: mapping.generatedLine + lineOffset,
                            column: mapping.generatedColumn,
                        },
                        original: {
                            line: originalInfo.line,
                            column: mapping.originalColumn,
                        },
                        source: relativeSource,
                    });

                    // Collect each unique original file's content for sourcesContent.
                    if (sassOptions.sourceMapIncludeSources === true && !sourceContents.has(originalInfo.file)) {
                        sourceContents.set(
                            originalInfo.file,
                            fs.readFileSync(originalInfo.file, 'utf8')
                        );
                    }
                });
                consumer.destroy();

                // Embed original source contents so browser devtools work offline.
                if (sassOptions.sourceMapIncludeSources === true) {
                    for (const [filePath, content] of sourceContents) {
                        const relativeSource = path.relative(baseForRelative, filePath)
                            .replace(/\\/g, '/');
                        generator.setSourceContent(relativeSource, content);
                    }// endfor;
                }// endif;

                lineOffset += result.css.split('\n').length;
            }
        }// endfor;

        this._content = new Buffer.from(combinedCss);
        if (generateSourceMap) {
            this._sourceMapContent = generator.toString();
        }
        this._processed = true;
    }// minify


}