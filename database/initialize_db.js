var Path = require("path");
var Fs = require("fs-extra");
var JSON5 = require("json5");
var execSync = require("child_process").execSync;
var Glob = require("glob");
var Chalk = require("chalk");

var internals = {};

internals.dbname = process.argv[2];
internals.psqlPath = process.argv[3];

if(!internals.dbname){
	console.log("Usage: " + process.argv[0] + " " + process.argv[1] + " <database_name> [<psql>]");
	process.exit();
}

// use the default psql if not given
// if we are using the beta version, use something like /home/pvieira/postgres-9.6-beta/bin/psql
if(!internals.psqlPath){
	internals.psqlPath = "psql";
}


internals.createTables = function(){

	// the order in the array returned by glob is lexicographic, so we can define the order
	// using numbers in the filename
	var scripts = Glob.sync("database/10_*/*.sql");

	for(var i=0; i<scripts.length; i++){
		// call psql in a new shell
		internals.execPsql(scripts[i]);
	}
};

internals.createFunctions = function(){

	var scripts = Glob.sync("database/20_*/*.sql");

	for(var i=0; i<scripts.length; i++){
		// call psql in a new shell
		internals.execPsql(scripts[i]);
	}
};

internals.createInitialData = function(){

	// for the scripts with initial data we should do it case by case

	// a) countries
	var script = "./database/90_initial_data/9011_populate_countries.sql";
	internals.execPsql(script);

	// b) definitions

	// here we read the initial data from a json file and create a sql file on-the-fly;
	// data is inserted using the auxiliary "definitions_upsert" function (already defined in one of the previous scripts);
	// 
	// for each object in the json file we create the corresponding sql command; example:
	//
	//   SELECT * FROM definitions_upsert('{ name: "xyz", age: 10}')
	//
	// this command is written to a temporary file, which is then executed with psql as above 
	// (using the '--file' options)
	//
	// we do it this way because the quotes are difficult to handle in the shell (if the sql command was given
	// directly with '--command' option)

	var inputData = "./database/90_initial_data/9040_populate_definitions.json";
	var array = JSON5.parse(Fs.readFileSync(inputData, "utf8"));

	var tempDir = Path.join(__dirname, "temp_" + String(Date.now()).substr(-5));
	Fs.mkdirsSync(tempDir);

	for(i=0; i<array.length; i++){

		var tempSql = `

				SELECT * FROM definitions_upsert('
					${ JSON.stringify(array[i]) }
				');
		`;

		// write the sql command to a file in the temporary dir
		var tempFile = Path.join(tempDir, `temp_${ i }.sql`);
		Fs.writeFileSync(tempFile, tempSql);

		// call psql as before (using a new shell)
		internals.execPsql(tempFile);
	}

	// "remove" method from fs-extra ("directory can have contents")
	Fs.removeSync(tempDir);

};

internals.execPsql = function(sqlFile){

	var command = `${ internals.psqlPath } --dbname ${ internals.dbname } --file=${ sqlFile }`;
	console.log(Chalk.blue.bold("\nexecuting \'" + command + "\'"));

	var output;
	try{
		output = execSync(command, { encoding: "utf8" });
	}
	catch(err){
		console.log(Chalk.white.bgYellow.bold(err.message.trim()));
		console.log(Chalk.white.bgRed.bold("\nthere was error running the sql scripts!"));
		process.exit(1);
	}

	// parse the output from psql
	output = output.split("\n");
	for(var j=0; j<output.length; j++){
		var line = output[j].toLowerCase().trim();

		if(line.indexOf("error") >= 0){

			// safely ignore the lines that say this (it's not an error that should
			// prevent the other scripts to run)
			if(line.indexOf("already exists") >= 0){
				continue;
			}

			console.log(Chalk.white.bgYellow.bold(line));
			console.log(Chalk.white.bgRed.bold("\nthere was error running the sql scripts!"));
			process.exit(1);
		}
	}

};


// first we run the scripts for the tables and postgres functions
internals.createTables();
internals.createFunctions();
internals.createInitialData()

console.log(Chalk.green.bold("\nsql scripts ran successfully!"));




