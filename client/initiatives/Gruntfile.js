/*

All the tasks should have 2 targets: "app" and "lib"

There are 2 custom tasks at the end: "app" and "lib". These tasks simply call the needed tasks using the corresponding target.

The "app" target is composed of the following tasks:

1) clean _build/temp
2) extract static files from the html ("<script src='...'>")
3) pre-compile nunjucks templates; creates the _build/temp/nunjucks-templates.js file;
4) concat assets extracted from step 2 (which are the application files + the nunjucks templates, since the templates are included in the html); creates the "app.js" file;
5) uglify the concatenated file; creates the "app.min.js" file;
6) compress uglified file; creates the "app.min.js.gz" file;
7) copy from _build/temp to _build and add timestamp (only if changed);

The "lib" target is similar, but there is no nunjucks pre-compilation.

Grunt should be called from the root directory of the project:

    grunt --base ./ --gruntfile client/initiatives/Gruntfile.js  app

    grunt --base ./ --gruntfile client/initiatives/Gruntfile.js  lib

    grunt --base ./ --gruntfile client/initiatives/Gruntfile.js  (default task will call both "app" and "lib")

*/

var Path = require("path");
var Fs = require("fs");
var TimeGrunt = require('time-grunt');
var LoadTasks = require('load-grunt-tasks');
var Cheerio = require('cheerio');

