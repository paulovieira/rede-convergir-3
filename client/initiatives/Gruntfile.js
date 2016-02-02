/*
1) pre-compile nunjucks templates (will create a nunjucks-precompiled.js file)
2) concat (templates + all files included in the page)
3) uglify
4) compress
5) clean

*/
var Path = require("path");
//var Zlib = require('zlib');
var Fs = require("fs-extra");
var TimeGrunt = require('time-grunt');
var LoadTasks = require('load-grunt-tasks');
var _ = require("underscore");
var Cheerio = require('cheerio')
//var Fs = require("fs");

var internals = {};
internals.input = {
    app: {
        js: [Path.join(__dirname, "app/_build/temp/templates-dev.js")],
        css: []        
    },
    lib: {
        js: []
    }
};

module.exports = function(grunt) {

    TimeGrunt(grunt);
    LoadTasks(grunt);

    internals.grunt = grunt;
    internals.input.app.js = internals.input.app.js.concat(internals.findInputFiles("{# grunt-input-app-js #}", "{# /grunt-input-app-js #}", Path.join(__dirname, "templates/initiatives.html")));

    internals.input.lib.js = internals.findInputFiles("{# grunt-input-lib-js #}", "{# /grunt-input-lib-js #}", Path.join(__dirname, "templates/initiatives.html"));

    console.log("input files obtained from the html: \n", JSON.stringify(internals.input, null, 4))

    grunt.config.set("clean", {
        options: {
            // task-specific options go here.
        },
        app: {
            src: Path.join(__dirname, "app/_build/temp/*"),
        }
    });


    grunt.config.set("cachebuster", {
        options: {
            // task-specific options go here.
            complete: function(obj){

                var compare = [];

                // decompose the obj produced by the cachebuster task into two "disjoint"
                // objects (relative to the temp files and to the build files)
                var tempFiles = _.pick(obj, function(value, key){

                    return key.split("/").slice(0, -1).pop() === "temp";
                });

                var buildFiles = _.pick(obj, function(value, key){

                    return key.split("/").slice(0, -1).pop() === "_build";
                });

                // find the corresponding pairs for the temp files and build files
                // (it might happen that a there is no build file already for a given temp file)
                for(var tempFile in tempFiles){

                    var pair = {};
                    pair[tempFile] = tempFiles[tempFile];
                    var tempFileBase = Path.parse(tempFile).name;

                    for(var buildFile in buildFiles){

                        var buildFileBase = Path.parse(buildFile).name.split(".").slice(1).join(".");
                        if(buildFileBase===tempFileBase){
                            pair[buildFile] = buildFiles[buildFile];
                        }
                    }

                    compare.push(pair);
                }

                console.log("compare:\n", compare);

                // verify if the md5 of the pairs match; if replace the build file with the new one;
                compare.forEach(function(obj){

                    var files = Object.keys(obj);
                    if(!(files.length===1 || files.length===2)){
                        grunt.fail.fatal("Error replacing files in the build dir (length=" + files.length + ")")
                    }
                    
                    var buildFile = getBuildFile(obj);
                    if(files.length==1 || (files.length==2 && obj[files[0]]!==obj[files[1]]) ){
                        //console.log("buildFile (1)", buildFile);
                        Fs.copySync(files[0], buildFile);

                        if(files.length===2){
                            Fs.removeSync(files[1]);
                        }
                    }

                });

                function getBuildFile(obj){

                    var tempFileDetails = Path.parse(Object.keys(obj)[0]);
                    //console.log("tempFileDetails\n", tempFileDetails)
                    var now = grunt.template.today('yymmdd-HHMMss');
                    var buildFile = Path.join(tempFileDetails.dir, "..", now + "." + tempFileDetails.name + tempFileDetails.ext);

                    return buildFile;
                }

            }
        },
        app: {
            //src: [Path.join(__dirname, "app/_build/**/*"), ]
            src: [Path.join(__dirname, "app/_build/**/*"), "!" + Path.join(__dirname, "app/_build/temp/templates-dev.js")]
        }
    });

    grunt.config.set("nunjucks", {
        options: {
            autoescape: true
        },
        app: {
            baseDir: Path.join(__dirname, "app2"),
            src: Path.join(__dirname, "app2/**/*.html"),
            dest: Path.join(__dirname, "app/_build/temp/templates-dev.js"),
        }
    });


    grunt.config.set("concat", {
        options: {
            separator: grunt.util.linefeed + ';' + grunt.util.linefeed + '// concat new file ' + grunt.util.linefeed,
   
        },
        app: {
            src: internals.input.app.js,
            dest: Path.join(__dirname, "app/_build/temp/app.js"),
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
        }
    });

    grunt.config.set("compress", {
        options: {
            mode: 'gzip',
            pretty: true,

        },
        app: {
            src: Path.join(__dirname, "app/_build/temp/app.min.js"),
            dest: Path.join(__dirname, "app/_build/temp/app.min.js.gz"),
        },
    });



    //grunt.registerTask("app", ["clean:app", "nunjucks:appx", "nunjucks:appy", "cachebuster:app", "compress:app"])
    grunt.registerTask("app", ["clean:app", "nunjucks:app", "concat:app", "uglify:app", "compress:app", "cachebuster:app"])


};

internals.findInputFiles = function(delimiterStart, delimiterEnd, path){

    var html = Fs.readFileSync(path, "utf8");
    
    var index1 = html.indexOf(delimiterStart);
    var index2 = html.indexOf(delimiterEnd);

    if(index1===-1 || index2===-1){
        internals.grunt.fail.fatal("Could not find the delimiter in the html file: " + delimiterStart + ", " + delimiterEnd);
    }

    var lines = html.substring(index1 + delimiterStart.length, index2)
                .split("\n")
                .map(function(line){
                    return line.trim();
                })
                .filter(function(line){
                    return line.indexOf("<script")===0;
                })
                .map(function(line){

                    // line should now be something like '<script src="/initiatives-app/menu/menu.js"></script>'
                    var $ = Cheerio.load(line);
                    var file = $("script").attr("src").split("/").slice(2).join("/");
                    return Path.join(__dirname, "app", file);
                })
    
    return lines;
}
