var Fs = require("fs"),
    Path = require("path"),
    Xml2js = require("xml2js"),
    Hoek = require("hoek"),
    _ = require("underscore"),
    _s = require("underscore.string");


var parser = new Xml2js.Parser();

var inputFile  = "./db_151119.xml";
var outputFile = "./db_151119.json";


var internals = {};

Fs.readFile(inputFile, function(err, inputData) {

    parser.parseString(inputData, function(err, outputData) {

    	// make sure all objects have known keys
		var knownKeys = ["projectid","projectname","projectdescription","projecttype","domains","projecturl","logo","street","postalcode","city","lat","lng","startdate","registrydate","updatedate","companyproject","visitors","groupsize","scopearea","target","projectinfluence","areaha","video","docurl","contactname","email","phone","othercontact"];

		outputData.convergir.project.forEach(function(obj){

			if(_.difference(Object.keys(obj), knownKeys).length>0){
				console.log("WARNING: project " + obj.projectid + " has some unknown key");
                console.log(_.difference(Object.keys(obj), knownKeys));
			}
		});

		// the keys should be more clear
    	outputData = Hoek.transform(outputData.convergir.project, {

    		// basic fields
			"id": "projectid.0",
			"name": "projectname.0",
			"description": "projectdescription.0",
			"type": "projecttype.0",
			"domains": "domains.0",
			"url": "projecturl.0",

			// contacts and location
			"contactName": "contactname.0",
			"email": "email.0",
			"phone": "phone.0",
			"contactOther": "othercontact.0",
			"logo": "logo.0",
			"street": "street.0",
			"city": "city.0",
			"postalCode": "postalcode.0",
			"lat": "lat.0",
			"lng": "lng.0",
			"promoter": "companyproject.0",

			// temporal informations
			"startDate": "startdate.0",
			"registryDate": "registrydate.0",
			"updateDate": "updatedate.0",

			// other informations
			"visitors": "visitors.0",
			"groupSize": "groupsize.0",
			"scope": "scopearea.0",
			"target": "target.0",
			"influence": "projectinfluence.0",
			"physicalArea": "areaha.0",
			"videoUrl": "video.0",
			"docUrl": "docurl.0",

    	});

    	// execute some post-processing
    	outputData.forEach(function(obj, i){

            // all values from the old database are strings; we should trim
            Object.keys(obj).forEach(function(key){
                obj[key] = _s.trim(obj[key]);
            });

            // id should start from 1
            obj.idOld = obj.id;
            obj.id = i + 1;

            // logo should be the slugified name
            if(obj.logo){
                obj.logoOld = obj.logo;
                obj.logo = _s.slugify(obj.name) + "-" + obj.id + Path.extname(obj.logo); 
            }

            // correct the type (we should be using the corresponding id)
            internals.correctType(obj);

            // correct the scope
            internals.correctScope(obj);

            // correct the visitors
            internals.correctVisitors(obj);

            // domains and target are comma-separated lists; makes more sense to use arrays
            obj.domains = obj.domains ? obj.domains.split(",") : [];
            internals.correctDomain(obj);

            // do the same for target
            obj.target  = obj.target  ? obj.target.split(",")  : [];
            internals.correctTarget(obj);

            // dates should be in ISO8601
            obj.startDate    = internals.getISODate(obj.startDate);
            obj.registryDate = internals.getISODate(obj.registryDate);
            obj.updateDate   = internals.getISODate(obj.updateDate);

            // coordinates should be an array: [lat, lng]
            obj.coordinates = [Number(obj.lat), Number(obj.lng)];
            delete obj.lat;
            delete obj.lng;

            // influence should be an array with min/max
            var influence = [];

            if(obj.influence.indexOf("<10") >= 0 || obj.influence === "10" || obj.influence === ""){
                //console.log("&lt;10")
                influence[0] = 0;
                influence[1] = 10;
            }
            else if(obj.influence.indexOf(">10.000") >= 0){
                influence[0] = 10000;
                influence[0] = 999999999;
            }
            else if(obj.influence.indexOf("a") >= 0){
                influence = obj.influence.split("a");
                influence[0] = Number(influence[0]);
                influence[1] = Number(influence[1]);
            }
            else{
                console.log(obj.name);
                throw new Error("influence")
            }

            obj.influence = influence;

            // videosUrl are simply an id to an youtube video
    		if(obj.videoUrl){
    			obj.videoUrl = "https://www.youtube.com/watch?v=" + obj.videoUrl;
    		}
						
    	});
    	

        var numberOfProjects = outputData.length;
    	console.log("Number of projects: ", numberOfProjects);

        Fs.writeFile(outputFile, JSON.stringify(outputData, null, 4), "utf8", function(err){

            if(err){
                throw err;
            }
            
        	console.log("All done");	
        });

        // create bash script to fetch all the logos
        var wgetLogos = "#!/bin/bash\n";
        var logosCount = 0;
        var missingLogoOutput = "";

        outputData.forEach(function(obj){

            if(obj.logo){
                wgetLogos += "wget http://www.redeconvergir.net/projects/" + obj.idOld + "/" + obj.logoOld + " -O " + obj.logo +  "\n";    
                logosCount++;
            }
            else{
                missingLogoOutput += obj.name + "\n" + obj.email + "\n\n";
            }
            
        });

        // create bash script to fetch all the associated documents
        var wgetDocs = "#!/bin/bash\n";
        var docCount = 0;

        outputData.forEach(function(obj){
            if(obj.docUrl){
                wgetDocs += "wget http://www.redeconvergir.net/projects/" + obj.id + "/" + obj.docUrl + "\n";    
                docCount++;
            }
        });
        console.log("%d projects have associated document", docCount);

        Fs.writeFile("wget_logos.sh", wgetLogos, "utf8", function(){
            console.log("TODO: rename logo and associate with the project")
        });

        Fs.writeFile("wget_associated_doc.sh", wgetDocs, "utf8", function(){
        });

        var missingLogosCount = numberOfProjects - logosCount;
        if(missingLogosCount > 0){

            Fs.writeFile("projects_with_missing_logo.txt", missingLogoOutput, "utf8", function(){

                console.log("%d projects have the logo missing", missingLogosCount);
            });        
        }

    });
});


