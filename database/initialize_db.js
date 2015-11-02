require('shelljs/global');
var _ = require('underscore');
var Glob = require("glob");
var Chalk = require('chalk');

var dbname = process.argv[2];
var psqlPath = process.argv[3];

if(!dbname){
	console.log("Usage: " + process.argv[0] + " " + process.argv[1] + " <database_name>");
}

// use the default psql if not given
// for dev: /home/pvieira/postgres9.5/bin/psql
if(!psqlPath){
	psqlPath = "psql";
}

var scripts = Glob.sync("database/**/*.sql");
var template = _.template("<%= psqlPath %> --dbname <%= dbname %> --file=<%= filename %>");

var result, command, output, line;

for(var i=0; i<scripts.length; i++){

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
