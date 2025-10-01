/**
 * yargs command: `requires-at-least check`.
 * 
 * Retrieve code call (eg, constants, functions, classes, hooks) from user's plugin or theme
 * and check agains WordPress core code `@since` data that was collected by the `collect` sub command.
 * 
 * After finished, save the report to a file.
 */


'use strict';


// import libraries
import TextStyles from "../../../app/Libraries/TextStyles.mjs";
// import tasks
import { checker } from "./Tasks/Check/checker.mjs";
import { checkRepoPHP } from "./Tasks/Check/checkRepoPHP.mjs";


export const command = 'check [options]';
export const describe = 'Check your plugin or theme against WordPress core code `@since` data.';
export const builder = (yargs) => {
    return yargs.options({
        'dir': {
            demandOption: false,
            describe: 'If current working directory is not your plugin or theme folder, you need to specify it with this option.',
            type: 'string',
        },
        'wp-core-data-php': {
            alias: ['wpphp'],
            describe: 'If current working directory does not contain a file ".requires-at-least_core-data-php*.json", you need to specify its path with this option.',
            type: 'string',
        },
        'exclude-pattern': {
            demandOption: false,
            describe: 'Node file system glob exclude pattern. Default is undefined. (see https://nodejs.org/docs/latest/api/fs.html#fsglobsyncpattern-options).',
            type: 'array',
        },
        'savedir': {
            demandOption: false,
            describe: 'Save report file location. Default is on current working directory or same location with `--dir`.',
            type: 'string',
        },
        'debug': {
            demandOption: false,
            describe: 'Set debug to write parsed code to files in debug folder. The debug folder is same location with `--savedir`.',
            type: 'boolean',
        },
    })
    .example('$0 build')
    .example('$0 build --dir="/home/user/my-wordpress-plugin"')
    .example('$0 build --dir="/home/user/my-wordpress-plugin" --debug')
    .example('$0 build --wp-core-data-php="/home/user/documents/wordpress-src-versions/.my-core-data-php.json"')
    .example('$0 build --savedir="/home/user/documents"')
    .example('$0 build --exclude-pattern="vendor/**" "tests/**"')
    ;
};

export const handler = async (argv) => {
    console.log(TextStyles.programHeader());
    console.log(TextStyles.commandHeader(' Command: ' + argv._ + ' '));

    const checkerObj = new checker(argv);
    const workingDir = await checkerObj.check();
    const phpCoreCodesFile = checkerObj.phpCoreCodesFile;
    const WPCoreDataPHP = checkerObj.WPCoreDataPHP;
    const saveDir = checkerObj.saveDir;
    const debugDirName = checkerObj.debugDirName;

    const checkRepoPHPObj = new checkRepoPHP(argv, {
        'debugDirName': debugDirName,
        'phpCoreCodesFile': phpCoreCodesFile,
        'saveDir': saveDir,
        'workingDir': workingDir,
        'WPCoreDataPHP': WPCoreDataPHP,
    });
    checkRepoPHPObj.init();

    console.log(TextStyles.txtSuccess(TextStyles.taskHeader('End command.')));
};