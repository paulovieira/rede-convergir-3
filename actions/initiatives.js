
var Path = require("path");
var Fs = require("fs");
var Hoek = require("hoek");
var Boom = require("hapi/node_modules/boom");
var Q = require("q");
var Config = require("config");
var _ = require("underscore");
var _s = require("underscore.string");
var ChangeCase = require("change-case-keys");
var Utils = require("../lib/common/utils");
var Db = require("../database");

var internals = {};

module.exports = function(options){

    var seneca = this;

    seneca.add("role:initiatives, cmd:readAll", internals.initiativesReadAll);
    seneca.add("role:initiatives, cmd:read",    internals.initiativesRead);
    seneca.add("role:initiatives, cmd:create",  internals.initiativesCreate);
    seneca.add("role:initiatives, cmd:update",  internals.initiativesUpdate);
    // seneca.add("role:initiatives, cmd:delete",  internals.initiativesDelete);
};

internals.transformMap = {

    "id": "id",
    "name": "name",
    "description": "description",
    "typeId": "type_id",
    "typeOther": "type_other",
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
    "coordinates": "coordinates",
    "promoter": "promoter",
    "startDate": "start_date",
    "registryDate": "registry_date",
    "updateDate": "update_date",
    "visitorsId": "visitors_id",
    "groupSize": "group_size",
    "scopeId": "scope_id",
    "targetOther": "target_other",
    "influence": "influence",
    "physicalArea": "physical_area",
    "videoUrl": "video_url",
    "docUrl": "doc_url",
};


internals.initiativesReadAll = function(args, done){

    Utils.logCallsite(Hoek.callStack()[0]);
	
    Db.func("initiatives_read")
        .then(function(data){

            data = args.raw === true ? data : Hoek.transform(data, internals.transformMap);
            return done(null, data);
        })
        .catch(function(err) {

            err = err.isBoom ? err : Boom.badImplementation(err.msg, err);
            return done(err);
        });

};

internals.initiativesRead = function(args, done){

    Utils.logCallsite(Hoek.callStack()[0]);

    Db.func('initiatives_read', JSON.stringify(args.params.ids))
        .then(function(data) {

            if (data.length === 0) {
                throw Boom.notFound("The resource does not exist.");
            }

            data = args.raw === true ? data : Hoek.transform(data, internals.transformMap);
            return done(null, data);
        })
        .catch(function(err) {

            err = err.isBoom ? err : Boom.badImplementation(err.msg, err);
            return done(err);
        });
};


internals.initiativesCreate = function(args, done){

    Utils.logCallsite(Hoek.callStack()[0]);

    ChangeCase(args.payload, "underscored");
    console.log("payload: ", args.payload);
    
    // 1) create the resources with the payload data
    Db.func('initiatives_upsert', JSON.stringify(args.payload))

        // 2) read the created resources (to obtain the joined data)
        .then(function(createdData) {

            if (createdData.length === 0) {
                throw Boom.badRequest("The resource could not be created.");
            }

            // var createdIds = createdData.map(function(obj){ 
            //     return { id: obj.id }; 
            // });

            return Db.func("initiatives_read", JSON.stringify({ id: createdData[0].id }));
        })

        // 3) apply the object transform and reply
        .then(function(data){

            if (data.length === 0) {
                throw Boom.notFound("The resource does not exist anymore.");
            }

            data = args.raw === true ? data : Hoek.transform(data, internals.transformMap);
            return done(null, data);
        })
        .catch(function(err) {

            err = err.isBoom ? err : Boom.badImplementation(err.msg || err.detail, err);
            return done(err);
        });

};



internals.initiativesUpdate = function(args, done){

    Utils.logCallsite(Hoek.callStack()[0]);

    ChangeCase(args.payload, "underscored");
    console.log("payload: ", args.payload);
    
    // 1) read the resource to be updated (to verify that they exist)
    Db.func('initiatives_read', JSON.stringify({ id: args.payload.id }))

        // 2) update the resource with the payload data
        .then(function(data) {

            if (data.length === 0) {
                throw Boom.notFound("The resource does not exist anymore.");
            }

            return Db.func("initiatives_upsert", JSON.stringify(args.payload))
        })

        // 3) read again the updated resources (to obtain the joined data)
        .then(function(updatedData) {

            if (updatedData.length === 0) {
                throw Boom.badRequest("The resource could not be updated.");
            }

            var updatedIds = updatedData.map(function(obj){ 
                return { id: obj.id }; 
            });

            return Db.func("initiatives_read", JSON.stringify({id: updatedData[0].id}));
        })

        // 4) apply the object transform and reply
        .then(function(data){

            if (data.length === 0) {
                throw Boom.notFound("The resource does not exist.");
            }

            data = args.raw === true ? data : Hoek.transform(data, internals.transformMap);
            return done(null, data);
        })

        .catch(function(err) {

            err = err.isBoom ? err : Boom.badImplementation(err.msg || err.detail, err);
            return done(err);
        });
};


/*


curl  http://127.0.0.1:6001/api/v1/initiatives  \
    --request POST  \
    --header "Content-Type: application/json"  \
    --data '{ "name": "name 3", "description": "description 3", "typeId": "type_permaculture", "typeOther": "type other 3", "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "email 3", "phone": "phone 3", "contactOther": "contact other 3", "logo": "logo 3", "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_yes", "groupSize": "9", "scopeId": "scope_urban", "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3" }' 


curl  http://127.0.0.1:6001/api/v1/initiatives  \
    --request PUT  \
    --header "Content-Type: application/json"  \
    --data '{ "id": 14, "name": "name 3", "description": "description 3", "typeId": "type_permaculture", "typeOther": "type other 3", "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "email 3", "phone": "phone 3", "contactOther": "contact other 3", "logo": "logo 3", "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_yes", "groupSize": "9", "scopeId": "scope_urban", "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3" }' 


curl  http://127.0.0.1:6001/api/v1/initiatives/14  \
    --request PUT  \
    --header "Content-Type: application/json"  \
    --data '{ "id": 14, "name": "name xyz" }' 

*/