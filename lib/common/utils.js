var Path = require("path");
var Config = require("config");
var Nunjucks = require("hapi-nunjucks");


var internals = {

    sgrColors: {
        "reset": "\x1b[0m",
        "black": "\x1b[30m",
        "red": "\x1b[31m",
        "green": "\x1b[32m",
        "yellow": "\x1b[33m",
        "blue": "\x1b[34m",
        "magenta": "\x1b[35m",
        "cyan": "\x1b[36m",
        "white": "\x1b[37m",

        bold: {
            "black": "\x1b[30;1m",
            "red": "\x1b[31;1m",
            "green": "\x1b[32;1m",
            "yellow": "\x1b[33;1m",
            "blue": "\x1b[34;1m",
            "magenta": "\x1b[35;1m",
            "cyan": "\x1b[36;1m",
            "white": "\x1b[37;1m",
        }
    }

};

// to be called in lib/index.js (as soon as the server is created)
exports.registerServer = function(server) {

    internals.server = server;
};


exports.logCallsite = function(callsiteObj) {

    var colors = internals.sgrColors;

    // callsiteObj is an array of strings, prepared by Hoek (not the origin callsite obj, which has methods like .getLineNumber())
    var funcName = callsiteObj[3];
    var lineNumber = callsiteObj[1];
    var dirName = Path.dirname(callsiteObj[0]);
    var baseName = Path.basename(callsiteObj[0]);

    var output = colors.bold.cyan + (funcName || "anonymous") + "()" + colors.reset +
        " (" + dirName + "/" + colors.bold.cyan + baseName + colors.reset +
        ":" + colors.bold.green + lineNumber + colors.reset + ")";

    internals.server.log(["stack"], output);

    return output;
};

exports.serverLog = function(tags, data) {

    internals.server.log(tags, data);
};

exports.configureNunjucks = function(){

    Nunjucks.configure(Config.get("viewsDir"), {
        watch: false
        //    autoescape: true 
    });

    Nunjucks.addFilter('stringify', function(str) {
        return JSON.stringify(str);
    });

    Nunjucks.addGlobal("NODE_ENV", process.env.NODE_ENV);
    Nunjucks.addGlobal("bundles", Config.get("bundles"));
};
