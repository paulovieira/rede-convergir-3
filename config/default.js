
var Path = require("path");
var Fs = require("fs");
var Nunjucks = require('hapi-nunjucks');

// absolute paths
var internals = {
    rootDir:      Path.resolve(__dirname, ".."),
};

internals.bundles = JSON.parse(Fs.readFileSync(Path.join(internals.rootDir, "bundles.json"), "utf8"));

module.exports = {

    host: "localhost",
    port: 6001,
    publicUri: "localhost",  // host
    publicPort: 6001,  // probably 80
    publicIp: "127.0.0.1",

    rootDir: internals.rootDir,
    //viewsDir: internals.viewsDir,

    bundles: internals.bundles,

    email: {
        mandrill: {
            apiKey: ""
        },
    },

    ironPassword: "",

    db: {

        postgres: {
            host: "",
            port: 5432,
            database: "",
            username: "",
            password: "",

            getConnectionString: function(){
                return "postgres://" +
                        this.username + ":" +
                        this.password + "@" +
                        this.host + ":" + this.port +  "/" +
                        this.database;
            }
        },
    },

    hapi: {
/*
        // options for the Hapi.Server object (to be used in the main index.js)
        server: {

            //  default connections configuration
            connections: {

                // controls how incoming request URIs are matched against the routing table
                router: {
                    isCaseSensitive: false,
                    stripTrailingSlash: true
                },

                // default configuration for every route.
                routes: {
                    state: {
                        // determines how to handle cookie parsing errors ("ignore" = take no action)
                        failAction: "ignore"
                    },

                    // disable node socket timeouts (useful for debugging)
                    timeout: {
                        server: false,
                        socket: false
                    }
                }
            }
        },
*/
        // options for the views (to be used in the main index.js)
        // views: {
        //     path: internals.viewsDir,
        //     allowAbsolutePaths: true,
        //     engines: {
        //         "html": Nunjucks
        //     },
        // },

        viewsDir: Path.resolve(__dirname, "..", "lib/web/views"),

        // documentation: https://github.com/hapijs/joi#validatevalue-schema-options-callback
        joi: {
            abortEarly: true,  // returns all the errors found (does not stop on the first error)
            stripUnknown: true,  // delete unknown keys; this means that when the handler executes, only the keys that are explicitely stated
            // in the schema will be present in request.payload and request.query 
            convert: true
    /*

            allowUnknown: false, // allows object to contain unknown keys; note that is stipUnknown option is used, this becomes obsolete (because all unknown keys will be removed before the check for unknown keys is done)

            convert: ...
            skipFunctions: ...
            stripUnknown: ...
            language: ...
            presence: ...
            context: ...
    */
        },
    },

    apiPrefix: {
        v1: "/api/v1"
    },
};

