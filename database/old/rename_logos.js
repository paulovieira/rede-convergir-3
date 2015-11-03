var Fs = require("fs");
require('shelljs/global');
var _ = require('underscore');
var Glob = require("glob");

var logosOld = Glob.sync("*");
//console.log(logosOld)

var template = _.template("mv <%= oldLogo %> <%= newLogo %>");

Fs.readFile("../db_151022_new.json", function(err, data){
    if(err){
        throw err;
    }

    data = JSON.parse(data);
    console.log("number of initiatives: ", data.length);


	for(var i=0; i<logosOld.length; i++){

		var initiative = _.where(data, { logoOld: logosOld[i] });
		if(!initiative || initiative.length !== 1){
			console.log("i: ", i)
			console.log("logosOld[i]: ", logosOld[i])
			throw new Error("initiative not found");
		}

		console.log("old logo: ", logosOld[i]);
		console.log("new logo: ", initiative[0].logo);

	}
});
/*
var result, command, output, line;

for(var i=0; i<logos.length; i++){

	command = template({ 
		dbname: dbname, 
		filename: scripts[i] ,
		psqlPath: psqlPath
	});

	console.log(Chalk.blue.bold("\n[shelljs] executing \'" + command + "\'"));
	result = exec(command);

	if(result.code !== 0){
		console.log(Chalk.white.bgRed.bold("\n[shelljs] there was error running the sql scripts!"));
		exit(1);
		return;  // is it necessary?
	}

	var output = result.output.split("\n");
	for(var j=0; j<output.length; j++){
		line = output[j].toLowerCase();

		if(line.indexOf("error") >= 0){

			// safely ignore the lines that say this
			if(line.indexOf("already exists") >= 0){
				continue;
			}

			console.log(Chalk.white.bgRed.bold("\n[shelljs] there was error running the sql scripts!"));
			exit(1);	
			return;  // is it necessary?				
		}
	}

}

// if we got it here, everything should be fine 
console.log(Chalk.green.bold("\n[shelljs] sql scripts ran successfully!"));
*/