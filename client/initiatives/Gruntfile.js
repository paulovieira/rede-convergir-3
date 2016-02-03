/*
1) pre-compile nunjucks templates (will create a nunjucks-precompiled.js file)
2) concat (templates + all files included in the page)
3) uglify
4) compress
5) clean

*/
var Path = require("path");
var Crypto = require('crypto');
var Fs = require("fs-extra");
var TimeGrunt = require('time-grunt');
var LoadTasks = require('load-grunt-tasks');
var _ = require("underscore");
var Cheerio = require('cheerio')
//var Fs = require("fs");

var internals = {};
internals.input = {
    app: {
        js: [],
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

    internals.input.app.js = internals.findInputFiles({
        delimiterStart: "{# grunt-input-app-js #}", 
        delimiterEnd: "{# /grunt-input-app-js #}", 
        html: Path.join(__dirname, "templates/initiatives.html")
    }).map(function(file){
        return Path.join(__dirname, "app", file);
    });

    internals.input.app.js.unshift(Path.join(__dirname, "app/_build/temp/templates-dev.js"));
    
    internals.input.lib.js = internals.findInputFiles({
        delimiterStart: "{# grunt-input-lib-js #}", 
        delimiterEnd: "{# /grunt-input-lib-js #}", 
        html: Path.join(__dirname, "templates/initiatives.html")
    }).map(function(file){
        return Path.join(__dirname, "../../public", file);
    });


    console.log("input files obtained from the html: \n", JSON.stringify(internals.input, null, 4))

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


    grunt.config.set("cachebuster", {
        options: {
            // task-specific options go here.
            complete: function(obj){

                Fs.ensureFileSync(Path.join(__dirname, "app/_build/bundle.json"));
                var bundle = Fs.readFileSync(Path.join(__dirname, "app/_build/bundle.json"), "utf8");
                bundle = JSON.parse(bundle || "{}");

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

                        if(Path.parse(buildFile).name.indexOf("app")!==-1){
                            bundle["app"] = buildFile    
                        }
                        if(Path.parse(buildFile).name.indexOf("app")!==-1){
                            bundle["app"] = buildFile    
                        }
                        
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

        // there's no need to define different targets in this task
        src: [
            Path.join(__dirname, "app/_build/**/*"), 
            "!" + Path.join(__dirname, "app/_build/temp/templates-dev.js")
        ]

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
        },
        lib: {
            src: internals.input.lib.js,
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
            mode: 'gzip',
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


    grunt.config.set("compress", {
        options: {
            mode: 'gzip',
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


    grunt.config.set("temp-task", {
        options: {
        },
        app: {
            options: {
                //tempFiles: Path.join(__dirname, "app/_build/temp/*app*"),
                buildDir: Path.join(__dirname, "app/_build"),
                bundleFile: Path.join(__dirname, "app/_build/bundle.json")
            },
            src: Path.join(__dirname, "app/_build/temp/*app*"),
            //dest: [Path.join(__dirname, "app/_build/*app*")]
        },
        lib: {
            src: [
                Path.join(__dirname, "app/_build/**/*")
            ],
            dest: Path.join(__dirname, "app/_build/lib-out.js")
        }
    });


    grunt.registerMultiTask("temp-task", "", function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
        });


        console.log("options: ", options)
        console.log("this.files: ", this.files)
        console.log("this.files: ", JSON.stringify(this.files))

        var tempHashes = {}, buildHashes = {};

        this.files.forEach(function(file){
            file.src.forEach(function(path){
                computeHash(path, tempHashes);
            })
        })

        if(!grunt.file.isDir(options.buildDir)){
            grunt.fail.fatal("buildDir must be a directory");
        }

        var pattern = Path.join(options.buildDir, "*");
        var buildFiles = grunt.file.expand({filter: "isFile"}, pattern);
        console.log(buildFiles)

        buildFiles.forEach(function(path) {
            computeHash(path, buildHashes);
        });

        console.log("tempHashes\n", tempHashes);
        console.log("buildHashes\n", buildHashes);



        Fs.ensureFileSync(options.bundleFile);
        var bundle = Fs.readFileSync(options.bundleFile, "utf8");
        bundle = JSON.parse(bundle || "{}");

        var compare = [];

        // find the corresponding pairs for the temp files and build files (it might happen
        // that for a given temp file there is no corresponding build file already )
        for(var tempFile in tempHashes){

            var pair = {};
            pair[tempFile] = tempHashes[tempFile];
            var tempFileBase = Path.parse(tempFile).name;

            for(var buildFile in buildHashes){

                var buildFileBase = Path.parse(buildFile).name.split(".").slice(1).join(".");
                if(buildFileBase===tempFileBase){
                    pair[buildFile] = buildHashes[buildFile];
                }
            }

            compare.push(pair);
        }

        console.log("compare:\n", compare);
        
        // verify if the md5 of the pairs match; if so, replace the build file with the new one;
        compare.forEach(function(obj){

            var files = Object.keys(obj);
            if(!(files.length===1 || files.length===2)){
                grunt.fail.fatal("Error replacing files in the build dir (length=" + files.length + ")")
            }
            

            if(files.length==1 || (files.length==2 && obj[files[0]]!==obj[files[1]]) ){
                //console.log("buildFile (1)", buildFile);
                var buildFile = getBuildFile(obj);
                console.log("\n\n\n\nbuildFile\n", buildFile)
                Fs.copySync(files[0], buildFile);
                bundle[grunt.task.current.target] = buildFile;
                
                if(files.length===2){
                    Fs.removeSync(files[1]);
                    delete bundle[files[1]];
                }
            }

        });
        /**/
        function getBuildFile(obj){

            var tempFileDetails = Path.parse(Object.keys(obj)[0]);
            //console.log("tempFileDetails\n", tempFileDetails)
            var now = grunt.template.today('yymmdd-HHMMss');
            var buildFile = Path.join(tempFileDetails.dir, "..", now + "." + tempFileDetails.name + tempFileDetails.ext);

            return buildFile;
        }

        function computeHash(path, obj){

            if(!grunt.file.exists(path)) {
                grunt.log.warn('File "' + path + '" not found.');
                return;
            }
            if(grunt.file.isDir(path)){
                return;
            }

            var source = grunt.file.read(path, {
                encoding: null
            });

            var hash = Crypto
                .createHash("md5")
                .update(source)
                .digest("hex");

            obj[path] = hash;
        }
    });


    grunt.registerTask("app", ["clean:app", "nunjucks:app", "concat:app", "uglify:app", "compress:app", "temp-task:app"]);
    grunt.registerTask("lib", ["clean:lib", "concat:lib", "uglify:lib", "compress:lib", "cachebuster"]);

    grunt.registerTask("default", ["app", "lib"]);

};

internals.findInputFiles = function(options){

    var delimiterStart = options.delimiterStart;
    var delimiterEnd = options.delimiterEnd;

    var html = Fs.readFileSync(options.html, "utf8");
    
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
                    return $("script").attr("src").split("/").slice(2).join("/");
                });
    
    return lines;
};
