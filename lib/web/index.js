var Fs = require("fs");
var Path = require("path");
var Config = require("config");
var Hoek = require("hoek");
var Joi = require("joi");
var JSON5 = require("json5");
var Utils = require("../common/utils");
var Pre = require("../common/prerequisites");
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

	//server.views(Config.get("hapi.views"));


    // route for the client apps (static files: js, css, etc)
    server.route({
        path: "/benchmark/{anyPath*}",
        method: "GET",
        config: {
            handler: {
                directory: { 
                    path: Path.join(Config.get("rootDir"), "lib/web/client/benchmark") 
                }
            },
            cache: {
                privacy: "public",
                expiresIn: 3600000
            },
            cors: {
                methods: ["GET"]
            },
        }
    });

    server.route({
        path: "/mn-cv",
        method: "GET",
        config: {
            handler: function(request, reply) {

                return reply.view("mn-cv.html");
            },
        }
    });

    server.route({
        path: "/mn-cv2",
        method: "GET",
        config: {
            handler: function(request, reply) {

                return reply.view("mn-cv2.html");
            }
        }
    });

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

/*            
            validate: {
                // example: http://localhost:6001/iniciativas?zoom=9&centerLat=38&centerLng=-9&baseLayer=mapquest
                // &types=type_transition&types=type_other
                // &domains=domain_agriculture&domains=domain_husbandry

                query: {
                    zoom: Joi.number().integer().min(6).max(13).default(7),
                    centerLat: Joi.number().default(39.5676),
                    centerLng: Joi.number().default(-8.7068),
                    baseLayer: Joi.string().insensitive().valid(internals.validation.baseLayersIds).default("stamen"),
                    types: Joi.array().items( Joi.string().valid(internals.validation.typesIds) ).single(),
                    domains: Joi.array().items( Joi.string().valid(internals.validation.domainsIds) ).single()
                }
            },
*/
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

    /*            
            validate: {
                // example: http://localhost:6001/iniciativas?zoom=9&centerLat=38&centerLng=-9&baseLayer=mapquest
                // &types=type_transition&types=type_other
                // &domains=domain_agriculture&domains=domain_husbandry

                query: {
                    zoom: Joi.number().integer().min(6).max(13).default(7),
                    centerLat: Joi.number().default(39.5676),
                    centerLng: Joi.number().default(-8.7068),
                    baseLayer: Joi.string().insensitive().valid(internals.validation.baseLayersIds).default("stamen"),
                    types: Joi.array().items( Joi.string().valid(internals.validation.typesIds) ).single(),
                    domains: Joi.array().items( Joi.string().valid(internals.validation.domainsIds) ).single()
                }
            },
*/
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

                var context = {
                    urlParam1: "inserir-evento"
                };

                return reply.view("inserir-evento.html", {ctx: context});
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
        path: "/temp",
        method: "GET",
        config: {
            handler: function(request, reply) {

                return reply.view("temp.html");
            },
        }
    });

	return next();
};

exports.register.attributes = {
    name: "rede-convergir-web",
    dependencies: ["hapi-auth-session-memory"]
};