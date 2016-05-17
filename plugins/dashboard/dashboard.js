//var Fs = require("fs");
var Path = require("path");
var Config = require("nconf");
//var Hoek = require("hoek");
//var Joi = require("joi");
//var JSON5 = require("json5");
var Nunjucks = require("hapi-nunjucks");
//var Nunjucks = require("/home/pvieira/github/hapi-nunjucks/index.js");
var Pre = require("../../util/prerequisites");
var Boom = require("boom");
//var _ = require("underscore");
var Glob = require("glob");
var Utils = require("../../util/utils");


var internals = {};

// directory of the client-app (relative to the root dir)
internals.clientAppRelDir = "plugins/dashboard/app";

internals.build = function(commands){

    var webpackConfig = Path.join(Config.get("rootDir"), "plugins/dashboard/webpack.config.js");
    var gruntfile = Path.join(Config.get("rootDir"), "plugins/dashboard/grunt.config.js");

    var buildCommands = [
        `webpack --config ${ webpackConfig}`,
        `grunt --base ${ Config.get("rootDir") } --gruntfile ${ gruntfile }`
    ];

    Utils.shellExec(buildCommands);
    process.stdout.write("Build successful!");
};

exports.register = function(server, options, next){

    // the build commands (webpack + grunt ) should always be executed
    // in production mode 
    if(process.env.NODE_ENV==="production"){
        internals.build();    
    }

    var pluginName = exports.register.attributes.name;
   

    // configure nunjucks
    //var env = Nunjucks.configure(Path.join(__dirname, "templates"), { 
    var env = Nunjucks.configure(Config.get("rootDir"), { 
        autoescape: false,
        watch: false,
        noCache: process.env.NODE_ENV === "production" ? true : false,
        pluginName: pluginName,
        // throwOnUndefined: false,
    });

    internals.addNunjucksFilters(env);
    internals.addNunjucksGlobals(env);

    // expose the Environment object to the outside
    server.expose("env", env);

    // configure a view's manager using the nunjucks lib
    server.views({
        path: Config.get("rootDir"),
        allowAbsolutePaths: true,
        engines: {
            html: Nunjucks
        },
        compileOptions: {
            pluginName: pluginName
        }
    });

    if(process.env.NODE_ENV==="production"){
        internals.auth = {
            strategy: "session-memory",
            mode: "try"
        };
    }
    else{
        internals.auth = false;
    }

    server.route({
        path: "/dashboard",
        method: "GET",
        config: {
            handler: function(request, reply) {

                console.log("request.auth: ", JSON.stringify(request.auth));
                var context = {
                    definitions: request.pre.definitions,
                };

                console.log("context: ", context); 
                return reply.view(Path.join(__dirname, "templates/dashboard.html"), { ctx: context });
            },
            auth: internals.auth,
            pre: [
                [/*Pre.readInitiativesSlim,*/ Pre.readDefinitions2]
            ],
        }
    });

    server.route({
        path: "/dashboard-app/{anyPath*}",
        method: "GET",
        config: {
            handler: {
                directory: { 
                    path: Path.join(Config.get("rootDir"), internals.clientAppRelDir),
                    index: false,
                    listing: false,
                    showHidden: false,
                    lookupCompressed: true
                }
            },
            cache: {
                privacy: "public",
                expiresIn: 3600000
            },
            cors: {
                methods: ["GET"]
            },
            auth: false,
        }
    });

    return next();
};

internals.addNunjucksFilters = function(env){

     env.addFilter('stringify', function(obj) {

         return JSON.stringify(obj);
     });
/*
     env.addFilter('getDomainLogo', function(array, elem) {

         if(typeof array !== "object"){
             return "";
         }

         for(var i=0; i<array.length; i++){
             if(array[i] === elem){
                 return "fa-check-square-o";
             }
         }

         return "fa-square-o";
     });

     env.addFilter('getDefinitionClass', function(array, elem) {

         if(typeof array !== "object"){
             return "";
         }

         for(var i=0; i<array.length; i++){
             if(array[i] === elem){
                 return "has-definition";
             }
         }

         return "";
     });


    env.addFilter('toFixed', function(num, precision) {

        if(typeof num === "string"){
            num = Number(num);
        }

        return num.toFixed(precision);
    });
*/
};


internals.addNunjucksGlobals = function(env){

    env.addGlobal("NODE_ENV", process.env.NODE_ENV);
    env.addGlobal("pluginTemplatesPath", Path.join(__dirname, "templates"));
    env.addGlobal("commonTemplatesPath", Path.join(Config.get("rootDir"), "templates"));
    
    
    var libBuild = Glob.sync(Path.join(Config.get("rootDir"), internals.clientAppRelDir, "_build/*.lib.min.js"));
    var appBuild = Glob.sync(Path.join(Config.get("rootDir"), internals.clientAppRelDir, "_build/*.app.min.js"));


    if(!libBuild.length){
        throw Boom.badImplementation("libBuild is missing");
    }
    if(!appBuild.length){
        throw Boom.badImplementation("appBuild is missing");
    }

    env.addGlobal("libBuild",       Path.parse(libBuild[0]).base);
    env.addGlobal("appBuild",       Path.parse(appBuild[0]).base);

};

exports.register.attributes = {
    name: Path.parse(__dirname).name,  // use the name of the file
    dependencies: ["vision", "inert", "hapi-auth-session-memory"]
};