internals.getISODate = function(d){

    var dateParts = d.split("/");
    if(dateParts.length!==3){
        throw new Error("date is invalid");
    }

    return (new Date(dateParts[2], dateParts[1], dateParts[0])).toJSON();
};


internals.correctDomain = function(payload){

    var domains = payload.domains;
    var domainsOther = [];

    for(var i=0; i<domains.length; i++){
        
        if(domains[i] === "Agricultura"){
            domains[i] = "domain_001_agriculture";
        }
        else if(domains[i] === "Pecuária"){
            domains[i] = "domain_002_husbandry";
        }
        else if(domains[i] === "Bio-Construção"){
            domains[i] = "domain_003_bioconstruction";
        }
        else if(domains[i] === "Eco-Tecnologia"){
            domains[i] = "domain_004_ecotechnology";
        }
        else if(domains[i] === "Arte"){
            domains[i] = "domain_005_art";
        }
        else if(domains[i] === "Educação"){
            domains[i] = "domain_006_education";
        }
        else if(domains[i] === "Saúde"){
            domains[i] = "domain_007_health";
        }
        else if(domains[i] === "Espiritualidade"){
            domains[i] = "domain_008_spirituality";
        }
        else if(domains[i] === "Economia alternativa"){
            domains[i] = "domain_009_economy";
        }
        else if(domains[i] === "Partilha de terra ou equipamentos"){
            domains[i] = "domain_010_sharing";
        }
        else if(domains[i] === "Ferramentas Sociais"){
            domains[i] = "domain_011_tools";
        }
        else if(domains[i] !== ""){
            // this domain is not a pre-defined
            domainsOther.push(domains[i]);
            domains[i] = "domain_999_other";
        }
    }

    payload.domains = _.compact(payload.domains);

    // if the array is empty we get the empty string
    payload.domainsOther = domainsOther.join("; ");

};

