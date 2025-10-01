/**
 * Rundiz WordPress development tools.
 */


import { cwd } from 'node:process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
// yargs. -------------------------------------
import yargs from 'yargs/yargs';
import {hideBin} from 'yargs/helpers';
const yargv = yargs(hideBin(process.argv));
// yargs. -------------------------------------
// import main entry of all commands.
import {commands} from './app/Commands/index.mjs';
import {requiresAtleastCommands} from './app-requires-at-least/Commands/index.mjs';


// define full path to folder where this .js file is located.
const __filename = fileURLToPath(import.meta.url);
// define full path to this tasks runner folder.
global.NODETASKS_DIR = path.dirname(__filename);
// define current working directory.
global.CW_DIR = cwd();
// define current command is watching or not.
global.ISWATCH = false;


yargv
.command(commands)
// can add additional command `.command(otherCmds)`.
.command(requiresAtleastCommands)
.demandCommand()
.help()
.argv
;