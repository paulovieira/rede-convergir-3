var Path = require("path");
var Boom = require("boom");
var Promise = require('bluebird');
var Db = require("../../database");
//var Hoek = require("hoek");
//var Utils = require("./common/utils");

var Initiatives = require("./initiatives");

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

		 //
		 
		{ 
			method: "PUT",
			path: "/log-download",
			config: {
				handler: function(request, reply){

					var resource = request.payload.resource || "";
					var data = JSON.stringify({
						type: "download",
						resource: resource,
						remoteAddress: request.info.remoteAddress,
						ts: (new Date()).toISOString()
					});

			    
				    Promise.resolve()
				    	.then(function(){

							var insertQuery = `INSERT INTO log(data) VALUES('${ data }');`;
				    		return Db.query(insertQuery);
				    	})
				        .then(function(){

				        	var selectQuery = `SELECT count(id) FROM log WHERE data->>'type'='download' AND data->>'resource'='${ resource }';`
				        	return Db.query(selectQuery);	
				        })
				        .then(function(res){

				        	var count = res[0].count;
				        	return reply({count: Number(count)});
				        });

				}
			}
		},

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
    name: Path.parse(__dirname).name,  // use the name of the file
    dependencies: []
};