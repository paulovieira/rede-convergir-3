require('../config/load');

var Path = require("path");
var Config = require("nconf")
var Fs = require("fs-extra");
var JSON5 = require("json5");
//var execSync = require("child_process").execSync;
var Glob = require("glob");
var Chalk = require("chalk");
var Psql = require("psql-wrapper");

var internals = {};

internals.createTables = function(){

	// the order in the array returned by glob is lexicographic, so we can define the order
	// that the scripts will run by simply pre-pending numbers in the filename
	Glob.sync("database/10_*/*.sql").forEach(function(scriptPath){

		try{
			Psql({ file: scriptPath });
		}
		catch(err){
			process.exit();
		}

	});

};

internals.createFunctions = function(){

	Glob.sync("database/20_*/*.sql").forEach(function(scriptPath){

		try{
			Psql({ file: scriptPath });
		}
		catch(err){
			process.exit();
		}

	});

};

internals.insertInitialData = function(){

	// for the scripts with initial data we should do it case by case
	var inputFile, data, upsertQuery = '';


	// a) countries

	// here we read the initial data from a csv file and create an upsert command to be executed by psql
	inputFile = './database/90_initial_data/9011_populate_countries.csv';
	data = Fs.readFileSync(inputFile, 'utf8')
				.split('\n')
				.map( line => line.split('|'));

	for(var i=1; i<data.length; i++){

		if(data[i].length!==3){ throw new Error(JSON.stringify(data[i]))}
		upsertQuery += `   \
INSERT INTO countries(name, code, id)   \
VALUES ('${data[i][0]}', '${data[i][1]}', ${data[i][2]})   \
ON CONFLICT (code) DO UPDATE SET   \
	name = EXCLUDED.name,   \
	code = EXCLUDED.code,   \
	id = EXCLUDED.id;  \
`;

	}

	try{
		Psql({ command: upsertQuery  });
	}
	catch(err){
		process.exit();
	}

	

	// b) definitions

	// here we read the initial data from a json file and create a sql file on-the-fly;
	// data is inserted using the auxiliary "definitions_upsert" function (already defined in one of the previous scripts);
	// 
	// for each object in the json file we create the corresponding sql command; example:
	//
	//   SELECT * FROM definitions_upsert('{ name: "xyz", age: 10}')
	//
	// this command is written to a temporary file, which is then executed with psql as above 
	// (using the '--file' option)
	//
	// we do it this way because the quotes are difficult to handle in the shell (if the sql command was given
	// directly with the '--command' option)

	inputFile = "./database/90_initial_data/9040_populate_definitions.json";
	data = JSON5.parse(Fs.readFileSync(inputFile, "utf8"));

	var tempDir = Path.join(__dirname, "temp_" + String(Date.now()).substr(-5));

	// "mkdir" method from fs-extra ("If the parent hierarchy doesn't exist, it's created. Like mkdir -p")
	Fs.mkdirsSync(tempDir);

	upsertQuery = '';
	for(i=0; i<data.length; i++){

		upsertQuery += `
SELECT * FROM definitions_upsert(' ${ JSON.stringify(data[i]) } ');

		`;
	}

	var tempFile = Path.join(tempDir, 'definitions_upsert.sql');
	Fs.writeFileSync(tempFile, upsertQuery);

	try{
		Psql({ file: tempFile });
	}
	catch(err){
		process.exit();
	}

	// "remove" method from fs-extra ("directory can have contents")
	Fs.removeSync(tempDir);
};

Psql.configure({
	dbname: Config.get("db:postgres:database"),
	username: Config.get("db:postgres:username")
});

internals.createTables();
internals.createFunctions();
internals.insertInitialData()

console.log(Chalk.green.bold("\nsql scripts ran successfully!"));

