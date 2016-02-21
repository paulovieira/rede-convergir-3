/*

1) clean
2) pre-compile nunjucks templates (will create a nunjucks-precompiled.js file)
3) concat (templates + all files included in the page)
4) uglify
5) compress
6) add timestamp


grunt should be called from the root directory of the project:

grunt --base ./ --gruntfile client/initiatives/Gruntfile.js  app

*/

var Path = require("path");
var Fs = require("fs");
var TimeGrunt = require('time-grunt');
var LoadTasks = require('load-grunt-tasks');
var _ = require("underscore");
var Cheerio = require('cheerio');

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
    
    grunt.log.subhead("input files obtained from the html\n");

    grunt.log.writeln("application js:");
    grunt.log.writeln(grunt.log.wordlist(internals.input.app.js, { separator: "\n"}));

    grunt.log.writeln("\napplication css:");
    grunt.log.writeln(grunt.log.wordlist(internals.input.app.css, { separator: "\n"}));

    grunt.log.writeln("lib js:");
    grunt.log.writeln(grunt.log.wordlist(internals.input.lib.js, { separator: "\n"}));


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


    grunt.config.set("static-timestamp", {
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

    grunt.registerTask("app", ["clean:app", "nunjucks:app", "concat:app", "uglify:app", "compress:app", "static-timestamp:app"]);
    grunt.registerTask("lib", ["clean:lib", "concat:lib", "uglify:lib", "compress:lib", "static-timestamp:lib"]);

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
