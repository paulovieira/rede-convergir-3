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
internals.clientAppRelDir = "plugins/initiatives/app";


/**
internals.definitions = JSON5.parse(Fs.readFileSync(Path.join(Config.get("rootDir"), "database/90_initial_data/9040_populate_definitions.json"), "utf8")); 

internals.getDefinitionsArray = function(definitionPrefix){

    return _.chain(internals.definitions)
            .filter(function(obj){
                return obj.id.indexOf(definitionPrefix) === 0;
            })
            .pluck("id")
            .value();
};

internals.validation = {};
internals.validation.typesIds = internals.getDefinitionsArray("type");
internals.validation.domainsIds = internals.getDefinitionsArray("domain");
internals.validation.baseLayersIds = ["stamen", "esri_satellite", "mapquest"];
*/

internals.build = function(commands){

    var webpackConfig = Path.join(Config.get("rootDir"), "plugins/initiatives/webpack.config.js");
    var gruntfile = Path.join(Config.get("rootDir"), "plugins/initiatives/Gruntfile.js");

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
    if(Config.get('env')==="production"){
        internals.build();    
    }

    var pluginName = exports.register.attributes.name;

    // configure nunjucks
    //var env = Nunjucks.configure(Path.join(__dirname, "templates"), { 
    var env = Nunjucks.configure(Config.get("rootDir"), { 
        autoescape: false,
        watch: false,
        noCache: Config.get('env') === "production" ? true : false,
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
            // html: {
            //     compile: Nunjucks
            // }
        },
        compileOptions: {
            pluginName: pluginName
        }
    });


    server.route({
        path: "/iniciativas",
        method: "GET",
        config: {
            handler: function(request, reply) {

                //console.log(request.pre.initiatives);
                var context = {
                    urlParam1: "initiatives",
                    initiatives: request.pre.initiatives,
                    definitions: request.pre.definitions,
                };

                return reply.view(Path.join(__dirname, "templates/initiatives.html"), {ctx: context});
            },

            pre: [
                [Pre.readInitiativesSlim, Pre.readDefinitions2]
            ],
        },
    });

    server.route({
        path: "/export/iniciativas",
        method: "GET",
        config: {
            handler: function(request, reply) {

                //console.log(request.pre.initiatives);
                var context = {
                    urlParam1: "initiatives",
                    initiatives: request.pre.initiatives,
                    definitions: request.pre.definitions,
                    export: true
                };

                return reply.view(Path.join(__dirname, "templates/initiatives.html"), {ctx: context});
            },

            pre: [
                [Pre.readInitiativesSlim, Pre.readDefinitions2]
            ],
        },
    });

    // temporary endpoint to make sure the map in the http://www.shareable.net/cities/lisboa-portugal
    // page actually shows something; this endpoint is a copy of "/export/iniciativas"
    server.route({
        path: "/v2",
        method: "GET",
        config: {
            handler: function(request, reply) {

                //console.log(request.pre.initiatives);
                var context = {
                    urlParam1: "initiatives",
                    initiatives: request.pre.initiatives,
                    definitions: request.pre.definitions,
                    export: true
                };

                return reply.view(Path.join(__dirname, "templates/initiatives.html"), {ctx: context});
            },

            pre: [
                [Pre.readInitiativesSlim, Pre.readDefinitions2]
            ],
        },
    });



    server.route({
        path: "/initiatives-app/{anyPath*}",
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
            cors: true,
            auth: false,
        }
    });

    return next();
};

internals.addNunjucksFilters = function(env){

     env.addFilter('stringify', function(obj) {

         return JSON.stringify(obj);
     });

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

    //  env.addFilter('parseNewLines', function(text) {

    //      text = text.replace("<br /><br /><br /><br />", "<br />");
    //      text = text.replace("<br /><br /><br />", "<br />");
    //      text = text.replace("<br /><br />", "<br />");

    //      return text.replace("<br />", "<br /><br />");
    // });

    env.addFilter('toFixed', function(num, precision) {

        if(typeof num === "string"){
            num = Number(num);
        }

        return num.toFixed(precision);
    });
};

internals.addNunjucksGlobals = function(env){

    env.addGlobal("NODE_ENV", Config.get('env'));
    env.addGlobal("pluginTemplatesPath", Path.join(__dirname, "templates"));
    env.addGlobal("commonTemplatesPath", Path.join(Config.get("rootDir"), "templates"));
    
    //if(Config.get('env')==='production'){

        var libBuild = Glob.sync(Path.join(Config.get("rootDir"), internals.clientAppRelDir, "_build/*.lib.min.js"));
        var appBuild = Glob.sync(Path.join(Config.get("rootDir"), internals.clientAppRelDir, "_build/*.app.min.js"));
        var appTemplatesBuild = Glob.sync(Path.join(Config.get("rootDir"), internals.clientAppRelDir, "_build/*.app-templates.min.js"));


        if(!libBuild.length){
            throw Boom.badImplementation("libBuild is missing");
        }
        if(!appBuild.length){
            throw Boom.badImplementation("appBuild is missing");
        }
        if(!appTemplatesBuild.length){
            throw Boom.badImplementation("appTemplatesBuild is missing");
        }        

        env.addGlobal("libBuild",       Path.parse(libBuild[0]).base);
        env.addGlobal("appBuild",       Path.parse(appBuild[0]).base);
        env.addGlobal("appTemplatesBuild", Path.parse(appTemplatesBuild[0]).base);
    //}

};

exports.register.attributes = {
    name: Path.parse(__dirname).name,  // use the name of the file
    dependencies: ["vision", "inert"]
};
