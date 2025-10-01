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