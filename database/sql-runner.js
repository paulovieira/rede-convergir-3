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

internals.createTablesAndFunction = function(){

	// the order in the array returned by glob is lexicographic, so we can define the order
	// that the scripts will run by simply pre-pending numbers in the filename
	Glob.sync("database/*(00|10|20)_*/*.sql").forEach(function(scriptPath){

		try{
			Psql({ file: scriptPath });
		}
		catch(err){
			process.exit();
		}

	});

};



// below are scripts to insert initial data; the upsert functionality available in postgres 9.5 is used;
// if the data is already present when the script is run for the 2nd time, it might be overwritten;
// this might be desirable (if we want to update some data that cannot be changed in any other way)
// or not (if the data is meant to be edited by the users using the web UI);

// if the data is meant to be overwritten (updated), we should use "insert... on conflict do update"
// if not, we should use "insert... on conflict do nothing"
internals.insertInitialData = {};

// a) initial data - countries (in csv format); 

// data was taken from http://pgfoundry.org/projects/dbsamples  (search for "iso-3166")
internals.insertInitialData.countries = function(){

	var inputFile, data;

	// read the initial data from the file, parse it, and create an upsert command to be executed by psql
	inputFile = './database/90_initial_data/9011-countries-iso-3166.csv';
	data = Fs.readFileSync(inputFile, 'utf8')
				.split('\n')
				.map( line => line.split('|'));

	var upsertQuery = ''

	// skip the first line (csv header)
	for(var i=1; i<data.length; i++){

		if(data[i].length!==3){ 
			throw new Error(JSON.stringify(data[i]))
		}

		upsertQuery += `   

INSERT INTO countries(name, code, id)                      \
VALUES ('${data[i][0]}', '${data[i][1]}', ${data[i][2]})   \
ON CONFLICT (code) DO UPDATE SET                           \
	name = EXCLUDED.name,                                  \
	code = EXCLUDED.code,                                  \
	id = EXCLUDED.id;  

`;

	}

	try{
		Psql({ command: upsertQuery.trim() });
	}
	catch(err){
		process.exit();
	}

}


// b) initial data - definitions (in json)

// here we read the initial data from a json file and create a sql file on-the-fly;
// data is inserted using the auxiliary "definitions_upsert" function (already defined in one of the previous scripts);
// 
// for each object in the json file we create the corresponding sql command; example:
//
//   SELECT * FROM definitions_upsert('{ name: "xyz", age: 10}')
//
// the commands are written to a temporary file, which is then executed using the psql wrapper; 
// we do it this way because the quotes are difficult to handle in the shell (if the sql command was given
// directly with the '--command' option instead of '--file')

internals.insertInitialData.definitions = function(){

	var inputFile, data;

	inputFile = './database/90_initial_data/9040-definitions.json';
	data = JSON5.parse(Fs.readFileSync(inputFile, 'utf8'));

	// temporary directory with random name
	var tempDir = Path.join(__dirname, '__temp__' + String(Date.now()).substr(-6));

	// "mkdir" method from fs-extra ("If the parent hierarchy doesn't exist, it's created. Like mkdir -p")
	Fs.mkdirsSync(tempDir);

	var upsertQuery = ''
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

internals.createTablesAndFunction();

internals.insertInitialData.countries();
internals.insertInitialData.definitions();

console.log(Chalk.green.bold("\nsql scripts ran successfully!"));

