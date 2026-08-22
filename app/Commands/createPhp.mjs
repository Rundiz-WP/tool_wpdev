/**
 * yargs command: createPhp.
 * 
 * Tasks for this command:
 * 1. Create PHP OOP file.
 * 
 * @since 0.1.5
 */


'use strict';


// import libraries.
import TextStyles from "../Libraries/TextStyles.mjs";
// import tasks for this command.
import { createPHP } from "./Tasks/CreatePHP/CreatePHP.mjs";


export const command = ['createPHP <oop>', 'createPhp <oop>'];
export const describe = 'Create PHP OOP file such as class, interface, trait, enum.';
export const builder = (yargs) => {
    return yargs
    .positional('oop', {
        describe: 'The PHP OOP type to create.',
        choices: ['class', 'interface', 'trait', 'enum'],
        type: 'string',
    })
    .options({
        path: {
            demandOption: true,
            describe: 'Path to the PHP file(s) to create. Can be relative from CWD or absolute from project\'s root folder. ' + 
                'The absolute path should start with back slash (\\) and start from project\'s root folder. ' +
                'It supports WordPress plugin or theme project.',
            type: 'array',
        },
        yes: {
            alias: 'y',
            demandOption: false,
            describe: 'Skip the resolved path confirmation prompt.',
            type: 'boolean',
        },
    })
    .example('$0 createPHP class --path="Relative/Path"')
    .example('$0 createPHP class --path="Relative\\Path"')
    .example('$0 createPHP class --path="Relative/Path" "\\MyPlugin\\Absolute\\Path"')
    .example('$0 createPHP class --path="Relative/Path" "\\MyPlugin/Absolute/Path"')
    .example('$0 createPHP class --path="Relative/Path" --yes')
    .example('$0 createPHP trait --path="Traits/MyTrait"')
    ;// end .options;
};
export const handler = async (argv) => {
    console.log(TextStyles.programHeader());
    console.log(TextStyles.commandHeader(' Command: ' + argv._ + ' '));

    // 1. Create PHP OOP file.
    await createPHP.init(argv);
};