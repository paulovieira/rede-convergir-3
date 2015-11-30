
//var Path = require("path");
//var Fs = require("fs");
var Hoek = require("hoek");
var Boom = require("boom");
//var Config = require("config");
var _ = require("underscore");
//var _s = require("underscore.string");
var ChangeCase = require("change-case-keys");
var Utils = require("../lib/common/utils");
var Db = require("../database");

var internals = {};

module.exports = function(options){

    var seneca = this;

    seneca.add("role:definitions, cmd:read",    internals.definitionsRead);
    // seneca.add("role:initiatives, cmd:create",  internals.initiativesCreate);
    // seneca.add("role:initiatives, cmd:upsert",  internals.initiativesUpsert);
    // seneca.add("role:initiatives, cmd:delete",  internals.initiativesDelete);
};

internals.fromDbToPublicAPI = {
    "id": "id",
    "title": "title",
    "description": "description"
};


internals.definitionsRead = function(args, done){

    // TODO: add cache with catbox-memory here

    Utils.logCallsite(Hoek.callStack()[0]);

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

/*
internals.initiativesUpsert = function(args, done){

    Utils.logCallsite(Hoek.callStack()[0]);

    if(!args.data.slug){
        args.data.slug = _s.slugify(args.data.name);
    }

    ChangeCase(args.data, "underscored");
    //console.log("data: ", args.data);
    
    // 1) create/update the resources with the payload data (which is in args.data)
    Db.func("initiatives_upsert", JSON.stringify(args.data))

        // 2) read the created/updated resources (to obtain the joined data)
        .then(function(upsertedData) {

            // this should never happen, but we check anyway
            if (upsertedData.length === 0) {
                throw Boom.badImplementation("The resource could not be created/updated.");
            }

            return Db.func("initiatives_read", JSON.stringify({id: upsertedData[0].id}));
        })

        // 3) apply the object transform and reply
        .then(function(upsertedData){

            // this is very unlikely to happen, but we check anyway
            if (upsertedData.length === 0) {
                throw Boom.notFound("The resource was created/updated but does not exist anymore.");
            }

            upsertedData = (args.raw === true) ? 
                                        upsertedData : 
                                        Hoek.transform(upsertedData, internals.fromDbToPublicAPI);

            return done(null, upsertedData);
        })

        // 4. handle errors
        .catch(function(err) {

            // PL/pgSQL Error "no_data_found"; 
            // this will happen when the we try to update an initiative that has been deleted meanwhile
            // (or that was never created)
            if(err.code === "P0002"){
                err = Boom.notFound("The resource does not exist.");
            }

            // PL/pgSQL Error "unique_violation"; 
            // this will happen when we try to update a row with a repeated slug (already 
            // present in some other project)
            if(err.code === "23505"){
                if(err.detail.indexOf("slug") >= 0){
                    err = Boom.conflict("The provided value for slug is already in use by other initiative. Please choose a different slug.");
                }
                else{
                    err = Boom.conflict();
                }
            }

            err = err.isBoom ? err : Boom.badImplementation(Utils.getErrMsg(err));
            return done(err);
        });
};



internals.initiativesDelete = function(args, done){

    Utils.logCallsite(Hoek.callStack()[0]);

debugger;
    ChangeCase(args.data, "underscored");
    //console.log("data: ", args.data);
    
    // 1) delete the resource with the id param 
    Db.func("initiatives_delete", JSON.stringify(args.searchConditions))

        // 2) apply the object transform and reply
        .then(function(deletedData){
            debugger;
            // this should never happen, but we check anyway
            if (deletedData.length === 0) {
                throw Boom.notFound("The resource was created/updated but does not exist anymore.");
            }

            deletedData = (args.raw === true) ? 
                                        deletedData : 
                                        Hoek.transform(deletedData, internals.fromDbToPublicAPI);

            return done(null, deletedData);
        })

        // 4. handle errors
        .catch(function(err) {

            // PL/pgSQL Error "no_data_found"; 
            // this will happen when the we try to delete an initiative that has been deleted 
            // meanwhile (or that never existed)
            if(err.code === "P0002"){
                err = Boom.notFound("The resource does not exist.");
            }

            err = err.isBoom ? err : Boom.badImplementation(Utils.getErrMsg(err));
            return done(err);
        });
};
*/