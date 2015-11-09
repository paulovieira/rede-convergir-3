var Hoek = require("hoek");
var Boom = require("boom");
var Joi = require("joi");
var _s = require("underscore.string");
//var Config = require("config");
var Seneca = require("../../common/seneca");
var Utils = require("../../common/utils");
// var Pre = require("../../common/prerequisites");
var Validate = require("../../common/validate");

var internals = {};

// these are the definition ids present in the definitions table; they shouldn't change;

// TODO: valid  visitorsId, scopeId, statusId

internals.validTypeIds = ["type_permaculture", "type_transition", "type_soil_nature", "type_construction", "type_tools", "type_culture", "type_health", "type_economy", "type_community", null];

internals.validDomainsIds = ["domain_agriculture", "domain_husbandry", "domain_bioconstruction", "domain_ecotechnology", "domain_art", "domain_education", "domain_health", "domain_spirituality", "domain_economy", "domain_sharing", "domain_tools"];

internals.validTargetIds = ["target_children", "target_teenagers", "target_adults", "target_seniors", "target_families", "target_handicapped", "target_special_need_children", "target_general"];

internals.validVisitorsIds = ["visitors_yes", "visitors_no", "visitors_confirmation"];

internals.validStatusIds = ["status_alive", "status_germinate", "status_inactive"];

internals.validScopeIds = ["scope_urban", "scope_rural", "scope_mixed"];

internals.correctUrl = function(url){

    if(url.indexOf("http") >= 0 || url.indexOf("https") >= 0 || _s.trim(url) === ""){
        return url;
    }

    return "http://" + url;
};




internals.validatePayloadForCreate = function(value, options, next) {

    

    // note: all fields are necessary
    var schemaCreate = Joi.object({

        name: Joi.string().trim().required(),
        slug: Joi.string().trim(),
        description: Joi.string().trim().required(),
        typeId: Joi.any().only(internals.validTypeIds),
        typeOther: Joi.string().trim().allow(""),

        // if a string in the domains array is not present in validDomainsIds, it will be
        // automatically removed
        domains: Joi.array().items(Joi.string().only(internals.validDomainsIds)),
        //        domains: Joi.array().items(Joi.string()),

        domainsOther: Joi.string().allow("").trim(),
        url: Joi.string().allow("").required().trim(),
        contactName: Joi.string().required().trim(),
        email: Joi.string().allow("").required().trim(),
        phone: Joi.string().allow("").required().trim(),
        contactOther: Joi.string().allow("").trim(),
        logo: Joi.object({
                filename: Joi.string().allow(""),
                min: Joi.number().integer(),
                max: Joi.number().integer(),
                exclusive: Joi.boolean()
            }).required(),
        street: Joi.string().allow("").required().trim(),
        city: Joi.string().allow("").required().trim(),
        postalCode: Joi.string().allow("").required().trim(),
        countryCode: Joi.string().trim(),
        coordinates: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),  // array must contain at least two numbers
        promoter: Joi.string().trim().allow("").required(),
        startDate: Joi.date().iso().required(),
        //registryDate: Joi.date().iso(),
        //updateDate: Joi.date().iso(),
        visitorsId: Joi.string().only(internals.validVisitorsIds),
        groupSize: Joi.string().trim().allow("").required(),
        scopeId: Joi.string().only(internals.validScopeIds).required(),

        target: Joi.array().items(Joi.string().only(internals.validTargetIds)).required(),
        targetOther: Joi.string().trim().allow(""),
        influence: Joi.array().items(Joi.number().required()).required(),
        physicalArea: Joi.string().trim().allow("").required(),
        videoUrl: Joi.string().trim().allow("").required(),
        docUrl: Joi.string().trim().allow("").required(),

        statusId: Joi.string().only(internals.validStatusIds),
    });

    return Validate.payload(value, options, next, schemaCreate);
};

