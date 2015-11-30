var Fs = require("fs");
var Path = require("path");
var pgpLib = require('pg-promise');
var PgMonitor = require("pg-monitor");
var Config = require("config");
//var Q = require("q");
var Promise = require('bluebird');

var pgpOptions = {
    promiseLib: Promise
};

PgMonitor.attach(pgpOptions);

var pgp = pgpLib(pgpOptions); 


var connectionOptions = {
    host: Config.get("db.postgres.host"),
    port: Config.get("db.postgres.port"),
    user: Config.get("db.postgres.username"),
    password: Config.get("db.postgres.password"),
    database: Config.get("db.postgres.database"),
    //pgFormatting: true
};

// db will be the exported object
module.exports = pgp(connectionOptions);

module.exports.queryResult = {
    one: 1,     // single-row result is expected;
    many: 2,    // multi-row result is expected;
    none: 4,    // no rows expected;
    any: 6      // (default) = many|none = any result.
};

module.exports.as = pgp.as;

module.exports.end = function(){
    pgp.end();
    console.log("Released all connections. Goodbye!");
};
