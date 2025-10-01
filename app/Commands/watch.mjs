/**
 * yargs command: watch.
 * 
 * Task for this command:
 * 1. Start normal watcher.
 * 2. Start watching on custom watches.
 */


'use strict';


// import libraries.
import TasksRunnerChecker from "../Libraries/TasksRunnerChecker.mjs";
import TextStyles from "../Libraries/TextStyles.mjs";
// import tasks.
import { watcher } from "./Tasks/Watch/watcher.mjs";
import { customWatches } from "./Tasks/Watch/customWatches.mjs";


export const command = 'watch [options]';
export const describe = 'Watch asset files such as CSS, JS, changed and apply to destination.';
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
            describe: 'The full path to plugin or theme folder in the WordPress installation. For example: \"/var/www/html/wp-content/themes/mytheme\". This option is required if you want the watcher task to copy your working project to test in WordPress installation folder.',
            type: 'array',
        },
    })
    .example('$0 watch --wpdir="/var/www/mygit/myplugin"')
    .example('$0 watch --wpdir="/var/www/mygit/myplugin" --destination="/var/www/html/wp-content/plugins/myplugin"')
    .example('$0 watch --wpdir="/var/www/mygit/myplugin" --destination="/var/www/html/wp-content/plugins/myplugin" "/var/www/html/site2/wp-content/plugins/myplugin"')
    ;// end .options;
};
export const handler = async (argv) => {
    console.log(TextStyles.programHeader());
    console.log(TextStyles.commandHeader(' Command: ' + argv._ + ' '));

    // always check current working directory with tasks runner checker.
    TasksRunnerChecker.check(argv);

    global.ISWATCH = true;

    // 1. Start normal watcher.
    await watcher.init(argv);
    // 2. Start watching on custom watches.
    const customWatchObj = new customWatches(argv);
    customWatchObj.watch();
};