//var Fs = require("fs");
//var Hoek = require("hoek");
//var Joi = require("joi");
//var JSON5 = require("json5");
//var Nunjucks = require("/home/pvieira/github/hapi-nunjucks/index.js");
//var _ = require("underscore");
var Path = require("path");
var ChildProcess = require('child_process');
var Fs = require('fs-extra');
var Config = require("nconf");

var Nunjucks = require("hapi-nunjucks");
var Boom = require("boom");
var Glob = require("glob");
var FileJanitor = require('file-janitor');
var Pre = require("../../util/prerequisites");
var Utils = require("../../util/utils");


var internals = {};

// the path of the page that has the form for the login data
internals.loginPath = '/login';

// directory of the client-app (relative to the root dir)
internals.clientAppRelDir = "plugins/dashboard/app";

internals.build = function(commands){

    const webpackConfig = Path.join(__dirname, "webpack.config.js");
    const buildCommand = `webpack --display-chunks --display-modules --config ${ webpackConfig}`;

    try{

        // webpack chunks will be created in app/_build/temp
        Fs.removeSync(Path.join(__dirname, 'app/_build/temp/*'));
        ChildProcess.execSync(buildCommand);

        // copy the js chunks to app/_build; FileJanitor will copy only if there are new files
        // (and will clean the old ones)
/*
        FileJanitor.clean({
            source: [Path.join(__dirname, 'app/_build/temp/*.js')],
            destination: Path.join(__dirname, 'app/_build'),
            separator: '.',
            deleteOld: true
        });
*/
  
        // now copy the remaining assets (images, fonts, etc)
        // TODO: how to implement something similar to FileJanitor for these assests? they don't have a prefix...
        // TODO: if we create an asset with the same name but it has a different timestamp, will the server
        // still send an empty 'not changed' response?
        //const extensions = ['js', 'png', 'eot', 'woff2', 'gif', 'svg', 'woff', 'ttf'];

        const oldFiles = Glob.sync(Path.join(__dirname, 'app/_build/*'))
        oldFiles.forEach(function(file){

            if(Fs.statSync(file).isFile()){
                Fs.removeSync(file);
            }
        });

        const newFiles = Glob.sync(Path.join(__dirname, 'app/_build/temp/*'))
        newFiles.forEach(function(file){

            Fs.copySync(file, Path.join(__dirname, 'app/_build', Path.basename(file)), { preserveTimestamps: true });
        });
    }
    catch(err){
        throw err;
    }

    process.stdout.write("Dashboard client app: build successful!");
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
        },
        compileOptions: {
            pluginName: pluginName
        }
    });

    // authentication strategy configuration
    internals.auth = {
        strategy: require('../../config/plugins/hapi-auth-cookie-cache').strategyName,
        mode: 'try'
    };

    // TODO - remove
    if(Config.get('env')==="dev" && false){
        internals.auth = false;
    }

    server.route({
        path: "/dashboard",
        method: "GET",
        config: {
            handler: function(request, reply) {
                debugger;
                console.log("request.auth: ", JSON.stringify(request.auth));

                if(!request.auth.isAuthenticated){
                    return reply('You are being redirected...').redirect(internals.loginPath);
                }


                var context = {
                    definitions: request.pre.definitions,
                };

                //console.log("context: ", context); 
                return reply.view(Path.join(__dirname, "templates/dashboard.html"), { ctx: context });
            },
            auth: internals.auth,
            pre: [
                [/*Pre.readInitiativesSlim,*/ Pre.readDefinitions2]
            ],

            // avoid the redirectTo option (here and in the options for the scheme); 
            // the redirection can be handled directly in the handler
            /* 
            plugins: {
                'hapi-auth-cookie': {
                    redirectTo: ...
                }
            }
            */

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
/*
            cors: {
                methods: ["GET"]
            },
*/
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

    env.addGlobal("NODE_ENV", Config.get('env'));
    env.addGlobal("pluginTemplatesPath", Path.join(__dirname, "templates"));
    env.addGlobal("commonTemplatesPath", Path.join(Config.get("rootDir"), "templates"));
    
    if(Config.get('env')==='production'){

        //var libBuild = Glob.sync(Path.join(Config.get("rootDir"), internals.clientAppRelDir, "_build/*.lib.min.js"));
        //var appBuild = Glob.sync(Path.join(Config.get("rootDir"), internals.clientAppRelDir, "_build/*.app.min.js"));

        var manifest = Glob.sync(Path.join(__dirname, "app/_build/manifest.*.min.js"));
        var libBuild = Glob.sync(Path.join(__dirname, "app/_build/lib.*.min.js"));
        var appBuild = Glob.sync(Path.join(__dirname, "app/_build/app.*.min.js"));


        if(!manifest.length || !libBuild.length || !appBuild.length){
            throw Boom.badImplementation("dashboard client app: manifest, libBuild or appBuild are missing");
        }

        // dynamic <script src='{{ ... }}')>
        env.addGlobal("manifest", Path.parse(manifest[0]).base);
        env.addGlobal("libBuild", Path.parse(libBuild[0]).base);
        env.addGlobal("appBuild", Path.parse(appBuild[0]).base);
    }
};

exports.register.attributes = {
    name: Path.parse(__dirname).name,  // use the name of the file
    dependencies: ["vision", "inert", "hapi-auth-cookie-cache"]
};
