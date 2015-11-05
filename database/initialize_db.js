var Fs = require("fs-extra");
var JSON5 = require("json5");
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

// the order in the array returned by glob is alphabetical, so we can manually defined the order
// using numbers in the filename

// first we run the scripts for the tables and functions
var scripts = [];
scripts = scripts.concat(Glob.sync("database/10_*/*.sql"));
scripts = scripts.concat(Glob.sync("database/20_*/*.sql"));


var psqlTemplate = _.template("<%= psqlPath %> --dbname <%= dbname %> --file=<%= filename %>");
var command;

for(var i=0; i<scripts.length; i++){

	command = psqlTemplate({ 
		dbname: dbname, 
		filename: scripts[i] ,
		psqlPath: psqlPath
	});
	execPsql(command);
}

// now we run the scripts for the initial data (case by case)
scripts = [];
scripts = scripts.concat(Glob.sync("database/90_*/*.sql"));

// populate countries table

var script = "./database/90_initial_data/9011_populate_countries.sql";
command = psqlTemplate({ 
	dbname: dbname, 
	filename: script,
	psqlPath: psqlPath
});
execPsql(command);


// populate definitions table; here we read the data from a json file and manually insert;
// for each object in the json file we create the corresponding psql command; this command is
// written to a temporary file because the quotes are difficult to handle when we try to execute 
// directly (using the "--command" options in psql)

var inputData = "./database/90_initial_data/9040_populate_definitions.json";
var array = JSON5.parse(Fs.readFileSync(inputData, "utf8"));

var upsertTemplate = _.template("   SELECT * FROM definitions_upsert('\n<%= inputObj %>\n');   ")
var tempFile = "./database/90_initial_data/temp.sql";
var commandStr;

for(var i=0; i<array.length; i++){

	// write the psql command to a temporary file
	commandStr = upsertTemplate({inputObj: JSON.stringify(array[i]) });
	Fs.writeFileSync(tempFile, commandStr);

	// execute the command in the temporary file
	command = psqlTemplate({ 
		dbname: dbname, 
		filename: tempFile,
		psqlPath: psqlPath
	});
	execPsql(command);
}

Fs.removeSync(tempFile);


// if we got it here, everything should be fine 
console.log(Chalk.green.bold("\n[shelljs] sql scripts ran successfully!"));


function execPsql(command){

	var result, line, output;
	console.log(Chalk.blue.bold("\n[shelljs] executing \'" + command + "\'"));

	result = exec(command);

	if(result.code !== 0){
		console.log(Chalk.white.bgRed.bold("\n[shelljs] there was error running the sql scripts!"));
		exit(1);
	}

	output = result.output.split("\n");
	for(var j=0; j<output.length; j++){
		line = output[j].toLowerCase();

		if(line.indexOf("error") >= 0){

			// safely ignore the lines that say this (it's not an error that should
			// prevent the other scripts to run)
			if(line.indexOf("already exists") >= 0){
				continue;
			}

			console.log(Chalk.white.bgRed.bold("\n[shelljs] there was error running the sql scripts!"));
			exit(1);	
		}
	}
};
