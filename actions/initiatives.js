
//var Path = require("path");
//var Fs = require("fs");
var Hoek = require("hoek");
var Boom = require("boom");
//var _ = require("underscore");
var _s = require("underscore.string");
var Utils = require("../util/utils");
var Db = require("../database");


var internals = {};

module.exports = function(options){

    var seneca = this;

    seneca.add("role:initiatives, cmd:read, test:hello-world" ,    internals.initiativesReadTest);
    seneca.add("role:initiatives, cmd:read",    internals.initiativesRead);
//    seneca.add("role:initiatives, cmd:create",  internals.initiativesCreate);
    seneca.add("role:initiatives, cmd:upsert",  internals.initiativesUpsert);
    seneca.add("role:initiatives, cmd:delete",  internals.initiativesDelete);
};

internals.fromDbToPublicAPI = {

    "id": "id",
    "name": "name",
    "slug": "slug",
    "description": "description",
    "typeId": "type_id",
    "typeOther": "type_other",
    "domains": "domains",
    "domainsOther": "domains_other",
    "url": "url",
    "contactName": "contact_name",
    "email": "email",
    "phone": "phone",
    "contactOther": "contact_other",
    "logo": "logo",
    "street": "street",
    "city": "city",
    "postalCode": "postal_code",
    "countryCode": "country_code",
    "coordinates": "coordinates",
    "promoter": "promoter",
    "startDate": "start_date",
    "registryDate": "registry_date",
    "updateDate": "update_date",
    "visitorsId": "visitors_id",
    "groupSize": "group_size",
    "scopeId": "scope_id",
    "target": "target",
    "targetOther": "target_other",
    "influence": "influence",
    "physicalArea": "physical_area",
    "videoUrl": "video_url",
    "docUrl": "doc_url",
    "initiativeStatusId": "initiative_status_id",
    "moderationStatusId": "moderation_status_id"
};


internals.initiativesReadTest = function(args, done){

    // TODO: add cache with catbox-memory here

    if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

    var data = [{hello: "world from action"}];
    return done(null, data);

    // Db.func("initiatives_read", JSON.stringify(args.searchConditions))
    //     .then(function(data) {

    //         data = args.raw === true ? data : Hoek.transform(data, internals.fromDbToPublicAPI);
    //         return done(null, data);
    //     })
    //     .catch(function(err) {

    //         err = err.isBoom ? err : Boom.badImplementation(Utils.getErrMsg(err));
    //         return done(err);
    //     });
};


internals.initiativesRead = function(args, done){

    // TODO: add cache with catbox-memory here

    if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

    Db.func("initiatives_read", JSON.stringify(args.searchConditions))
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
internals.initiativesCreate = function(args, done){

    if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

    // TODO: make sure the slug is unique
    if(!args.data.slug){
        args.data.slug = _s.slugify(args.data.name);
    }

    ChangeCase(args.data, "underscored");
    //console.log("data: ", args.data);
    
    // 1) create the resources with the payload data (which is in args.data)
    Db.func('initiatives_upsert', JSON.stringify(args.data))

        // 2) read the created resources (to obtain the joined data)
        .then(function(createdData) {

            if (createdData.length === 0) {
                throw Boom.badImplementation("The resource could not be created.");
            }

            return Db.func("initiatives_read", JSON.stringify({ id: createdData[0].id }));
        })

        // 3) apply the object transform and reply
        .then(function(createdData){

            if (createdData.length === 0) {
                throw Boom.badImplementation("The resource was created but does not exist anymore.");
            }

            createdData = args.raw === true ? createdData : Hoek.transform(createdData, internals.fromDbToPublicAPI);
            return done(null, createdData);
        })

        .catch(function(err) {

            //  PL/pgSQL Error "unique_violation" (probably because of a repeated slug)
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
*/

internals.initiativesUpsert = function(args, done){

    if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

    var data = Utils.changeCase(args.data, "underscored");

    if(!data.slug){
        data.slug = _s.slugify(data.name);
    }
    
    // 1) create/update the resources with the payload data (which is in data)
    Db.func("initiatives_upsert", JSON.stringify(data))

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
            // this will happen when we try to update (insert?) a row with a repeated slug (already 
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

    if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }
debugger;
    
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