internals.correctTarget = function(payload){

    var target = payload.target;
    var targetOther = [];

    for(var i=0; i<target.length; i++){
        
        if(target[i] === "Crianças"){
            target[i] = "target_001_children";
        }
        else if(target[i] === "Adolescentes"){
            target[i] = "target_002_teenagers";
        }
        else if(target[i] === "Adultos"){
            target[i] = "target_003_adults";
        }
        else if(target[i] === "Idosos"){
            target[i] = "target_004_seniors";
        }
        else if(target[i] === "Famílias"){
            target[i] = "target_005_families";
        }
        else if(target[i] === "Pessoas com deficiência"){
            target[i] = "target_006_handicapped";
        }
        else if(target[i] === "Crianças com necessidades educativas especiais"){
            target[i] = "target_007_special_need_children";
        }
        else if(target[i] === "Geral"){
            target[i] = "target_008_general";
        }
        else if(target[i] !== ""){
            // this target is not a pre-defined
            targetOther.push(target[i]);
            target[i] = "target_999_other";
        }
    }

    payload.target = _.compact(payload.target);

    // if the array is empty we get the empty string
    payload.targetOther = targetOther.join("; ");

};

internals.correctType = function(payload){

    var type = payload.type;
    payload.typeOther = undefined;

    if(type==="Permacultura"){
        payload.typeId = "type_001_permaculture";
    }
    else if(type==="Transição"){
        payload.typeId = "type_002_transition"   ;
    }
    else if(type==="Gestão da Terra e da Natureza"){
        payload.typeId = "type_003_soil_nature";
    }
    else if(type==="Espaço Construído"){
        payload.typeId = "type_004_construction";
    }
    else if(type==="Ferramentas e Tecnologias"){
        payload.typeId = "type_005_tools";
    }
    else if(type==="Cultura e Educação"){
        payload.typeId = "type_006_culture";
    }
    else if(type==="Saúde e Bem-Estar Espiritual"){
        payload.typeId = "type_007_health";
    }
    else if(type==="Economia e Finanças"){
        payload.typeId = "type_008_economy";
    }
    else if(type==="Uso da Terra e Comunidade"){
        payload.typeId = "type_009_community";
    }
    else{
        payload.typeId = "type_999_other";
        if(type===""){
            throw new Error("type is 'other', but there's nothing");
        }

        console.log("type is other: ", type)
        payload.typeOther = type;
    }

    delete payload.type;

};

internals.correctScope = function(payload){

    var scope = payload.scope;

    if(scope==="Urbano"){
        payload.scopeId = "scope_001_urban";
    }
    else if(scope==="Rural"){
        payload.scopeId = "scope_002_rural";
    }
    else if(scope==="Urbano e Rural" || scope === ""){
        payload.scopeId = "scope_003_mixed";
    }
    else{
        console.log("scope: ", scope)
        console.log("name: ", payload.name)
        throw new Error("scope is unknown");
    }

    delete payload.scope;

};

internals.correctVisitors = function(payload){

    var visitors = payload.visitors;

    if(visitors==="Sim" || visitors===""){
        payload.visitorsId = "visitors_001_yes";
    }
    else if(visitors==="Não"){
        payload.visitorsId = "visitors_002_no";
    }
    else if(visitors==="Sujeito a confirmação após contacto"){
        payload.visitorsId = "visitors_003_confirmation";
    }
    else{
        console.log("visitors: ", visitors)
        console.log("name: ", payload.name)
        throw new Error("visitors is unknown");
    }

    delete payload.visitors;

};
