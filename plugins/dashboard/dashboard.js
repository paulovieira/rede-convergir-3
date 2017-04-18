var Path = require("path");
var ChildProcess = require('child_process');
var Fs = require('fs-extra');
var Config = require("nconf");

var Nunjucks = require("hapi-nunjucks");
var Boom = require("boom");
var Glob = require("glob");
var Pre = require("../../util/prerequisites");
//var Utils = require("../../util/utils");


var internals = {};

// the path of the page that has the form for the login data
internals.loginPath = '/login';
internals.buildDir = Path.join(__dirname, 'app/_build');


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

    // route for the client app build
    server.route({
        path: "/dashboard-app/{anyPath*}",
        method: "GET",
        config: {
            handler: {
                directory: { 
                    path: Path.join(__dirname, 'app'),
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

    env.addGlobal('NODE_ENV', Config.get('env'));
    env.addGlobal('pluginTemplatesPath', Path.join(__dirname, 'templates'));
    env.addGlobal('commonTemplatesPath', Path.join(Config.get('rootDir'), 'templates'));

    // in production mode the attribute in <script scr=...> changes 
    // because the chunks produced by webpack have a hash in the filename
    const chunks = internals.findChunkNames();

    env.addGlobal('manifest', Path.basename(chunks.manifest[0]));
    env.addGlobal('libChunk', Path.basename(chunks.lib[0]));
    env.addGlobal('appChunk', Path.basename(chunks.app[0]));

    if (Config.get('env') === 'production'){
        env.addGlobal('urlChunk', '/dashboard-app/_build');
    }
    else {
        env.addGlobal('urlChunk', 'http://localhost:8081/WEBPACK_DEV_SERVER');
    }

};


// call webpack to build the client side application; the chunks will be saved to
// app/_build and have a hashname; 

// TODO: make sure that server-side caching is working well with these static files 
// even when the file is the same (and has the same name), but the timestamp changes;
// if not we have have use FileJanitor to copy from app/buildTemp to app/build only when
// the file has actually changed

internals.build = function(){

    try{
        Fs.removeSync(Path.join(internals.buildDir));

        const webpackConfig = Path.join(__dirname, "webpack.config.js");
        const buildCommand = `webpack --display-chunks --display-modules --config ${ webpackConfig }`;
        ChildProcess.execSync(buildCommand);
    }
    catch(err){
        throw err;
    }

    process.stdout.write("Dashboard client app: build successful!");
};

internals.findChunkNames = function (){

    const chunks = {};

    if (Config.get('env') === 'production'){

        chunks.manifest = Glob.sync(Path.join(internals.buildDir, 'manifest.*.min.js'));
        chunks.lib = Glob.sync(Path.join(internals.buildDir, 'lib.*.min.js'));
        chunks.app = Glob.sync(Path.join(internals.buildDir, 'dashboard-app.*.min.js'));

        if (chunks.manifest.length !== 1 || 
            chunks.lib.length !== 1 || 
            chunks.app.length !== 1){
            throw Boom.badImplementation('Dashboard client app: manifest, lib chunk or app chunk are missing');
        }
    }
    else {
        // chunk names given in webpack configuration 
        chunks.manifest = ['manifest.js'];
        chunks.lib = ['lib.js'];
        chunks.app = ['dashboard-app.js'];
    }

    return chunks;

};

exports.register.attributes = {
    name: Path.parse(__dirname).name,  // use the name of the file
    dependencies: ['vision', 'hapi-auth-cookie-cache', 'hapi-public']
};

