/*

1) compress files; creates the "app.min.js.gz" file;
2) copy the js bundles from _build/temp to _build and add timestamp (only if changed);
3) copy the remaining files in _build/temp (fonts, images, etc)
4) clean the _build/temp directory

Grunt should be called from the root directory of the project:

    grunt --base ./ --gruntfile plugins/dashboard/grunt.config.js  (default task will call both "app" and "lib")

*/

var Path = require("path");
var TimeGrunt = require('time-grunt');
var LoadTasks = require('load-grunt-tasks');

var rootDir = Path.join(__dirname, "../..");
var appDir = Path.join(rootDir, "plugins/dashboard/app");

module.exports = function(grunt) {

    TimeGrunt(grunt);
    LoadTasks(grunt);

    grunt.config.set("compress", {
        options: {
            mode: "gzip",
            pretty: true,

        },
        app: {
            src: Path.join(appDir, "_build/temp/app.min.js"),
            dest: Path.join(appDir, "_build/temp/app.min.js.gz"),
        },
        lib: {
            src: Path.join(appDir, "_build/temp/lib.min.js"),
            dest: Path.join(appDir, "_build/temp/lib.min.js.gz"),
        },
    });


    grunt.config.set("static_timestamp", {
        options: {
        },

        app: {
            files: [{
                src: Path.join(appDir, "_build/temp/app*"),
                dest: Path.join(appDir, "_build"),
                filter: "isFile"
            }]
        },

        lib: {
            files: [{
                src: Path.join(appDir, "_build/temp/lib*"),
                dest: Path.join(appDir, "_build"),
                filter: "isFile"
            }]
        },

    });


    // copy the temporary build files (except for the 2 js bundles)
    grunt.config.set("copy", {
        options: {
            // task-specific options go here.
        },
        build: {
            cwd: Path.join(appDir, "_build/temp"),
            src: ["*", "!app*js*", "!lib*js*"],
            dest: Path.join(appDir, "_build/"),

            expand: true,
            timestamp: true,
            mode: true
        },
    });


    // delete the temporary build files
    grunt.config.set("clean", {
        options: {
            // task-specific options go here.
        },
        build: {
            src: Path.join(appDir, "_build/temp/*")
        },
    });


    grunt.registerTask("app", [
        "compress:app",
        "static_timestamp:app"
    ]);

    grunt.registerTask("lib", [
        "compress:lib",
        "static_timestamp:lib"
    ]);

    grunt.registerTask("default", ["app", "lib", "copy:build", "clean:build"]);

};

