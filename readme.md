# WordPress development CLI

A tool that help you development your plugins or themes.

### Features
* Build your assets (such as CSS, JS) by copy from Node packages to your desired folders.
* Watch your files changed and apply to destination folders.
* You can add your JS to minify, bundle CSS, JS files.
* Pack your files to zip that is ready to publish.
* Synchronize files to your installed WordPress folder on local machine.
* Update version numbers on your files from Node packages.

For main commands, please continue reading on [this page](readmes/main-wpdev-tasks-readme.md).

#### For `requires-at-least` command
* Collect WordPress core files and build data of constants, functions, classes, hooks including their versions to a JSON file.
* Check your plugin or theme against WordPress core data that was collected to get versions requirement. Generate HTML report for minimum and maximum versions requirement.

Run command `node wpdev.js requires-at-least --help` to see more help message.

## Installation
* Clone or download this repository into your computer.
* Set OS environment to be able to access command `node wpdev.js` easily. For example on Windows:
  * Create file **wpdev.bat**
  * Add code below.
  ```
  @ECHO OFF
  :: for Node wpdev.js v2.
  
  setlocal
  call :setESC
  
  :: use `cd` command to help working with `--version` option but it is not necessary.
  ::cd "D:\my-path\wpdev"
  call node "D:\my-path\wpdev\wpdev.js" %*
  
  :: esc for color text & background. ===============================================================================================
  :setESC
  for /F "tokens=1,2 delims=#" %%a in ('"prompt #$H#$E# & echo on & for %%b in (1) do rem"') do (
    set ESC=%%b
    exit /B 0
  )
  exit /B 0
  :: end color text & background. ===================================================================================================
  ```
  * If **wpdev.bat** is in environment path then you can call `wpdev` instead of `node wpdev.js`.

### Install in your WordPress project
To use this command full functional in your WordPress plugins or themes, you need to install into your project.

* Create file **node_tasks/config/config.json** in your root folder of the project. If you are working on plugin "plugin-name" where contain plugin file "plugin-name/plugin-name.php" then create this file in "plugin-name/node_tasks/config/config.json".
* Copy contents in **config-example.json** from this repository and paste into your **node_tasks/config/config.json**.
* Start modify. You can read more about this in [**readmes/main-wpdev-tasks-readme.md**](./readmes/main-wpdev-tasks-readme.md).
