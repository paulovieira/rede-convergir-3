var Path = require("path");
var Config = require("config");

module.exports = [{
    options: {

        file: [
            { 
                path: "/favicon.ico", 
                handler: { path: Path.join(Config.get("rootDir"), "public/images/favicon.ico") }
            }
        ],

        directory: [
            {
                path: "/public/{anyPath*}",
                handler: { path: Path.join(Config.get("rootDir"), "public") }
            },
            {
                path: "/rc-dashboard/{anyPath*}",
                handler: { path: Path.join(Config.get("rootDir"), "server/client/rc-dashboard") }
            }
        ],

        fileHandlerDefaults: {
            etagMethod: "simple"
        },

        directoryHandlerDefaults: {
            index: false,
            listing: false,
            showHidden: false
        },

        configDefaults: {
        }

    }
}];
