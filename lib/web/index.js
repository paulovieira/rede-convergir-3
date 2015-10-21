var Path = require("path");
var Config = require("config");
var Hoek = require("hoek");
var Utils = require("../common/utils");

var internals = {};

exports.register = function(server, options, next){

	server.views(Config.get("hapi.views"));

    server.route({
        path: "/",
        method: "GET",
        config: {
            handler: function(request, reply) {

                return reply.view("home.html");
            }
        }
    });

    server.route({
        path: "/login",
        method: "GET",
        config: {
            handler: function(request, reply) {

                return reply.view("login.html");
            }
        }
    });

    server.route({
        path: "/projectos",
        method: "GET",
        config: {
            handler: function(request, reply) {

                var context = {
                    urlParam1: "projectos"
                };

                return reply.view("projectos.html", {ctx: context});
            }
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
            }
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
            }
        }
    });



    server.route({
        path: "/temp",
        method: "GET",
        config: {
            handler: function(request, reply) {

                return reply.view("temp.html");
            }
        }
    });

    // route for the client apps (static files: js, css, etc)
    server.route({
        path: "/rc-app/{anyPath*}",
        method: "GET",
        config: {
            handler: {
                directory: { 
                    path: Path.join(Config.get("rootDir"), "lib/web/client/rc-app") 
                }
            },
            cache: {
                privacy: "public",
                expiresIn: 3600000
            },
            cors: {
                methods: ["GET"]
            }
        }
    });

    server.route({
        path: "/rc-calendar/{anyPath*}",
        method: "GET",
        config: {
            handler: {
                directory: { 
                    path: Path.join(Config.get("rootDir"), "lib/web/client/rc-calendar") 
                }
            },
            cache: {
                privacy: "public",
                expiresIn: 3600000
            },
            cors: {
                methods: ["GET"]
            }
        }
    });

	// route for the client libraries (static files: css, js, etc)
    server.route({
        path: "/static/{anyPath*}",
        method: "GET",
        config: {
            handler: {
                directory: { 
                    path: Path.join(Config.get("rootDir"), "lib/web/client/static"),
                    index: false,
                    listing: false,
                    showHidden: false
                }
            },
            cache: {
                privacy: "public",
                expiresIn: 3600000
            },
            cors: {
                methods: ["GET"]
            }
        }
    });


	return next();
};

exports.register.attributes = {
    name: "cirac-web",
    version: "0.0.1"
};