var Path = require('path');
var Nconf = require('nconf');
var Chalk = require('chalk');

// 1 - load a dummy empty configuration from file; we do this only to be able to use the .set method below;
// (this is a bug from nconf, for more details see: https://github.com/indexzero/nconf/issues/197 )
Nconf.file('empty.json')


// 2 - load the command line arguments into Nconf; one of the following should be given:
// '--dev' or '--production'
Nconf.argv();


// 3 - load the configuration object specific to the environment (either config/production.js or config/dev.js)
var configPath = '';

var env = '';
if(!!Nconf.get('production')){
	configPath = './production.js';
	env = 'production';
}
else if(!!Nconf.get('dev')){
	configPath = './dev.js';
	env = 'dev';
}
else{
	console.log('Invalid environment (use either "--dev" or "--production"');
	process.exit();
}

// manually update the 'env' configuration property (to be used throughout the application); this is
// equivalent to the traditional NODE_ENV
Nconf.set('env', env);

// the NODE_ENV env variable is used by webpack to build different targets, so we set it as well;
// note that by setting "export NODE_ENV=..." in the shell won't have any effect because we are
// setting the property directly in the process.env object
process.env.NODE_ENV = env;
global.NODE_ENV = env;

Nconf.overrides(require(configPath));

// 4 - load the default configuration (these options will be applied only if they aren't already)
var defaultPath = './default.js';
Nconf.defaults(require(defaultPath));

// 5 - output info
console.log(Chalk.green('================='));
console.log(Chalk.bold('Configuration has been loaded'));
console.log('Default configuration file: ', Path.join(__dirname, defaultPath));
console.log('Environment configuration (overrides default): ', Path.join(__dirname, configPath));

var argv = '';
for(var i=2; i<process.argv.length; i++){
	argv += process.argv[i] + ' ';
}

console.log('Command line configuration (overrides default and environment):', argv);
console.log(Chalk.green('=================\n'));