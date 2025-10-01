# WordPress development CLI tasks.
This document is for commands: `sync`, `build`, `watch`, `writeVersions`, `pack`.

The **config.json** file is for `node wpdev.js` commands above. The file **config.json** must be in WordPress plugin or theme root folder and inside **node_tasks/config** folder. For example: you have plugin folder name **hello**, your **config.json** must be in **hello/node_tasks/config/config.json**.

## Required properties.
```
{
    "moduleName": "Rundiz YouTube Embedded",
    "wpDev": true,
}
```

The `moduleName` is for specific that what is this module for. It can be plugin or theme.  
The `wpDev` to tell the program (CLI) that this config file is for **wpdev.js** app.

### Command `build`, `sync`
#### Task `clean`
```
    "build": {
        "clean": {
            "destinations": [
                {
                    "patterns": [
                        "assets/css/**"
                    ],
                    "options": {
                    }
                },
                {
                    "patterns": [
                        "assets/js/**"
                    ],
                    "options": {
                    }
                }
            ]
        }
    }
```
This task will be clean destinations by delete everything based on patterns. Work in `build` command only.

The `patterns` property is for use with Glob patterns.  
The `options` property is for use with [`deleteAsync`](https://www.npmjs.com/package/del) options.

#### Task `copy`
```
    "build": {
        "copy": {
            "copyTasks": [
                {
                    "patterns": "assets-src/js/file.js",
                    "rename": "newfilename.js",
                    "destination": "assets/js",
                    "_comment": "the assets-src/js/file.js will be renamed to assets/js/newfilename.js"
                },
                {
                    "patterns": "node_modules/@fortawesome/fontawesome-free/css/**",
                    "destination": "assets/fontawesome/css",
                    "_comment": "all FontAwesome CSS files and folders will be copied to assets/fontawesome/css folder."
                }
            ]
        }
    }
```
This task will be copy files and folders to destination and maybe rename selected file. For example copy files from **node_modules** folder to **assets** as destination folder. Work in `build` command only.

The `patterns` property is for use with Glob patterns.  
The `destination` property is for copy as destination folder name.  
The `rename` property is _optional_ and use for rename single file.

##### Task `copyWP`
```
    "build": {
        "copy": {
            "copyWP": [
                {
                    "patterns": "assets/js/store/file.js",
                    "rename": "newfilename.js",
                    "destination": "assets/js/store",
                    "_comment": "the assets/js/store/file.js will be copied and renamed to `--destination`/assets/js/store/newfilename.js"
                },
                {
                    "patterns": "assets/fontawesome/css/**",
                    "destination": "assets/fontawesome/css",
                    "_comment": "all FontAwesome CSS files and folders will be copied to `--destination`/assets/fontawesome/css folder."
                }
            ]
        }
    }
```
This task will be copy the repository files (plugin or theme) to WordPress installation folder. It required command line argument `--destination` to work. Work in `build`, `sync` commands.

The properties are the same as sub properties of `copyTasks`.

#### Task `customTasks`
```
    "build": {
        "customTasks": [
            "my-bundle-js-tasks.js",
            "file-refer-from-config-folder.ext"
        ]
    }
```
This task is for custom tasks such as bundle, minified files. Work in `build` command only.

The `customTasks` property must be array and each value is JavaScript file to run in sequence.  
The files in the array value will be refer from **node_tasks/config** folder.

### Command `watch`
#### Task `customWatches`
 ```
    "watch": {
        "customWatches": [
            "watchJS.mjs",
            "file-refer-from-config-folder.ext"
        ]
    }
```
This task is for custom tasks such as bundle, minified files while in development. Once those files in your project changed it will be trigger with `watch` command and this task will be running.

The `customWatches` property must be array and each value is JavaScript file to run in sequence.  
The files in the array value will be refer from **node_tasks/config** folder.

#### Task `watcher`
```
    "watch": {
        "watcher": [
            {
                "patterns": "assets/**",
                "destination": "assets",
                "_comment": "all files and folders will be copied to `--destination`/assets folder where `--destination` is required CLI option if you want to use watcher."
            }
        ]
    }
```
This task will be watch files changed based on patterns and then copy to WordPress installation folder. It required command line argument `--destination` to work.

The `watcher` property value must be array and each array value is object contain properties `patterns`, `destination`.

The `patterns` property is for use with Glob pattern to search files and folders to watch.  
The `destination` property is destination folder where the files and folders will be copied to.

### Command `writeVersions`
```
    "writeVersions": [
        {
            "nodePackage": "ace-builds",
            "assetsDataPattern": [
                "rdyte\\-ace\\-editor\\-.+",
                "rdyte\\-ace\\-ext\\-.+"
            ],
            "assetsDataFile": "App/Controllers/Settings.php"
        }
    ]
```
Write all Node packages version that matched into plugin or theme asset data file.

The `writeVersions` property is _optional_.
If exists, the value must be array and each array value is property set that contain `nodePackage`, `assetsDataPattern`, `assetsDataFile` properties. All of these properties is required.

The `nodePackage` property is the Node package name that appears in **package.json** file.  
The `assetsDataPattern` property is array of handle name in WordPress plugin or theme. Its value is regular expression pattern.  
The `assetsDataFile` property is a PHP file that contain the handle names above.

### Command `pack`
#### Task `clean`
```
    "pack": {
        "packPatterns": {
            "dev": {
                "patterns": [
                    "**",
                    ".*/**",
                    ".*"
                ],
                "options": {
                    "ignore": [
                        ".dist",
                        ".git",
                        "node_modules"
                    ]
                }
            },
            "prod": {
                "patterns": [
                    "**"
                ],
                "options": {
                    "ignore": [
                        ".*",
                        ".dist",
                        ".git",
                        "node_modules",
                        "node_tasks"
                    ]
                }
            }
        }
    }
```
This task will clean **.dist** folder. The `packPatterns` property and `dev`, or `prod` sub properties is required in order to make clean task work.  

The `patterns` property is for use with Glob patterns for search files and folders to pack in zip.  
The `options` property is for use with [globby](https://www.npmjs.com/package/globby) options.

#### Task `pack`
```
    "pack": {
        "versionHeaderFile": "readme.txt",
        "versionPattern": "Stable tag(\\s?)(:?)(\\s?)(?<version>[\\d\\.]+)",// must contain `?<version>` tag in the pattern.
        "packPatterns": {
            // see more in pack command and clean task above.
        },
        "zipFilePrefix": "myplugin",
        "zipOptions": {
            "zipPrefix": "myplugin"// it will be zip files and folder inside myplugin/.
        }
    }
```
This task will create **.dist** folder and pack files and folders into zip and save in that folder.

The `versionHeaderFile` property is for a file that contain version pattern in the head.  
The `versionPattern` property is for regular expression where version tag of this plugin or theme is. It must contain `?<version>` tag in the pattern. Example: `(?<version>[\\d\\.]+)`.  
The `packPatterns`, described in **Command `pack`** > **Task `clean`**.  
The `zipFilePrefix` is zip file name prefix.  
The `zipOptions` and `zipPrefix` property is for folder name that will be contain plugin or theme files and folders in it. Example: `"zipPrefix": "myplugin"` will be contains **myplugin/myplugin-files.php** in it.

See [full example](../config-example.json).

---

### CLI
Run command `node wpdev.js --help` to see help message.