var Fs = require("fs"),
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
			}
		});

		// use more meaningful keys
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
			"scopeArea": "scopearea.0",
			"target": "target.0",
			"influence": "projectinfluence.0",
			"physicalArea": "areaha.0",
			"videoUrl": "video.0",
			"docUrl": "docurl.0",

    	});

    	// execute some post-processing
    	outputData.forEach(function(obj){

    		// domains
    		if(_s.trim(obj.domains)!==""){
    			obj.domains = obj.domains.split(",");	
    		}
    		else{
    			obj.domains	= [];
    		}

    		// target
    		if(_s.trim(obj.target)!==""){
    			obj.target = obj.target.split(",");	
    		}
    		else{
    			obj.target	= [];
    		}

    		console.log("TODO: use moment to convert the date field to ISO...")


    		if(obj.videoUrl){
    			obj.videoUrl = "https://www.youtube.com/watch?v=" + obj.videoUrl;
    		}
						
    	});
    	

    	console.log("Number of projects: ", outputData.length);

    	// make sure all objects in the array 

        Fs.writeFile(outputFile, JSON.stringify(outputData, null, 4), "utf8", function(){

        	console.log("All done");	
        });
    });
});
