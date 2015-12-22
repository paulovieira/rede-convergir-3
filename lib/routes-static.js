var Path = require("path");
var Config = require("config");

// route for the client apps and libraries (static files like css, js, etc); relative to the ghost-proxy plugin

// note that the a route configuration with the directory handler is only possible after
// the inert plugin has been registered

var internals = {};

exports.register = function(server, options, next){

    // route for the client apps (static files: js, css, etc)
    server.route({
        path: "/rc-app/{anyPath*}",
        method: "GET",
        config: {
            handler: {
                directory: { 
                    path: Path.join(Config.get("rootDir"), "lib/web/client/rc-app"),
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
            },
            auth: false,
        }
    });

    server.route({
        path: "/rc-events/{anyPath*}",
        method: "GET",
        config: {
            handler: {
                directory: { 
                    path: Path.join(Config.get("rootDir"), "lib/web/client/rc-events"),
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
            },
            auth: false,
        }
    });

    server.route({
        path: "/rc-dashboard/{anyPath*}",
        method: "GET",
        config: {
            handler: {
                directory: { 
                    path: Path.join(Config.get("rootDir"), "lib/web/client/rc-dashboard"),
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
            },
            auth: false,
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
            },
            auth: false,
        }
    });

    server.route({
        path: "/favicon.ico",
        method: "GET",
        config: {
            handler: {
                file: Path.join(Config.get("rootDir"), "lib/web/client/static/_images/favicon.ico"),
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

exports.register.attributes = {
    name: "routes-static",
    dependencies: ["inert"]
};
