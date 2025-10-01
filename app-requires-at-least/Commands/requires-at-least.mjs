/**
 * Main command `requires-at-least`.
 */


'use strict';


import * as collect from './Requires-at-least/collect.mjs';
import * as check from './Requires-at-least/check.mjs';


export const command = 'requires-at-least <sub command>';
export const describe = 'Build and check WordPres requires at least version.';
export const builder = (yargs) => {
    return yargs.command([
        collect,
        check,
    ])
    .demandCommand(1, 'Requires sub command.')
    ;
};

export const handler = (argv) => {
};