module.exports = function(grunt) {

    TimeGrunt(grunt);
    LoadTasks(grunt);

    // TODO: allow the html to have more that 1 block of delimiters
    grunt.config.set("static_extract", {
        app: {
            options: {
                delimiterStart: "{# grunt-extract-assets-app #}", 
                delimiterEnd: "{# /grunt-extract-assets-app #}",
                tagName: "script",
                postProcess: function(relativePath){

                    relativePath = relativePath.split("/").slice(2).join("/");
                    var absPath = Path.join(__dirname, "app", relativePath);

                    return absPath;
                }
            },
            src: Path.join(__dirname, "templates/initiatives.html")
        },

        lib: {
            options: {
                delimiterStart: "{# grunt-extract-assets-lib #}", 
                delimiterEnd: "{# /grunt-extract-assets-lib #}",
                tagName: "script",
                postProcess: function(relativePath){

                    relativePath = relativePath.split("/").slice(2).join("/");
                    var absPath = Path.join(__dirname, "../../public", relativePath);

                    return absPath;
                }
            },
            src: Path.join(__dirname, "templates/initiatives.html")
        },

    });

    grunt.registerMultiTask('static_extract', 'Extract static assets from an html or template file', function() {

        //console.log("this: ", JSON.stringify(this, null, 4));
        //console.log("this.files: ", JSON.stringify(this.files, null, 4));

        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            delimiterStart: "<!-- grunt-extract-assets -->", 
            delimiterEnd: "<!-- /grunt-extract-assets -->",
            tagName: "script"
        });

        var assets = [];

        this.files.forEach(function(file) {

            if(file.src.length===0){
                grunt.log.warn('No source files found');
                return;
            }

            file.src.forEach(function(path, i) {

                if (!grunt.file.exists(path)) {
                    grunt.log.warn('Source file "' + path + '" not found.');
                    return;
                }

                var extracted = extractAssets(path)
                            .map(options.postProcess);

                assets = assets.concat(extracted);
            });
        });

        var assetsProp = [this.name, this.target, "assets"].join(".");
        grunt.config.set(assetsProp, assets);

        if(assets.length>0){
            grunt.log.writeln("Extracted the following assets:");
            grunt.log.writeln(grunt.log.wordlist(assets, { separator: "\n"}));
        }


        function extractAssets(path){

            var html = Fs.readFileSync(path, "utf8");
            var indexStart = html.indexOf(options.delimiterStart);
            var indexEnd   = html.indexOf(options.delimiterEnd);

            if(indexStart===-1){
                grunt.fail.fatal('Could not find the "' + options.delimiterStart + '" in the html file: ' + path);
            }
            if(indexEnd===-1){
                grunt.fail.fatal('Could not find the "' + options.delimiterEnd + '" in the html file: ' + path);
            }

            var lines = html
                        .substring(indexStart + options.delimiterStart.length, indexEnd)
                        .split("\n")
                        .filter(function(line){

                            return line.trim().indexOf("<" + options.tagName)===0;
                        })
                        .map(function(line){

                            // line should now be something like this:
                            // '<script src="/initiatives-app/menu/menu.js"></script>'

                            var $ = Cheerio.load(line);
                            var relativePath = "";
                            if(options.tagName==="script"){
                                relativePath = $(options.tagName).attr("src");
                            }
                            else if(options.tagName==="link"){
                                relativePath = $(options.tagName).attr("href");
                            }
                            else{
                                grunt.fail.fatal('tagName "' + options.tagName + '"is invalid (should be either "script" or "link")');
                            }

                            relativePath = relativePath || "";

                            // console.log("line: ", line);
                            // console.log("relativePath: ", relativePath);

                            return relativePath;
                        })
                        .filter(Boolean)                
            
            return lines;
        }
    });


    grunt.config.set("clean", {
        options: {
            // task-specific options go here.
        },
        app: {
            src: Path.join(__dirname, "app/_build/temp/app.*"),
        },
        lib: {
            src: Path.join(__dirname, "app/_build/temp/lib.*"),
        }
    });
   

    grunt.config.set("nunjucks", {
        options: {
            autoescape: true
        },
        app: {
            baseDir: Path.join(__dirname, "app"),
            src: Path.join(__dirname, "app/**/*.html"),
            dest: Path.join(__dirname, "app/_build/temp/nunjucks-templates.js"),
        }
    });


    grunt.config.set("concat", {
        options: {
            separator: grunt.util.linefeed + ';' + grunt.util.linefeed + '// concat new file ' + grunt.util.linefeed,
   
        },
        app: {
            //src: internals.input.app.js,
            src: "<%= static_extract.app.assets %>",
            dest: Path.join(__dirname, "app/_build/temp/app.js"),
            nonull: true,
        },
        lib: {
            //src: internals.input.lib.js,
            src: "<%= static_extract.lib.assets %>",
            dest: Path.join(__dirname, "app/_build/temp/lib.js"),
            nonull: true,
        }
    });


    grunt.config.set("uglify", {
        options: {
            mangle: false
        },
        app: {
            src: Path.join(__dirname, "app/_build/temp/app.js"),
            dest: Path.join(__dirname, "app/_build/temp/app.min.js"),
        },
        lib: {
            src: Path.join(__dirname, "app/_build/temp/lib.js"),
            dest: Path.join(__dirname, "app/_build/temp/lib.min.js"),
        }
    });


    grunt.config.set("compress", {
        options: {
            mode: "gzip",
            pretty: true,

        },
        app: {
            src: Path.join(__dirname, "app/_build/temp/app.min.js"),
            dest: Path.join(__dirname, "app/_build/temp/app.min.js.gz"),
        },
        lib: {
            src: Path.join(__dirname, "app/_build/temp/lib.min.js"),
            dest: Path.join(__dirname, "app/_build/temp/lib.min.js.gz"),
        },
    });


    grunt.config.set("static_timestamp", {
        options: {
        },

        app: {
            files: [{
                src: Path.join(__dirname, "app/_build/temp/app*"),
                dest: Path.join(__dirname, "app/_build"),
                filter: "isFile"
            }]
        },

        lib: {
            files: [{
                src: Path.join(__dirname, "app/_build/temp/lib*"),
                dest: Path.join(__dirname, "app/_build"),
                filter: "isFile"
            }]
        },

    });


    grunt.config.set("dummy_task", {
        app: {
            src: "<%= static_extract.app.assets %>"
        },
        lib: {
            src: "<%= static_extract.lib.assets %>"
        }
    });

    grunt.registerMultiTask('dummy_task', 'dummy task, used only for debugging', function() {

        console.log("this: ", JSON.stringify(this, null, 4));
    });

    grunt.registerTask("app", [
        "clean:app",
        "static_extract:app",
        "nunjucks:app",
        /*"dummy_task:app",*/
        "concat:app",
        "uglify:app",
        "compress:app",
        "static_timestamp:app"
    ]);

    grunt.registerTask("lib", [
        "clean:lib",
        "static_extract:lib",
        /*"dummy_task:lib",*/
        "concat:lib",
        "uglify:lib",
        "compress:lib",
        "static_timestamp:lib"
    ]);

    grunt.registerTask("default", ["app", "lib"]);

};

