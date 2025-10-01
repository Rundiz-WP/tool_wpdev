/**
 * yargs command: sync.
 * 
 * Tasks for this command:
 * 1. Copy the repository (plugin or theme - for example) to WordPress installation folder (wp-content/plugins/plugin_name).
 */


'use strict';


// import libraries.
import TasksRunnerChecker from "../Libraries/TasksRunnerChecker.mjs";
import TextStyles from "../Libraries/TextStyles.mjs";
// import tasks.
import { deleter } from "./Tasks/Sync/deleter.mjs";
import { copyWP } from "./Tasks/Sync/copyWP.mjs";


export const command = 'sync [options]';
export const describe = 'Synchronize plugin or theme to destination only if not exists on destination or more updated.';
export const builder = (yargs) => {
    return yargs.options({
        'destination': {
            alias: 'd',
            demandOption: true,
            describe: 'The full path to plugin or theme folder in the WordPress installation. For example: \"/var/www/html/wp-content/themes/mytheme\". This option is required if you want to copy your working project to test in WordPress installation folder.',
            type: 'string',
        },
        'wpdir': {
            demandOption: false,
            describe: 'If current working directory is not WordPress plugin or theme, you need to specify this argument as working directory. This working directory must contains correct "node_tasks" folder for this task runner in it.',
            type: 'string',
        },
        'preview': {
            demandOption: false,
            describe: 'Preview changes (delete, copy) without doing it.',
            type: 'boolean',
        },
    })
    .example('$0 sync --destination="/var/www/html/wp-content/plugins/myplugin"')
    .example('$0 sync --destination="/var/www/html/wp-content/plugins/myplugin" --wpdir="/var/www/mygit/myplugin"')
    .example('$0 sync --destination="/var/www/html/wp-content/plugins/myplugin" --wpdir="/var/www/mygit/mytheme" --preview')
    ;
};
export const handler = async (argv) => {
    console.log(TextStyles.programHeader());
    console.log(TextStyles.commandHeader(' Command: ' + argv._ + ' '));

    // always check current working directory with tasks runner checker.
    TasksRunnerChecker.check(argv);
    // 1. Copy the repository (plugin or theme - for example) to WordPress installation folder.
    await deleter.WPdestination(argv);// delete before copy.
    await copyWP.init(argv);

    console.log(TextStyles.txtSuccess(TextStyles.taskHeader('End command.')));
};