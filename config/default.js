
var Path = require("path");
var Fs = require("fs");
var Nunjucks = require('hapi-nunjucks');

// absolute paths
var internals = {
    rootDir:      Path.resolve(__dirname, ".."),
    viewsDir:     Path.resolve(__dirname, "..", "lib/web/views"),
    env:process.env.NODE_ENV 
};

internals.bundles = JSON.parse(Fs.readFileSync(Path.join(internals.rootDir, "bundles.json"), "utf8"));

module.exports = {

    host: "localhost",
    port: 6001,
    publicUri: "localhost",  // host
    publicPort: 6001,  // probably 80

    rootDir: internals.rootDir,
    viewsDir: internals.viewsDir,
    
    bundles: internals.bundles,
    
    hapi: {

        // options for the Hapi.Server object (to be used in the main index.js)
        server: {
            connections: {
                router: {
                    isCaseSensitive: false,
                    stripTrailingSlash: true
                }            
            }
        },

        // options for the views (to be used in the main index.js)
        views: {
            path: internals.viewsDir,
            allowAbsolutePaths: true,
            engines: {
                "html": Nunjucks
            },
        },

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