internals.validatePayloadForUpdate = function(value, options, next) {

    // note: all fields are necessary
    var schemaCreate = Joi.object({
        
        id: Joi.number().integer().min(0).required(),

        // from here below, it is the same validation as in "create"; see comments above;
        name: Joi.string().trim().required(),
        slug: Joi.string().trim(),
        description: Joi.string().trim().required(),
        typeId: Joi.any().only(internals.validTypeIds),
        typeOther: Joi.string().trim().allow(""),
        domains: Joi.array().items(Joi.string().only(internals.validDomainsIds)),
        domainsOther: Joi.string().trim().allow(""),
        url: Joi.string().trim().allow("").required(),
        contactName: Joi.string().trim().required(),
        email: Joi.string().trim().allow("").required(),
        phone: Joi.string().trim().allow("").required(),
        contactOther: Joi.string().trim().allow(""),
        logo: Joi.object({
                filename: Joi.string().allow(""),
                min: Joi.number().integer(),
                max: Joi.number().integer(),
                exclusive: Joi.boolean()
            }).required(), 
        street: Joi.string().trim().allow("").required(),
        city: Joi.string().trim().allow("").required(),
        postalCode: Joi.string().trim().allow("").required(),
        countryCode: Joi.string().trim(),
        coordinates: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),  // array must contain at least two numbers
        promoter: Joi.string().trim().allow("").required(),
        startDate: Joi.date().iso().required(),
        //registryDate: Joi.date().iso(),
        //updateDate: Joi.date().iso(),
        visitorsId: Joi.string().only(internals.validVisitorsIds),
        groupSize: Joi.string().trim().allow("").required(),
        scopeId: Joi.string().only(internals.validScopeIds).required(),
        
        target: Joi.array().items(Joi.string().only(internals.validTargetIds)).required(),

        targetOther: Joi.string().trim().allow(""),
        influence: Joi.array().items(Joi.number()).required(),
        physicalArea: Joi.string().trim().allow("").required(),
        videoUrl: Joi.string().trim().allow("").required(),
        docUrl: Joi.string().trim().allow("").required(),

        statusId: Joi.string().only(internals.validStatusIds),
    });

    return Validate.payload(value, options, next, schemaCreate);
};

internals.readAll = {

	handler: function(request, reply) {

        Utils.logCallsite(Hoek.callStack()[0]);

        var searchConditions = {};

        // in this endpoint we can have query string search conditions; if there are
        // no query strings, it means we don't have any conditions (that is, read all!)
        if(request.query.type){
            searchConditions["type"] = request.query.type;
        }

        Seneca.actAsync({
                role: "initiatives", 
                cmd: "read",
                searchConditions: searchConditions
            })
            .then(function(data){

                return reply(data).code(200);
            })
            .catch(function(err){

                // the action should always return a boom error
                err = err.isBoom ? err : Boom.badImplementation(err.message);
                return reply(err);
            });

	},

    description: 'general read initiatives; the query string can be used to filter the results;',

};

internals.readTest = {

    handler: function(request, reply) {

        //Utils.logCallsite(Hoek.callStack()[0]);

        // make sure the url fields have "http://"
        //request.payload[0].url = internals.correctUrl(request.payload[0].url);
        //request.payload[0].videoUrl = internals.correctUrl(request.payload[0].videoUrl);

        
        Seneca.actAsync({
                role: "initiatives",
                cmd: "read",
                test: "hello-world"
            })
            .then(function(data){

                return reply(data).code(200);
            })
            .catch(function(err){

                err = err.isBoom ? err : Boom.badImplementation(err.message);
                return reply(err);
            });

    },
}

internals.read = {

    handler: function(request, reply) {

        Utils.logCallsite(Hoek.callStack()[0]);

        // in this endpoint the only search condition is built-in in the param of the url

        // the Validate.ids function has transformed request.params.ids in an
        // array of objects ready to used in the postgres functions; 
        // TODO: this array should be stored somewhere else

        Seneca.actAsync({
                role: "initiatives",
                cmd: "read",
                searchConditions: request.params.ids
            })
            .then(function(data){

                if (data.length === 0) {
                    return reply(Boom.notFound("The resource does not exist."));
                }

                return reply(data).code(200);
            })
            .catch(function(err){

                err = err.isBoom ? err : Boom.badImplementation(err.message);
                return reply(err);
            });

    },

    description: 'read initiative(s) filtered by the id given in the url param',

    validate: {
        params: Validate.ids
    },
};

