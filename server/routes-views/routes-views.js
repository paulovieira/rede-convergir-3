var Fs = require("fs");
var Path = require("path");
var Config = require("config");
//var Hoek = require("hoek");
//var Joi = require("joi");
var JSON5 = require("json5");
//var Nunjucks = require("hapi-nunjucks");
var Nunjucks = require("/home/pvieira/github/hapi-nunjucks/index.js");
var Pre = require("../common/prerequisites");
var Boom = require("boom");
var _ = require("underscore");

var internals = {};
/*

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

// internals.pluginTemplatesPath = Path.join(__dirname, "templates");
// internals.commonTemplatesPath = Path.join(Config.get("rootDir"), "templates");

exports.register = function(server, options, next){

    var pluginName = exports.register.attributes.name;

    // configure nunjucks
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

    // routes that return a response with variety "view" (response.variety === "view")

    // ok
    server.route({
        path: "/",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {};
                return reply.view(Path.join(__dirname, "templates/home.html"), {ctx: context});
            },
        }
    });

    // ok
    server.route({
        path: "/dashboard",
        method: "GET",
        config: {
            handler: function(request, reply) {

                console.log("request.auth: ", JSON.stringify(request.auth));
                var context = {};
                return reply.view(Path.join(__dirname, "templates/dashboard.html"), {ctx: context});
            },
            auth: {
                strategy: "session-memory",
                mode: "try"
            },
        }
    });

    // ok
/*
    server.route({
        path: "/iniciativas",
        method: "GET",
        config: {
            handler: function(request, reply) {

                
                console.log(request.query);

                //console.log(request.pre.initiatives);
                var context = {
                    urlParam1: "initiatives",
                    initiatives: request.pre.initiatives,
                    definitions: request.pre.definitions,
                    //query: request.query
                };

                return reply.view(Path.join(__dirname, "templates/initiatives.html"), {ctx: context});
            },

            pre: [
                [Pre.readInitiativesSlim, Pre.readDefinitions2]
            ],

        },

    });
*/
    // ok
    server.route({
        path: "/iniciativas/{slug}",
        method: "GET",
        config: {
            handler: function(request, reply) {

                request.server.methods.utils.log("request.params", request.params);

                // we couldn't fetch any data for the given slug
                if(request.pre.initiative.length === 0){
                    reply(Boom.notFound("this initiative does not exist (TODO: show a user friendly page with the error)"));
                }

                var definitionsById = {};
                definitionsById.initiative_status = _.indexBy(request.pre.definitions.initiative_status, "id");
                definitionsById.type = _.indexBy(request.pre.definitions.type, "id");
                definitionsById.scope = _.indexBy(request.pre.definitions.scope, "id");
                definitionsById.visitors = _.indexBy(request.pre.definitions.visitors, "id");

                var context = {
                    urlParam1: "iniciativas",
                    data: request.pre.initiative[0],
                    definitions: request.pre.definitions,
                    definitionsById: definitionsById
                };

                return reply.view(Path.join(__dirname, "templates/initiative.html"), {ctx: context});
            },
            pre: [
                [Pre.readInitiativeBySlug, Pre.readDefinitions2]
            ],
        }
    });

    // ok
    server.route({
        path: "/inserir-iniciativa",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "inserir-iniciativa",
                    definitions: request.pre.definitions
                };

                return reply.view(Path.join(__dirname, "templates/inserir-iniciativa.html"), {ctx: context});
            },
            pre: [
                [Pre.readDefinitions2]
            ],
        }
    });

    // ok
    server.route({
        path: "/inserir-evento",
        method: "GET",
        config: {
            handler: function(request, reply) {
                
                var context = {
                    urlParam1: "inserir-evento"
                };

                return reply.view(Path.join(__dirname, "templates/inserir-evento.html"), {ctx: context});
            },
        }
    });

    // ok
    server.route({
        path: "/eventos",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "eventos"
                };

                return reply.view(Path.join(__dirname, "templates/eventos.html"), {ctx: context});
            },
        }
    });

    // ok
    server.route({
        path: "/catalise",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "catalise"
                };

                return reply.view(Path.join(__dirname, "templates/catalise.html"), {ctx: context});
            },
        }
    });

    // ok
    server.route({
        path: "/sobre",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "sobre"
                };

                return reply.view(Path.join(__dirname, "templates/sobre.html"), {ctx: context});
            },
        }
    });

    // ok
    server.route({
        path: "/equipa",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "equipa"
                };

                return reply.view(Path.join(__dirname, "templates/equipa.html"), {ctx: context});
            },
        }
    });

    // ok
    server.route({
        path: "/newsletter",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "newsletter"
                };

                return reply.view(Path.join(__dirname, "templates/newsletter.html"), {ctx: context});
            },
        }
    });

    // ok
    server.route({
        path: "/ligacoes-uteis",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "ligacoes-uteis"
                };

                return reply.view(Path.join(__dirname, "templates/ligacoes-uteis.html"), {ctx: context});
            },
        }
    });

    // ok
    server.route({
        path: "/exportar",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "exportar"
                };

                return reply.view(Path.join(__dirname, "templates/exportar.html"), {ctx: context});
            },
        }
    });

    // ok
    server.route({
        path: "/iframe-test-1",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "iframe-test-1"
                };

                return reply.view(Path.join(__dirname, "templates/iframe-test-1.html"), {ctx: context});
            },
        }
    });


    /*
    this route is used to emulate the functionality of exporting the map (via iframe) of the old version
    */
    // ok
    server.route({
        path: "/map.php",
        method: "GET",
        config: {
            handler: function(request, reply) {

                request.query = request.query || {}
                request.query.MapWidth = request.query.MapWidth || 300;
                request.query.MapHeight = request.query.MapHeight || 430;

                var context = {
                    query: request.query
                };

                return reply.view(Path.join(__dirname, "templates/iframe-old-version.html"), {ctx: context});

            },

        }
    });

    // ok
    server.route({
        path: "/login",
        method: "GET",
        config: {

            handler: function(request, reply) {
                debugger;
                
                //request.auth.isAuthenticated = true;
                if (request.auth.isAuthenticated) {
                    return reply.redirect("/dashboard");
                }

                var context = {
                    query: request.query
                };

                return reply.view(Path.join(__dirname, "templates/login.html"), {ctx: context});
            },

            auth: {
                strategy: "session-memory",
                mode: "try"
            },

            plugins: {

                // disable the redirectTo option for this route (given to the hapi auth cookie), otherwise
                // we get and infinite redirect loop
                "hapi-auth-cookie": {
                    redirectTo: false
                }
            }

        }

    });

    // server.route({
    //     path: "/temp",
    //     method: "GET",
    //     config: {
    //         handler: function(request, reply) {

    //             return reply.view("temp.html", {name: "<h1>paulo</h1>" });
    //         },
    //     }
    // });

    // server.route({
    //     path: "/benchmark/{anyPath*}",
    //     method: "GET",
    //     config: {
    //         handler: {
    //             directory: { 
    //                 path: Path.join(Config.get("rootDir"), "lib/web/client/benchmark") 
    //             }
    //         },
    //         cache: {
    //             privacy: "public",
    //             expiresIn: 3600000
    //         },
    //         cors: {
    //             methods: ["GET"]
    //         },
    //     }
    // });

    // server.route({
    //     path: "/mn-cv",
    //     method: "GET",
    //     config: {
    //         handler: function(request, reply) {

    //             return reply.view("mn-cv.html");
    //         },
    //     }
    // });

    // server.route({
    //     path: "/mn-cv2",
    //     method: "GET",
    //     config: {
    //         handler: function(request, reply) {

    //             return reply.view("mn-cv2.html");
    //         }
    //     }
    // });

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

     env.addFilter('parseNewLines', function(text) {

         text = text.replace("<br /><br /><br /><br />", "<br />");
         text = text.replace("<br /><br /><br />", "<br />");
         text = text.replace("<br /><br />", "<br />");

         return text.replace("<br />", "<br /><br />");
    });

    env.addFilter('toFixed', function(num, precision) {

        if(typeof num === "string"){
            num = Number(num);
        }

        return num.toFixed(precision);
    });
};

internals.addNunjucksGlobals = function(env){

    env.addGlobal("NODE_ENV", process.env.NODE_ENV);
    env.addGlobal("pluginTemplatesPath", Path.join(__dirname, "templates"));
    env.addGlobal("commonTemplatesPath", Path.join(Config.get("rootDir"), "templates"));
};

exports.register.attributes = {
    name: Path.parse(__dirname).name,  // use the name of the file
    dependencies: ["vision", "hapi-auth-session-memory"]
};
