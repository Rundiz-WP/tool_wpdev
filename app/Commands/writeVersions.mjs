/**
 * yargs command: writeVersions.
 * 
 * Tasks for this command:
 * 1. Write down all Node packages version to plugin or theme asset data file.
 */


'use strict';


// import libraries.
import TasksRunnerChecker from "../Libraries/TasksRunnerChecker.mjs";
import TextStyles from "../Libraries/TextStyles.mjs";
// import tasks for this command.
import { versionWriter } from './Tasks/VersionWriter/versionWriter.mjs';


export const command = 'writeVersions [options]';
export const describe = 'Write all Node packages version that matched into plugin or theme asset data file.';
export const builder = (yargs) => {
    return yargs.options({
        'wpdir': {
            demandOption: false,
            describe: 'If current working directory is not WordPress plugin or theme, you need to specify this argument as working directory. This working directory must contains correct "node_tasks" folder for this task runner in it.',
            type: 'string',
        },
        'destination': {
            alias: 'd',
            demandOption: false,
            describe: 'The full path to plugin or theme folder in the WordPress installation. For example: \"/var/www/html/wp-content/themes/mytheme\". This option is required if you want to copy your working project to test in WordPress installation folder.',
            type: 'string',
        },
        'preview': {
            demandOption: false,
            describe: 'Preview changes (version info) without writing anything.',
            type: 'boolean',
        },
    })
    .example('$0 writeVersions --wpdir="/var/www/mygit/myplugin"')
    .example('$0 writeVersions --wpdir="/var/www/mygit/myplugin" --preview')
    .example('$0 writeVersions --wpdir="/var/www/mygit/myplugin" --destination="/var/www/html/wp-content/plugins/myplugin"')
    ;// end .options;
};
export const handler = async (argv) => {
    console.log(TextStyles.programHeader());
    console.log(TextStyles.commandHeader(' Command: ' + argv._ + ' '));

    // always check current working directory with tasks runner checker.
    TasksRunnerChecker.check(argv);
    // 1. write down versions info to file.
    await versionWriter.init(argv);
};