internals.create = {

    handler: function(request, reply) {

        Utils.logCallsite(Hoek.callStack()[0]);

        // make sure the url fields have "http://"
        request.payload[0].url = internals.correctUrl(request.payload[0].url);
        request.payload[0].videoUrl = internals.correctUrl(request.payload[0].videoUrl);

        Seneca.actAsync({
                role: "initiatives",
                cmd: "upsert",
                data: request.payload[0]
            })
            .then(function(createdData){

                return reply(createdData).code(201);
            })
            .catch(function(err){

                err = err.isBoom ? err : Boom.badImplementation(err.message);
                return reply(err);
            });

    },

    validate: {
        payload: internals.validatePayloadForCreate
    },
};

internals.update = {

    handler: function(request, reply) {

        Utils.logCallsite(Hoek.callStack()[0]);

        // make sure the url fields have "http://"
        request.payload[0].url = internals.correctUrl(request.payload[0].url);
        request.payload[0].videoUrl = internals.correctUrl(request.payload[0].videoUrl);

        Seneca.actAsync({
                role: "initiatives",
                cmd: "upsert",
                data: request.payload[0]
            })
            .then(function(updatedData){

                return reply(updatedData).code(200);
            })
            .catch(function(err){

                err = err.isBoom ? err : Boom.badImplementation(err.message);
                return reply(err);
            });

    },

    validate: {
        params: Validate.ids,
        payload: internals.validatePayloadForUpdate
    }
};

internals.delete = {

    handler: function(request, reply) {

        Utils.logCallsite(Hoek.callStack()[0]);

        // in this endpoint the only search condition is built-in in the param of the url

        Seneca.actAsync({
                role: "initiatives",
                cmd: "delete",
                searchConditions: request.params.ids[0]
            })
            .then(function(deletedData){

                if (deletedData.length === 0) {
                    return reply(Boom.notFound("The resource does not exist."));
                }

                return reply(deletedData).code(200);
            })
            .catch(function(err){

                err = err.isBoom ? err : Boom.badImplementation(err.message);
                return reply(err);
            });

    },

    validate: {
        params: Validate.ids
    },

};


exports.config = {
    readAll: internals.readAll,
    read: internals.read,
    create: internals.create,
    update: internals.update,
    delete: internals.delete,

    readTest: internals.readTest,
};



/*




curl  http://127.0.0.1:6001/api/v1/initiatives  \
    --request POST  \
    --header "Content-Type: application/json"  \
    --data '{"name":"TU - Transição Universitária da FCUL 2","description":"O TU - Transição Universitária é um grupo de intervinientes da Faculdade de Ciências da Universidade de Lisboa (FCUL) que tem como objectivo facilitar a Transição aqui mesmo na nossa Faculdade. <br />Como? Através de sensibilização, aumento da consciência colectiva e realização de projectos práticos que vão de encontro ao objectivo do TU.","typeId":"type_transition","domains":["domain_husbandry", "domain_sharing"],"url":"http://www.tu-fcul.net","contactName":"Raquel Clemente","email":"info@tu-fcul.net","phone":"","contactOther":"skype: dnavelar","logo":{"filename": "tu-transicao-universitaria-da-fcul-1.gif"},"street":"Faculdade de Ciências da Universidade de Lisboa","city":"Lisboa","postalCode":"1749-016","promoter":"","startDate":"2011-02-01T00:00:00.000Z","registryDate":"2012-03-02T00:00:00.000Z","updateDate":"2012-04-29T23:00:00.000Z","visitorsId":"visitors_yes","groupSize":"7","scopeId":"scope_urban","target":["target_general"],"influence":[500,5],"physicalArea":"","videoUrl":"","docUrl":"jornalTU.pdf","idOld":"120131154140","logoOld":"tuLogo.gif","coordinates":[38.75618,-9.156579999999963]}' 



curl  http://127.0.0.1:6001/api/v1/initiatives/14  \
    --request PUT  \
    --header "Content-Type: application/json"  \
    --data '{ "id": 14, "name": "name 3", "description": "description 3", "typeId": "type_permaculture", "typeOther": "type other 3", "domains": ["domain_husbandry", "domain_art"], "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "email 3", "phone": "phone 3", "contactOther": "contact other 3", "logo":{"filename": "tu-transicao-universitaria-da-fcul-1.gif", "min": 555, "max": 666}, "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_yes", "groupSize": "9", "scopeId": "scope_urban", "target": ["target_adults"], "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3" }' 





curl  http://127.0.0.1:6001/api/v1/initiatives/331  \
    --request DELETE


*/
