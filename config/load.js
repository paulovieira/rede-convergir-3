var Path = require("path");
var Nconf = require('nconf');

// 1 - load the command line arguments into Nconf
Nconf.argv();

// 2 - load the main configuration object (either config/production.js or config/dev.js, which is the default)
var configPath = !!Nconf.get("production") ? "./production.js" : "./dev.js";
Nconf.overrides(require(configPath));

// 3 - load the default configuration (these options will be applied only if they aren't already)
var defaultPath = "./default.js";
Nconf.defaults(require(defaultPath));

console.log("Loaded default configuration from " + Path.join(__dirname, defaultPath))
console.log("Loaded configuration from " + Path.join(__dirname, configPath))
console.log("Loaded command line configuration")