var Path = require("path");
//var Fs = require("fs");

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-nunjucks');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');


    // configuration data for all the tasks
    var internals = {};
    
    internals.timestamp = grunt.template.today('yymmdd-HHMMss');
    internals.staticsDir = Path.join("lib", "web", "client", "static");
    internals.rcDir = Path.join("lib", "web", "client", "rc-app");

    internals.statics = {};

/*
    // base target: this is only jquery and bootstrap and is included in every page
    internals.statics.base = {};
    internals.statics.base.input = [
        'lib/web/client/static/jquery/jquery-1.11.2.js', 
        'lib/web/client/static/bootstrap/3.3.5/js/bootstrap.js' 
    ];

    internals.statics.base.output = Path.join(
        internals.staticsDir, 
        "_js",
        "base-" + internals.timestamp
    );



    // cartografia target (libs)
    internals.statics.cartografiaLibs = {};
    internals.statics.cartografiaLibs.input = [
        "lib/web/client/static/jquery/jquery.documentsize-1.2.1.js",
        "lib/web/client/static/jquery/jquery.mousewheel-3.1.12.js",
        "lib/web/client/static/leaflet/leaflet-0.7.5/leaflet-0.7.5.js",
        "lib/web/client/static/leaflet/mapbox-2.2.2/mapbox.standalone.uncompressed.js",
        "lib/web/client/static/leaflet/leaflet-control-geocoder-1.3.1/Control.Geocoder-1.3.1.js",
        "lib/web/client/static/underscore/underscore-1.6.0.js",
        "lib/web/client/static/bootstrap/bootstrap-treeview.js",
        "lib/web/client/static/nunjucks/nunjucks-slim-1.3.3.js",
        "lib/web/client/static/backbone/json2.js",
        "lib/web/client/static/backbone/backbone-1.1.2.js",
        "lib/web/client/static/backbone/backbone.select-1.3.2.js",
        "lib/web/client/static/backbone/backbone.radio-1.0.1.js",
        "lib/web/client/static/backbone/backbone.marionette-2.4.1.js",
        "lib/web/client/static/backbone/renderer-nunjucks.js",
    ];

    internals.statics.cartografiaLibs.output = Path.join(
        internals.staticsDir, 
        "_js",
        "rc-libs-" + internals.timestamp
    );


    // cartografia target (app)
    internals.statics.cartografiaApp = {};
    internals.statics.cartografiaApp.input = [
        "lib/web/client/rc-app/menu-definition.js",

        "lib/web/client/rc-app/index.js",
        "lib/web/client/rc-app/leaflet-backbone-view.js",
        "lib/web/client/rc-app/entities.js",
        "lib/web/client/rc-app/behaviors.js",
        "lib/web/client/rc-app/menu/menu.js",
        "lib/web/client/rc-app/map/map.js",
        "lib/web/client/rc-app/init.js"
    ];

    internals.statics.cartografiaApp.output = Path.join(
        internals.staticsDir, 
        "_js",
        "rc-app-" + internals.timestamp
    );
*/


    // nunjuck templates
    internals.templates = {};


    // templates target - rc
    internals.templates.rc = {};
    internals.templates.rc.input = [
        internals.rcDir + '/**/*.html'
    ];
    internals.templates.rc.output = Path.join(
        internals.staticsDir, 
        "_js",
        "rc-templates-" +  internals.timestamp
    );

    // templates target - dashboard
    internals.templates.dashboard = {};
    internals.templates.dashboard.input = [
        internals.dashboardDir + '/**/*.html'
    ];
    internals.templates.dashboard.output = Path.join(
        internals.staticsDir, 
        "_js",
        "dashboard-templates-" +  internals.timestamp
    );

    // the tasks configuration starts here

    // TASK: concatenate js and css

    var concatConfig = {

        options: {
            separator: grunt.util.linefeed + ';' + grunt.util.linefeed + '// concat new file ' + grunt.util.linefeed,
        },
/*        
        base: {
            src: internals.statics.base.input,
            dest: internals.statics.base.output + ".js",
            nonull: true,
        },

        "rc-libs": {
            src: internals.statics.cartografiaLibs.input,
            dest: internals.statics.cartografiaLibs.output + ".js",
            nonull: true,
        },

        "rc-app": {
            src: internals.statics.cartografiaApp.input,
            dest: internals.statics.cartografiaApp.output + ".js",
            nonull: true,
        },
*/
    };

    grunt.config("concat", concatConfig);


    // TASK: pre-compile nunjucks templates

    var nunjucksConfig = {

        "rc-templates": {
            baseDir: internals.rcDir,
            src: internals.templates.rc.input,
            dest: internals.templates.rc.output + ".js",
            options: {
                autoescape: true
            }
        },

        "dashboard-templates": {
            baseDir: internals.dashboardDir,
            src: internals.templates.dashboard.input,
            dest: internals.templates.dashboard.output + ".js",
            options: {
                autoescape: true
            }
        },
    };

    grunt.config("nunjucks", nunjucksConfig);


    // TASK: uglify (to be run after concat and nunjucks)

    var uglifyConfig = {

        // if there is any problem with the minified code, try mangle: false
        options: {
            mangle: false
        },
/*
        base: {
            src: internals.statics.base.output + ".js",
            dest: internals.statics.base.output + ".min.js"
        },

        "rc-libs": {
            src: internals.statics.cartografiaLibs.output + ".js",
            dest: internals.statics.cartografiaLibs.output + ".min.js"
        },

        "rc-app": {
            src: internals.statics.cartografiaApp.output + ".js",
            dest: internals.statics.cartografiaApp.output + ".min.js"
        },
*/
        "rc-templates": {
            src: internals.templates.rc.output + ".js",
            dest: internals.templates.rc.output + ".min.js"
        },

        "dashboard-templates": {
            src: internals.templates.dashboard.output + ".js",
            dest: internals.templates.dashboard.output + ".min.js"
        },
    };

    grunt.config("uglify", uglifyConfig);


    // TASK: create a gzipped version of the concatenated files (this task should be run
    // right after the uglify; nginx will use these files if they are present;)

    var compressConfig = {

        options: {
            mode: 'gzip',
            pretty: true
        },
/*
        base: {
            src: internals.statics.base.output + ".min.js",
            dest: internals.statics.base.output + ".min.js.gz"
        },


        "rc-libs": {
            src: internals.statics.cartografiaLibs.output + ".min.js",
            dest: internals.statics.cartografiaLibs.output + ".min.js.gz"
        },

        "rc-app": {
            src: internals.statics.cartografiaApp.output + ".min.js",
            dest: internals.statics.cartografiaApp.output + ".min.js.gz"
        },
*/
        "rc-templates": {
            src: internals.templates.rc.output + ".min.js",
            dest: internals.templates.rc.output + ".min.js.gz"
        },

        "dashboard-templates": {
            src: internals.templates.dashboard.output + ".min.js",
            dest: internals.templates.dashboard.output + ".min.js.gz"
        },
    };

    grunt.config("compress", compressConfig);

    // TASK: clean old files 

    var cleanConfig = {

        options: {
//            "no-write": true
        },
/*
        "base": {
            src: Path.join(internals.staticsDir, "_js", "base*")
        },

        "base-uncompressed": {
            src: internals.statics.base.output + ".js"
        },


        "rc-libs": {
            src: Path.join(internals.staticsDir, "_js", "rc-libs-*")
        },

        "rc-libs-uncompressed": {
            src: internals.statics.cartografiaLibs.output + ".js"
        },

        "rc-app": {
            src: Path.join(internals.staticsDir, "_js", "rc-app-*")
        },

        "rc-app-uncompressed": {
            src: internals.statics.cartografiaApp.output + ".js"
        },
*/
        "rc-templates": {
            src: Path.join(internals.staticsDir, "_js", "rc-templates-*")
        },

        "rc-templates-uncompressed": {
            src: internals.templates.rc.output + ".js"
        },


        "dashboard-templates": {
            src: Path.join(internals.staticsDir, "_js", "dashboard-templates-*")
        },

        "dashboard-templates-uncompressed": {
            src: internals.templates.dashboard.output + ".js"
        }

    };

    grunt.config("clean", cleanConfig);




    // TASK: watch files for changes

    var watchConfig = {
/*
        "base": {
            files: internals.statics.base.input,
            tasks: [
                "clean:base", 
                "concat:base",
                "uglify:base",
                "clean:base-uncompressed",
                "compress:base",
                "update-bundles-info"   
            ]
        },

        "rc-libs": {
            files: internals.statics.cartografiaLibs.input,
            tasks: [
                "clean:rc-libs", 
                "concat:rc-libs",
                "uglify:rc-libs",
                "clean:rc-libs-uncompressed", 
                "compress:rc-libs",
                "update-bundles-info"
            ]
        },

        "rc-app": {
            files: internals.statics.cartografiaApp.input,
            tasks: [
                "clean:rc-app",
                "concat:rc-app",
                "uglify:rc-app",
                "clean:rc-app-uncompressed", 
                "compress:rc-app",
                "update-bundles-info"
            ]
        },
*/
        "rc-templates": {
            files: internals.templates.rc.input,
            tasks: [
                "clean:rc-templates",
                "nunjucks:rc-templates",
                "uglify:rc-templates",
                "clean:rc-templates-uncompressed", 
                "compress:rc-templates",
                "update-bundles-info"
            ]
        },

        "dashboard-templates": {
            files: internals.templates.dashboard.input,
            tasks: [
                "clean:dashboard-templates",
                "nunjucks:dashboard-templates",
                "uglify:dashboard-templates",
                "clean:dashboard-templates-uncompressed", 
                "compress:dashboard-templates",
                "update-bundles-info"
            ]
        },
    };


    grunt.config("watch", watchConfig);


    // TASK: update bundles.json with the filenames of the current bundles

    grunt.registerTask("update-bundles-info", function(){

        var obj = {}, filename = "./bundles.json";
        var paths;

/*
        // bundles - base (jquery + bootstrap)
        paths = grunt.file.expand(Path.join(internals.staticsDir, "_js", "base*.min.js"));
        obj["base"] = Path.basename(paths[0]);

        // bundles - cartografia libs
        paths = grunt.file.expand(Path.join(internals.staticsDir, "_js", "rc-libs*.min.js"));
        obj["rc-libs"] = Path.basename(paths[0]);


        // bundles - cartografia app
        paths = grunt.file.expand(Path.join(internals.staticsDir, "_js", "rc-app*.min.js"));
        obj["rc-app"] = Path.basename(paths[0]);
*/
        // bundles - rc templates
        paths = grunt.file.expand(Path.join(internals.staticsDir, "_js", "rc-templates*.min.js"));
        obj["rc-templates"] = Path.basename(paths[0]);

        paths = grunt.file.expand(Path.join(internals.staticsDir, "_js", "dashboard-templates*.min.js"));
        obj["dashboard-templates"] = Path.basename(paths[0]);

        grunt.file.write(filename, JSON.stringify(obj, null, 4));
    });


//    grunt.registerTask("concatenate', ['concat:base', "clean:old"]);
    grunt.registerTask('default', ['watch']);

    grunt.registerTask('build', [
/*
        "clean:base",
        "concat:base",
        "uglify:base",
        "compress:base",
        "clean:base-uncompressed",

        "clean:rc-libs",
        "concat:rc-libs",
        "uglify:rc-libs",
        "compress:rc-libs",
        "clean:rc-libs-uncompressed",

        "clean:rc-app",
        "concat:rc-app",
        "uglify:rc-app",
        "compress:rc-app",
        "clean:rc-app-uncompressed",
*/        
        "clean:rc-templates",
        "nunjucks:rc-templates",
        "uglify:rc-templates",
        "compress:rc-templates",
        "clean:rc-templates-uncompressed",

        "clean:dashboard-templates",
        "nunjucks:dashboard-templates",
        "uglify:dashboard-templates",
        "compress:dashboard-templates",
        "clean:dashboard-templates-uncompressed",

        "update-bundles-info"
    ]);

};

