/**
 * Main entry of all commands.
 */


'use strict';


import * as synccmd from './sync.mjs';
import * as buildcmd from './build.mjs';
import * as watchcmd from './watch.mjs';
import * as writeVersions from './writeVersions.mjs';
import * as packcmd from './pack.mjs';
import * as exprcmd from './expr.mjs';


export const commands = [
    synccmd,
    buildcmd,
    watchcmd,
    writeVersions,
    packcmd,
    exprcmd,
];