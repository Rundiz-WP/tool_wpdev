/**
 * yargs command: `requires-at-least build`.
 * 
 * Collect WordPress core `@since` version numbers 
 * from constants, functions, classes (include class's constant, properties, methods), hooks 
 * and save to JSON file.
 */


'use strict';


// import libraries
import TextStyles from "../../../app/Libraries/TextStyles.mjs";
// import tasks
import { checker } from './Tasks/Collect/checker.mjs';
import { collectCoreCodePHP } from './Tasks/Collect/collectCoreCodePHP.mjs';


export const command = 'collect [options]';
export const describe = 'Collect WordPress core `@since` version number from constants, functions, classes (include class\'s constant, properties, methods), hooks and save to JSON file. This process can be very slow, please be patient.';
export const builder = (yargs) => {
    return yargs.options({
        'wpdir': {
            demandOption: false,
            describe: 'If current working directory is not WordPress installed folder, you need to specify it with this option. The WordPress installed folder must contain wp-admin, wp-includes.',
            type: 'string',
        },
        'wpfile': {
            demandOption: false,
            describe: 'For collect data from a single file. Cannot use with `--wpdir` option.',
            type: 'string',
        },
        'savedir': {
            demandOption: false,
            describe: 'Save collected & processed data file location. Default is on current working directory or same location with `--wpdir` or `--wpfile`.',
            type: 'string',
        },
        'debug': {
            demandOption: false,
            describe: 'Set debug to write parsed code to files in debug folder. The debug folder is same location with `--savedir`.',
            type: 'boolean',
        },
    })
    .example('collect')
    .example('collect --wpdir="/var/www/wordpress"')
    .example('collect --wpdir="/var/www/wordpress" --debug')
    .example('collect --wpfile="/var/www/wordpress/wp-admin/admin-ajax.php"')
    .example('collect --savedir="/home/user/documents"')
    ;
};

export const handler = async (argv) => {
    console.log(TextStyles.programHeader());
    console.log(TextStyles.commandHeader(' Command: ' + argv._ + ' '));

    const checkerObj = new checker(argv);
    const workingDir = await checkerObj.check();
    const saveDir = checkerObj.saveDir;
    const debugDirName = checkerObj.debugDirName;
    const wordpressVersion = checkerObj.getWPVersion(workingDir);

    const collectCoreCodePHPObj = new collectCoreCodePHP(argv, {
        'debugDirName': debugDirName,
        'saveDir': saveDir,
        'wordpressVersion': wordpressVersion,
        'workingDir': workingDir,
    });
    collectCoreCodePHPObj.init();

    console.log(TextStyles.txtSuccess(TextStyles.taskHeader('End command.')));
};