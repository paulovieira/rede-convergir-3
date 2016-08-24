//var Path = require("path");
//var Fs = require("fs");
var Hoek = require("hoek");
var Boom = require("boom");
//var _ = require("underscore");
//var _s = require("underscore.string");
var Utils = require("../util/utils");
var Db = require("../database");

var internals = {};

module.exports = function(options){

    var seneca = this;

    seneca.add("role:definitions, cmd:read",    internals.definitionsRead);
};

internals.fromDbToPublicAPI = {
    "id": "id",
    "title": "title",
    "description": "description"
};


internals.definitionsRead = function(args, done){

    // TODO: add cache with catbox-memory here

    if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

    Db.func("definitions_read", JSON.stringify(args.searchConditions))
        .then(function(data) {

            data = args.raw === true ? data : Hoek.transform(data, internals.fromDbToPublicAPI);
            return done(null, data);
        })
        .catch(function(err) {

            err = err.isBoom ? err : Boom.badImplementation(Utils.getErrMsg(err));
            return done(err);
        });
};
