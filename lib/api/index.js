var Path = require("path");
var Config = require("config");
var Hoek = require("hoek");
var Boom = require("boom");
var Utils = require("../common/utils");
var Initiatives = require("./handlers/initiatives");

var internals = {
	apiPrefix: Config.get("apiPrefix.v1")
};

internals.endpoints = [

	// initiatives
	 { method: "GET",     path: "/initiatives/{ids}",   config: Initiatives.config.read    },
	 { method: "GET",     path: "/initiatives",         config: Initiatives.config.readAll },
	 { method: "POST",    path: "/initiatives",         config: Initiatives.config.create  },
	 { method: "PUT",     path: "/initiatives/{ids}",   config: Initiatives.config.update  },
	// { method: "DELETE",  path: "/initiatives/{ids}",   config: Initiatives.config.delete  },


	// catch all for any other api endpoint, that is, any other request for "/api/v1" 
	// (regardless of the method)

	// note: we list explicitely all the http method (instead of using "*") to make sure this route
	// is more specific than the catch-all route for web pages
	{ 
		method: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		path: "/{any*}",        
		config: {
			handler: function(request, reply){
				return reply(Boom.notFound("Invalid API endpoint."));
			}
		} 
	},

];

// add the path prefix for all API route paths
internals.endpoints.forEach(function(routeObj){
    
	routeObj.path = internals.apiPrefix + routeObj.path
});

exports.register = function(server, options, next){

	console.log("rede-convergir-api");

	server.route(internals.endpoints)
	
	return next();
};

exports.register.attributes = {
    name: "rede-convergir-api",
    version: "0.0.1"
};