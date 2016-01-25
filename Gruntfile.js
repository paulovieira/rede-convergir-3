var Path = require("path");
//var Fs = require("fs");

var internals = {};

module.exports = function(grunt) {

    grunt.loadNpmTasks("grunt-nunjucks");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.loadTasks("client/initiatives");

    // nunjuck templates
    internals.inputDir = ;


    // templates target - rc
    internals.templates = {};
    internals.templates.input = [
        internalsDir + '/**/*.html'
    ];
    internals.templates.output = Path.join(
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



};

