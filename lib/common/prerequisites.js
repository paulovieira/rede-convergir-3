var Hoek = require("hoek");
var Config = require("config");
var _ = require("underscore");
var Db = require("../../database/")
var Utils = require("./utils");
var Boom = require("boom");

var internals = {};

exports.readInitiativeBySlug = {

	method: function(request, reply){

		Utils.logCallsite(Hoek.callStack()[0]);

		var pattern = {
			role: "initiatives", 
			cmd: "read",
			searchConditions: { "slug": request.params.slug }
		};

		request.server.seneca.act(pattern, function(err, data){

			if(err){
			    return reply(Boom.badImplementation(err.msg, err));
			}

			return reply(data);
		});
	},
	assign: "initiative"
};









