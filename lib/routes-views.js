var Fs = require("fs");
var Path = require("path");
var Config = require("config");
//var Hoek = require("hoek");
//var Joi = require("joi");
var JSON5 = require("json5");
var Nunjucks = require("hapi-nunjucks");
var Utils = require("./common/utils");
var Pre = require("./common/prerequisites");
var Boom = require("boom");
var _ = require("underscore");

var internals = {};

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

exports.register = function(server, options, next){

    // configure nunjucks
    var env = Nunjucks.configure(Path.join(__dirname, "templates"), { 
        autoescape: false,
        watch: false,
        noCache: process.env.NODE_ENV === "production" ? true : false
    });

    internals.addNunjucksFilters(env);
    internals.addNunjucksGlobals(env);

    // expose the Environment object to the outside
    server.expose("env", env);

    // configure a view's manager using the nunjucks lib
    server.views({
        path: Path.join(__dirname, "templates"),
        engines: {
            html: Nunjucks
        }
    });

    // routes that return a response with variety "view" (response.variety === "view")

    server.route({
        path: "/",
        method: "GET",
        config: {
            handler: function(request, reply) {

                return reply.view("home.html");
            },
        }
    });


    server.route({
        path: "/dashboard",
        method: "GET",
        config: {
            handler: function(request, reply) {

                console.log("request.auth: ", JSON.stringify(request.auth));
                return reply.view("dashboard.html");
            },
            auth: {
                strategy: "session-memory",
                mode: "try"
            },
        }
    });


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

                return reply.view("initiatives.html", {ctx: context});
            },

            pre: [
                [Pre.readInitiativesSlim, Pre.readDefinitions2]
            ],

        },

    });

    // NOTE: this route should be exactly like the one above
    server.route({
        path: "/exportar/iniciativas",
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

                return reply.view("initiatives-export.html", {ctx: context});
            },

            pre: [
                [Pre.readInitiativesSlim, Pre.readDefinitions2]
            ],
        },

    });


    server.route({
        path: "/iniciativas/{slug}",
        method: "GET",
        config: {
            handler: function(request, reply) {

                Utils.log(request.params);

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

                return reply.view("initiative.html", {ctx: context});
            },
            pre: [
                [Pre.readInitiativeBySlug, Pre.readDefinitions2]
            ],
        }
    });

    server.route({
        path: "/inserir-iniciativa",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "inserir-iniciativa",
                    definitions: request.pre.definitions
                };

                return reply.view("inserir-iniciativa.html", {ctx: context});
            },
            pre: [
                [Pre.readDefinitions2]
            ],
        }
    });

    server.route({
        path: "/inserir-evento",
        method: "GET",
        config: {
            handler: function(request, reply) {

                console.log("xxx: ", Config.get("email.send"));
                
                var context = {
                    urlParam1: "inserir-evento"
                };

                return reply.view("inserir-evento.html", {ctx: context})
            },
        }
    });

    server.route({
        path: "/eventos",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "eventos"
                };

                return reply.view("eventos.html", {ctx: context});
            },
        }
    });

    server.route({
        path: "/catalise",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "catalise"
                };

                return reply.view("catalise.html", {ctx: context});
            },
        }
    });


    server.route({
        path: "/sobre",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "sobre"
                };

                return reply.view("sobre.html", {ctx: context});
            },
        }
    });

    server.route({
        path: "/equipa",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "equipa"
                };

                return reply.view("equipa.html", {ctx: context});
            },
        }
    });

    server.route({
        path: "/newsletter",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "newsletter"
                };

                return reply.view("newsletter.html", {ctx: context});
            },
        }
    });

    server.route({
        path: "/ligacoes-uteis",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "ligacoes-uteis"
                };

                return reply.view("ligacoes-uteis.html", {ctx: context});
            },
        }
    });

    server.route({
        path: "/exportar",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "exportar"
                };

                return reply.view("exportar.html", {ctx: context});
            },
        }
    });

    server.route({
        path: "/iframe-test-1",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "iframe-test-1"
                };

                return reply.view("iframe-test-1.html", {ctx: context});
            },
        }
    });


    /*
    this route is used to emulate the functionality of exporting the map (via iframe) of the old version
    */
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

                return reply.view("iframe_old_version.html", {
                    ctx: context
                });
            },

        }
    });


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

                var ctx = {
                    query: request.query
                };

                return reply.view("login", {
                    ctx: ctx
                });
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

    var bundles  = JSON.parse(Fs.readFileSync(Path.join(Config.get("rootDir"), "bundles.json"), "utf8"));

    env.addGlobal("NODE_ENV", process.env.NODE_ENV);
    env.addGlobal("bundles", bundles);
};

exports.register.attributes = {
    name: Path.parse(__filename).name,  // use the name of the file
    dependencies: ["vision", "hapi-auth-session-memory"]
};
