process.title = "rede-convergir";

// the NODE_ENV env variables should be defined before the node process is started; 
// if not defined we use the following defaults;
process.env.NODE_ENV = process.env.NODE_ENV || "dev";


// the above env variables must be defined before the config module is first required
//var Path = require("path");
var Config = require("config");
var Hoek = require("hoek");
var Glue = require("glue");


//var internals = {};

var manifest = {

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
        },

    },

    connections: [
        {
            host: "localhost",
            port: Config.get("port")
        }
    ],

    plugins: [

        {
            "good": require("./config/plugins/good")
        },

        {
            "blipp": require("./config/plugins/blipp")
        },

        {
            "inert": [{
                options: {}
            }]
        },

        {
            "vision": [{
                options: {}
            }]
        },

        // dependencies: []        
        {
            "./server/utils/utils.js": [{
                options: {}
            }]
        },

        {
            "hapi-auth-cookie": [{
                options: {}
            }]
        },

        // dependencies: ["inert"]
        {
            "./server/hapi-public/hapi-public.js": require("./config/plugins/hapi-public")
        },

        // dependencies: ["hapi-auth-cookie"]
        {
            "hapi-auth-session-memory": require("./config/plugins/hapi-auth-session-memory")

        },

        // dependencies: ["vision", "hapi-auth-session-memory"]
        //   this is where we configure the views manager (using nunjucks) and declare the routes that
        //   return a view; note that reply.view is only available inside the plugin
        {   
            "./server/routes-views/routes-views.js": [{
                options: {}
            }]
        },


        {   
            "./server/routes-api/routes-api.js": require("./config/plugins/routes-api")
        },

        {
            "./server/seneca-promise/seneca-promise.js": [{
                options: {}
            }]
        },

        {   
            "./client/initiatives/initiatives.js": [{
                options: {}
            }]
        },

        {   
            "./client/dashboard/dashboard.js": [{
                options: {}
            }]
        },
        // {
        //     "tv": {
        //         host: Config.get("publicIp"),
        //         port: 6002
        //     }
        // },
    ]
};

// TODO: remove good console if not in production
var options = {
    relativeTo: __dirname,
    prePlugins: function(server, next){
        next();
    }
};

Glue.compose(manifest, options, function (err, server) {

    Hoek.assert(!err, 'Failed registration of one or more plugins: ' + err);

    // start the server and finish the initialization process
    server.start(function(err) {

        Hoek.assert(!err, 'Failed server start: ' + err);
        
        console.log('Server started at: ' + server.info.uri);
        console.log("Hapi version: " + server.version);
        console.log("NODE_ENV: ", process.env.NODE_ENV);
    });
});


/*
var obj = {
    helloWorld: 123,
    anArray: ["a", "b", { insideTheArray: { veryDeepInside: 456}}],
    nestedObj: {
        somethingOne: "fff",
        somethingTwo: {
            blahBlach: "xxx"
        }
    }
};

var obj2 = Utils.changeCase(obj, "underscored");

console.log(JSON.stringify(obj, null, 4))
console.log("")
console.log(JSON.stringify(obj2, null, 4))
*/
