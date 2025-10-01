/**
 * yargs command: pack.
 * 
 * Tasks for this command:
 * 1. Delete **.dist** folder if exists.
 * 2. Pack files and folders into zip and save in **.dist** folder.
 */


'use strict';


// import libraries.
import TasksRunnerChecker from "../Libraries/TasksRunnerChecker.mjs";
import TextStyles from "../Libraries/TextStyles.mjs";
// import tasks.
import { clean } from "./Tasks/Pack/clean.mjs";
import { pack } from "./Tasks/Pack/pack.mjs";


export const command = 'pack [options]';
export const describe = 'Pack files and folders of current working directory into zip file for development backup, or production publishing. The files and folders to pack is based on config.json in current working folder. If this config.json file is not exists the default config will be used.';
export const builder = (yargs) => {
    return yargs.options({
        'wpdir': {
            demandOption: false,
            describe: 'If current working directory is not WordPress plugin or theme, you need to specify this argument as working directory. This working directory should contains correct "node_tasks" folder for this task runner in it.',
            type: 'string',
        },
        'preview': {
            demandOption: false,
            describe: 'Preview changes (delete, copy) without doing it.',
            type: 'boolean',
        },
        'packtype': {
            // @link https://github.com/yargs/yargs/issues/686#issuecomment-1173447456 How to enter multiple values.
            choices: ['dev', 'prod'],
            demandOption: true,
            describe: 'Package type. For development backup use "dev", for production use "prod".',
            type: 'array',
        },
    })
    .example('$0 pack --wpdir="/var/www/mygit/myplugin" --packtype="dev"')
    .example('$0 pack --wpdir="/var/www/mygit/myplugin" --packtype="dev" --preview')
    .example('$0 pack --wpdir="/var/www/mygit/myplugin" --packtype="dev" "prod"');
};
export const handler = async (argv) => {
    console.log(TextStyles.programHeader());
    console.log(TextStyles.commandHeader(' Command: ' + argv._ + ' '));

    // check current working directory contain tasks runner configuration. if not exists we will use default config.
    TasksRunnerChecker.check(argv, {
        'isRequired': false,
    });
    // 1. Delete **.dist** folder if exists.
    await clean.init(argv);
    // 2. Pack files and folders into zip and save in **.dist** folder.
    await pack.init(argv);
};