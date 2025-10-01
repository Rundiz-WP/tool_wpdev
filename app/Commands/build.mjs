/**
 * yargs command: build.
 * 
 * Tasks for this command:
 * 1. Clean destination folders.
 * 2. Copy files from sources to destinations. This is not copy to WordPress plugin (wp-content/plugins/plugin_name) folder. Usually it is for copy from assets source or node_modules folder to destination such as assets folder for public.
 * 3. Custom tasks.
 * 4. Copy the repository (plugin or theme - for example) to WordPress installation folder (wp-content/plugins/plugin_name).
 */


'use strict';


// import libraries.
import TasksRunnerChecker from "../Libraries/TasksRunnerChecker.mjs";
import TextStyles from "../Libraries/TextStyles.mjs";
// import tasks.
import { clean } from "./Tasks/Build/clean.mjs";
import { copy } from "./Tasks/Build/copy.mjs";
import { customTasks } from "./Tasks/Build/customTasks.mjs";
import { copyWP } from "./Tasks/Build/copyWP.mjs";


export const command = 'build [options]';
export const describe = 'Build assets from source to distribute folder and maybe copy to WordPress installation folder.';
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
            describe: 'Preview changes (delete, copy) without doing it.',
            type: 'boolean',
        },
    })
    .example('$0 build')
    .example('$0 build --wpdir="/var/www/mygit/myplugin"')
    .example('$0 build --wpdir="/var/www/mygit/mytheme" --preview')
    .example('$0 build --wpdir="/var/www/mygit/myplugin" --destination="/var/www/html/wp-content/plugins/myplugin"')
    ;
};
export const handler = async (argv) => {
    console.log(TextStyles.programHeader());
    console.log(TextStyles.commandHeader(' Command: ' + argv._ + ' '));

    // always check current working directory with tasks runner checker.
    TasksRunnerChecker.check(argv);
    // 1. clean destinations.
    await clean.init(argv);
    // 2. copy files from sources to destinations.
    await copy.init(argv);
    // 3. custom tasks.
    await customTasks.init(argv);
    // 4. copy repo to WP installation folder.
    await clean.WPdestination(argv);// cleanup before copy.
    await copyWP.init(argv);

    console.log(TextStyles.txtSuccess(TextStyles.taskHeader('End command.')));
};