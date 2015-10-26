var Fs = require("fs"),
    Path = require("path"),
    Xml2js = require("xml2js"),
    Hoek = require("hoek"),
    _ = require("underscore"),
    _s = require("underscore.string");


var parser = new Xml2js.Parser();

var inputFile  = "./db_151022.xml";
var outputFile = "./db_151022.json";

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
			"size": "groupsize.0",
			"scope": "scopearea.0",
			"target": "target.0",
			"influence": "projectinfluence.0",
			"physicalArea": "areaha.0",
			"videoUrl": "video.0",
			"docUrl": "docurl.0",

    	});

        var types = [];

    	// execute some post-processing
    	outputData.forEach(function(obj, i){

            types.push(obj.type);
            types = _.uniq(types);

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


            // domains and target are comma-separated lists; makes more sense to use arrays
            obj.domains = obj.domains ? obj.domains.split(",") : [];
            obj.target  = obj.target  ? obj.target.split(",")  : [];

            // dates should be in ISO8601
            obj.startDate    = getISODate(obj.startDate);
            obj.registryDate = getISODate(obj.registryDate);
            obj.updateDate   = getISODate(obj.updateDate);

            // coordinates should be an array: [lat, lng]
            obj.coordinates = [Number(obj.lat), Number(obj.lng)];
            delete obj.lat;
            delete obj.lng;

            // influence should be an array with min/max
            var influence = [];

            if(obj.influence.indexOf("<10") >= 0 || obj.influence === "10"){
                //console.log("&lt;10")
                influence[0] = 0;
                influence[1] = 10;
            }
            else if(obj.influence.indexOf(">10.000") >= 0){
                influence[0] = 10000;
            }
            else if(obj.influence.indexOf("a") >= 0){
                influence = obj.influence.split("a");
                influence[0] = Number(influence[0]);
                influence[1] = Number(influence[1]);
            }

            obj.influence = influence;

            // videosUrl are simply an id to an youtube video
    		if(obj.videoUrl){
    			obj.videoUrl = "https://www.youtube.com/watch?v=" + obj.videoUrl;
    		}
						
    	});
    	
        //console.log("types: ", types);

        var numberOfProjects = outputData.length;
    	console.log("Number of projects: ", numberOfProjects);

        Fs.writeFile(outputFile, JSON.stringify(outputData, null, 4), "utf8", function(){

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


function getISODate(d){

    var dateParts = d.split("/");
    if(dateParts.length!==3){
        throw new Error("date is invalid");
    }

    return (new Date(dateParts[2], dateParts[1], dateParts[0])).toJSON();
};
