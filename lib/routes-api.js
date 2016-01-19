var Path = require("path");
var Boom = require("boom");
//var Hoek = require("hoek");
//var Config = require("config");
//var Utils = require("./common/utils");

var Initiatives = require("./api-handlers/initiatives");

var internals = {};

exports.register = function(server, options, next){

	// note that the path of the api endpoints will be prepended with a prefix (given in the 
	// plugin configuration)
	var endpoints = [

		// initiatives
		 { method: "GET",     path: "/initiatives/{ids}",   config: Initiatives.config.read    },
		 { method: "GET",     path: "/initiatives",         config: Initiatives.config.readAll },
		 { method: "POST",    path: "/initiatives",         config: Initiatives.config.create  },
		 { method: "PUT",     path: "/initiatives/{ids}",   config: Initiatives.config.update  },
		 { method: "DELETE",  path: "/initiatives/{ids}",   config: Initiatives.config.delete  },
		 //{ method: "GET",     path: "/initiatives-test",         config: Initiatives.config.readTest },

		// catch-all endpoint, that is, any other request for "/api/v1" (regardless of the method)

		// we list explicitely all the http method (instead of using "*") to make sure this route
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

	server.route(endpoints);

	return next();
};

exports.register.attributes = {
    name: Path.parse(__filename).name,  // use the name of the file
    dependencies: []
};