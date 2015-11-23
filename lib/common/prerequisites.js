var Hoek = require("hoek");
//var Config = require("config");
var _ = require("underscore");
var _s = require("underscore.string");
var Boom = require("boom");
var Embed = require("./embed-video-temp");
var Moment = require("moment");
var Utils = require("./utils");
var Seneca = require("./seneca");


var internals = {};

internals.getEmbeddedUrl = function(url){
		
	var url = Embed(url, {
		query: {
			rel: 0,  // whether to show related videos at the end 
			autohide: 0,  // keep the progress bar and player controls visible always (deprecated for the HTML5 player)
		}
	});

	if(!url){
		return undefined;
	}

	url = url.substring(url.indexOf("src"));

	url = "<iframe width='100%' height='340' " + url;
	//url = "<iframe width='100%'  " + url;
	console.log(url)
	return url;
};


internals.topLevelDomains = [".com", ".org", ".net", ".info", ".biz", ".me", ".pt", ".es"];

internals.isUrl = function(contact){
//return false;
	var isUrl = false;
	for(var i=0; i<internals.topLevelDomains.length; i++){
		if(contact.indexOf(internals.topLevelDomains[i]) > 0){
			isUrl = true;
			break;
		}
	}

	return isUrl;
};

internals.keys = ["id", "name", "typeId", "typeOther", "slug", "description", "logo", "coordinates", "domains"];

exports.readInitiativesSlim = {
	method: function(request, reply){

		Utils.logCallsite(Hoek.callStack()[0]);

		Seneca.actAsync({
		        role: "initiatives",
		        cmd: "read",
		        searchConditions: {}
		    })
		    .then(function(data){

		    	// is this more memory efficient?
		    	var l = data.length, output = [];
		    	for(var i=0; i<l; i++){
					output.push({});
					for(var j=0, l2 = internals.keys.length; j<l2; j++){
						output[i][internals.keys[j]] = data[i][internals.keys[j]];
					}
		    	}

		    	data = undefined;
		    	reply(output);
		    })
		    .catch(function(err){

		        err = err.isBoom ? err : Boom.badImplementation(err.message);
		        return reply(err);
		    });
	},
	assign: "initiatives"
};

exports.readInitiativeBySlug = {

	method: function(request, reply){

		Utils.logCallsite(Hoek.callStack()[0]);

		Seneca.actAsync({
		        role: "initiatives",
		        cmd: "read",
		        searchConditions: { "slug": request.params.slug }
		    })
		    .then(function(data){

		    	// computed property: fullAddress
		    	var temp = [];
		    	if(data.length > 0){
		    		if(data[0].street){     temp.push(data[0].street);     }
		    		if(data[0].city){       temp.push(data[0].city);       }
		    		if(data[0].postalCode){ temp.push(data[0].postalCode); }

		    		data[0].fullAddress = temp.join(", ");
		    		//console.log("data.fullAddress: ", data.fullAddress)

		    		// computed property: url for the embedded video
		    		if(data[0].videoUrl){  
		    			data[0].videoUrl = internals.getEmbeddedUrl(data[0].videoUrl);
		    		}

		    		// computed property: contactOther might be a link
		    		if(internals.isUrl(data[0].contactOther)){
		    			data[0].contactOther = "<a target='_blank' href='" + data[0].contactOther +  "'>" + data[0].contactOther + "</a>";
		    		}

		    		// computed property: human-friendly date startDateHuman
		    		var m = Moment(data[0].startDate).locale("pt");
		    		data[0].startDateHuman = m.format("MMMM") + " de " + m.format("YYYY");

		    	}
		    	
		        return reply(data);
		    })
		    .catch(function(err){

		        err = err.isBoom ? err : Boom.badImplementation(err.message);
		        return reply(err);
		    });

	},
	assign: "initiative"
};

exports.readDefinitions = {

	method: function(request, reply){

		Utils.logCallsite(Hoek.callStack()[0]);

		Seneca.actAsync({
		        role: "definitions",
		        cmd: "read",
		        searchConditions: {}
		    })
		    .then(function(data){
		    	
		        return reply(_.indexBy(data, "id"));
		    })
		    .catch(function(err){

		        err = err.isBoom ? err : Boom.badImplementation(err.message);
		        return reply(err);
		    });

	},
	assign: "definitions"
};

exports.readDefinitions2 = {

	method: function(request, reply){

		Utils.logCallsite(Hoek.callStack()[0]);

		Seneca.actAsync({
		        role: "definitions",
		        cmd: "read",
		        searchConditions: {}
		    })
		    .then(function(data){

		    	// add the "other" to domains and types (make sure they are the last ones for the respective category)
		  //   	data.push(
				// 	{
				// 	    id: 'domain_999_other',
				// 	    title: {
				// 	        pt: 'Outro'
				// 	    },
				// 	    description: {
				// 	        pt: 'Outro domínio',
				// 	    }
				// 	}
				// );

		  //   	data.push(
				// 	{
				// 	    id: 'type_999_other',
				// 	    title: {
				// 	        pt: 'Outro'
				// 	    },
				// 	    description: {
				// 	        pt: 'Outro tipo',
				// 	        _order: 'type999'
				// 	    }
				// 	}
				// );

		  //   	data.push(
				// 	{
				// 	    id: 'target_other',
				// 	    title: {
				// 	        pt: 'Outro'
				// 	    },
				// 	    description: {
				// 	        pt: 'Outro público alvo',
				// 	        _order: 'target999'
				// 	    }
				// 	}
				// );
		    
    			var category, categories = ["domain", "event_type", "initiative_status", "scope", "target", "type", "visitors"];
                var definitions = {};
                for(var i=0; i<categories.length; i++){
                	category = categories[i];
                	definitions[category]
                    definitions[category] = data.filter(function(obj){

                                        return obj.id.indexOf(category) === 0;
                                    });

                }

		        return reply(definitions);
		    })
		    .catch(function(err){

		        err = err.isBoom ? err : Boom.badImplementation(err.message);
		        return reply(err);
		    });

	},
	assign: "definitions"
};



