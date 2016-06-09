require('./config/load');

var Config = require('nconf');
var Hoek = require("hoek");
var Glue = require("glue");
var Chalk = require('chalk');
var Db = require("./database");

process.title = Config.get("applicationTitle");

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
            "./util/utils.js": [{
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
            "./plugins/hapi-public/hapi-public.js": require("./config/plugins/hapi-public")
        },

        // dependencies: ["hapi-auth-cookie"]
        {
            "hapi-auth-session-memory": require("./config/plugins/hapi-auth-session-memory")

        },

        // dependencies: ["vision", "hapi-auth-session-memory"]
        //   this is where we configure the views manager (using nunjucks) and declare the routes that
        //   return a view; note that reply.view is only available inside the plugin
        {   
            "./plugins/routes-views/routes-views.js": [{
                options: {}
            }]
        },


        {   
            "./plugins/routes-api/routes-api.js": require("./config/plugins/routes-api")
        },

        {
            "./plugins/seneca-promise/seneca-promise.js": [{
                options: {}
            }]
        },

        {   
            "./plugins/initiatives/initiatives.js": [{
                options: {}
            }]
        },

        {   
            "./plugins/dashboard/dashboard.js": [{
                options: {}
            }]
        }

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
        
        // show some informations about the server
        console.log(Chalk.green('================='));
        console.log("Hapi version: " + server.version);
        console.log('host: ' + server.info.host);
        console.log('port: ' + server.info.port);
        console.log("process.env.NODE_ENV: ", process.env.NODE_ENV);

        Db.query("SELECT * FROM version()")
            .then(function(result){
                console.log("database: ", result[0].version);
                console.log(Chalk.green('================='));
            });
        
    });
});


