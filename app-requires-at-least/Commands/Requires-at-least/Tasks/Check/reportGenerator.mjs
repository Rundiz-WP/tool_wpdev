/**
 * Report generator.
 */


'use strict';


import fs from 'node:fs';
import path from "node:path";
// import libraries
import NtConfig from '../../../../../app/Libraries/NtConfig.mjs';


export default class ReportGenerator {
    

    /**
     * @type {Object} The CLI arguments.
     */
    #argv = {};


    /**
     * @type {string} Check data PHP JSON file full path.
     */
    #checkDataPHPJSON = '';


    /**
     * @type {string} Save processed data folder in full path. File name is not included.
     */
    #saveDir = '';


    /**
     * JSON path PHP caller worker.
     * 
     * @param {object} argv The CLI arguments.
     * @param {object} options The options.
     * @param {string} options.checkDataPHPJSON Check data PHP JSON file full path.
     * @param {string} options.saveDir Save processed data folder in full path. File name is not included.
     * @throws Throw the error if required option is not specified.
     */
    constructor(argv = {}, options = {}) {
        if (typeof(argv) === 'object') {
            this.#argv = argv;
        }

        if (typeof(options?.checkDataPHPJSON) === 'string') {
            this.#checkDataPHPJSON = options.checkDataPHPJSON;
        }
        if (typeof(options?.saveDir) === 'string') {
            this.#saveDir = options.saveDir;
        }

        this.#checkRequiredOptions();
    }// constructor


    /**
     * Getter report file name (with extension).
     */
    get reportFileName() {
        return path.basename(this.#checkDataPHPJSON, path.extname(this.#checkDataPHPJSON)) + '.html';
    }// reportFileName


    /**
     * Getter report file full path.
     */
    get reportFilePath() {
        return this.#saveDir + path.sep + this.reportFileName;
    }// reportFilePath


    /**
     * Check required options.
     * 
     * This method was called from `constructor()`.
     */
    #checkRequiredOptions() {
        if (this.#checkDataPHPJSON === '') {
            throw new Error('The option `checkDataPHPJSON` is required.');
        }
        if (this.#saveDir === '') {
            throw new Error('The option `saveDir` is required.');
        }
    }// #checkRequiredOptions


    /**
     * Escape JSON for variable.
     * 
     * This will be replace `\` to be `\\` that is working on JS variable.
     * 
     * @param {string} JSONString 
     * @returns {string}
     */
    #escapeJSONForVar(JSONString) {
        if (typeof(JSONString) !== 'string') {
            throw new Error('The argument `JSONString` must be string.');
        }

        return JSONString.replaceAll(/\\/g, '\\\\');
    }// #escapeJSONForVar


    /**
     * Generate the report HTML file.
     * 
     * @returns {boolean} Return `true` if success write report file. Get report file full path at property `reportFilePath`.
     */
    generate() {
        const templateFile = path.resolve(import.meta.dirname, 'report-template.html');
        if (!fs.existsSync(templateFile)) {
            throw new Error('The report template file is not exists. (' + templateFile + ').');
        }

        let reportTemplate = fs.readFileSync(templateFile);
        reportTemplate = reportTemplate.toString()

        // replace `{programName}`.
        const NtConfigObj = new NtConfig(this.#argv);
        const programName = NtConfigObj.getValue('moduleName');
        reportTemplate = reportTemplate.replaceAll(/\{programName\}/g, programName);
        // replace `{programVersion}`.
        if (fs.existsSync('./package.json')) {
            const packageJSONObj = JSON.parse(fs.readFileSync('./package.json'));
            reportTemplate = reportTemplate.replaceAll(/\{programVersion\}/g, packageJSONObj.version);
        } else {
            reportTemplate = reportTemplate.replaceAll(/\{programVersion\}/g, '');
        }
        // replace `{checkDataPHPJSON}`
        reportTemplate = reportTemplate.replaceAll(/\{checkDataPHPJSONFile\}/g, path.basename(this.#checkDataPHPJSON));
        reportTemplate = reportTemplate.replaceAll(/\{checkDataPHPJSONString\}/g, 
            this.#escapeJSONForVar(
                JSON.stringify(JSON.parse(
                    fs.readFileSync(this.#checkDataPHPJSON).toString()
                ))
            )
        );

        fs.writeFileSync(this.reportFilePath, reportTemplate);
        return fs.existsSync(this.reportFilePath);
    }// generate


}// ReportGenerator
