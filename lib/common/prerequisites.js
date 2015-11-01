var Hoek = require("hoek");
//var Config = require("config");
var _ = require("underscore");
var Boom = require("boom");
var Embed = require("embed-video");
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
	url = url.substring(url.indexOf("src"));

	url = "<iframe width='100%' height='340' " + url;
	//url = "<iframe width='100%'  " + url;
	console.log(url)
	return url;
};

internals.getInitiativeType = function(typeId){
	var mapping = {
		"type_permaculture": "Permacultura",
		"type_transition": "Transição",
		"type_soil_nature": "Gestão da Terra e da Natureza",
		"type_construction": "Espaço Construído",
		"type_tools": "Ferramentas e Tecnologias",
		"type_culture": "Cultura e Educação",
		"type_health": "Saúde e Bem-Estar Espiritual",
		"type_economy": "Economia e Finanças",
		"type_community": "Uso da Terra e Comunidade",
	};
	return mapping[typeId];
};

internals.topLevelDomains = [".com", ".org", ".net", ".info", ".biz", ".me", ".pt", ".es"];

internals.isUrl = function(contact){

	var isUrl = false;
	for(var i=0; i<internals.topLevelDomains.length; i++){
		if(contact.indexOf(internals.topLevelDomains[i]) > 0){
			isUrl = true;
			break;
		}
	}

	return isUrl;
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

		    		// computed property: type
		    		data[0].type = internals.getInitiativeType(data[0].typeId) || data[0].typeOther;

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




