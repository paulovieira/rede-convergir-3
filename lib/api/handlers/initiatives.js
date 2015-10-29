var Hoek = require("hoek");
var Boom = require("boom");
var Joi = require("joi");
var Config = require("config");

var Utils = require("../../common/utils");
// var Pre = require("../../common/prerequisites");
var Validate = require("../../common/validate");

var internals = {};

// these are the definition ids present in the definitions table; they shouldn't change;

// TODO: valid typeId, visitorsId, scopeId, statusId

internals.validDomainsIds = ["domain_agriculture", "domain_husbandry", "domain_bioconstruction", "domain_ecotechnology", "domain_art", "domain_education", "domain_health", "domain_spirituality", "domain_economy", "domain_sharing", "domain_tools"];

internals.validTargetIds = ["target_children", "target_teenagers", "target_adults", "target_seniors", "target_families", "target_handicapped", "target_special_need_children", "target_general"];

internals.validatePayloadForCreate = function(value, options, next) {

    

    // note: all fields are necessary
    var schemaCreate = Joi.object({

        name: Joi.string().required(),
        slug: Joi.string(),
        description: Joi.string().required(),
        typeId: Joi.any(),
        typeOther: Joi.string().allow(""),

        // if a string in the domains array is not present in validDomainsIds, it will be
        // automatically removed
        domains: Joi.array().items(Joi.string().only(internals.validDomainsIds)),

        domainsOther: Joi.string().allow(""),
        url: Joi.string().allow("").required(),
        contactName: Joi.string().required(),
        email: Joi.string().allow("").required(),
        phone: Joi.string().allow("").required(),
        contactOther: Joi.string().allow(""),
        logo: Joi.string().allow("").required(),
        street: Joi.string().allow("").required(),
        city: Joi.string().allow("").required(),
        postalCode: Joi.string().allow("").required(),
        coordinates: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),  // array must contain at least two numbers
        promoter: Joi.string().allow("").required(),
        startDate: Joi.date().iso().required(),
        //registryDate: Joi.date().iso(),
        //updateDate: Joi.date().iso(),
        visitorsId: Joi.string().required(),
        groupSize: Joi.string().allow("").required(),
        scopeId: Joi.string().required(),

        target: Joi.array().items(Joi.string().only(internals.validTargetIds)).required(),

        targetOther: Joi.string().allow(""),
        influence: Joi.array().items(Joi.number().required()).required(),
        physicalArea: Joi.string().allow("").required(),
        videoUrl: Joi.string().allow("").required(),
        docUrl: Joi.string().allow("").required(),

        statusId: Joi.string(),
    });

    return Validate.payload(value, options, next, schemaCreate);
};

internals.validatePayloadForUpdate = function(value, options, next) {

    // note: all fields are necessary
    var schemaCreate = Joi.object({
        
        id: Joi.number().integer().min(0).required(),

        // from here below, it is the same validation as in "create"; see comments above;
        name: Joi.string().required(),
        slug: Joi.string(),
        description: Joi.string().required(),
        typeId: Joi.any(),  // we must allow null here
        typeOther: Joi.string().allow(""),
        domains: Joi.array().items(Joi.string().only(internals.validDomainsIds)),
        domainsOther: Joi.string().allow(""),
        url: Joi.string().allow("").required(),
        contactName: Joi.string().required(),
        email: Joi.string().allow("").required(),
        phone: Joi.string().allow("").required(),
        contactOther: Joi.string().allow(""),
        logo: Joi.string().allow("").required(),
        street: Joi.string().allow("").required(),
        city: Joi.string().allow("").required(),
        postalCode: Joi.string().allow("").required(),
        coordinates: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),  // array must contain at least two numbers
        promoter: Joi.string().allow("").required(),
        startDate: Joi.date().iso().required(),
        //registryDate: Joi.date().iso(),
        //updateDate: Joi.date().iso(),
        visitorsId: Joi.string().required(),
        groupSize: Joi.string().allow("").required(),
        scopeId: Joi.string().required().required(),
        
        target: Joi.array().items(Joi.string().only(internals.validTargetIds)).required(),

        targetOther: Joi.string().allow(""),
        influence: Joi.array().items(Joi.number()).required(),
        physicalArea: Joi.string().allow("").required(),
        videoUrl: Joi.string().allow("").required(),
        docUrl: Joi.string().allow("").required(),

        statusId: Joi.string(),
    });

    return Validate.payload(value, options, next, schemaCreate);
};

internals.readAll = {

	handler: function(request, reply) {

        return reply.act({
        	role: "initiatives", 
        	cmd: "readAll", 
        	params: request.params
        });
	},

};

internals.read = {

    handler: function(request, reply) {

        return reply.act({
            role: "initiatives", 
            cmd: "read", 
            params: request.params
        });
    },

    validate: {
        params: Validate.ids
    },
};

internals.create = {

    handler: function(request, reply) {

        return reply.act({
            role: "initiatives", 
            cmd: "create", 
            payload: request.payload[0]
        });
    },

    validate: {
        payload: internals.validatePayloadForCreate
    },
};

internals.update = {

    handler: function(request, reply) {

        return reply.act({
            role: "initiatives", 
            cmd: "update", 
            payload: request.payload[0]
        });
    },

    validate: {
        params: Validate.ids,
        payload: internals.validatePayloadForUpdate
    }
};

exports.config = {
    readAll: internals.readAll,
    read: internals.read,
    create: internals.create,
    update: internals.update,
    // delete: internals.delete
};



/*


curl  http://127.0.0.1:6001/api/v1/initiatives  \
    --request POST  \
    --header "Content-Type: application/json"  \
    --data '{ "name": "name 3", "description": "description 3", "typeId": "type_permaculture", "typeOther": "type other 3", "domains": ["domain_agriculture", "domain_bioconstruction"], "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "email 3", "phone": "phone 3", "contactOther": "contact other 3", "logo": "logo 3", "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_yes", "groupSize": "9", "scopeId": "scope_urban", "target": ["target_children", "target_seniors"], "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3" }' 




curl  http://127.0.0.1:6001/api/v1/initiatives  \
    --request POST  \
    --header "Content-Type: application/json"  \
    --data '{ "name": "name 3", "description": "description 3", "typeId": "type_permaculture", "typeOther": "type other 3", "domains": ["domain_agriculture", "domain_bioconstruction"], "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "email 3", "phone": "phone 3", "contactOther": "contact other 3", "logo": "logo 3", "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_yes", "groupSize": "9", "scopeId": "scope_urban", "target": ["target_children", "target_seniors"], "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3", "statusId": "status_alive" }' 




curl  http://127.0.0.1:6001/api/v1/initiatives/14  \
    --request PUT  \
    --header "Content-Type: application/json"  \
    --data '{ "id": 14, "name": "name 3", "description": "description 3", "typeId": "type_permaculture", "typeOther": "type other 3", "domains": ["domain_husbandry", "domain_art"], "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "email 3", "phone": "phone 3", "contactOther": "contact other 3", "logo": "logo 3", "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_yes", "groupSize": "9", "scopeId": "scope_urban", "target": ["target_adults"], "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3" }' 


curl  http://127.0.0.1:6001/api/v1/initiatives/14  \
    --request PUT  \
    --header "Content-Type: application/json"  \
    --data '{ "id": 14, "name": "name 3", "description": "description 3", "typeId": "type_permaculture", "typeOther": "type other 3", "domains": ["domain_husbandry", "domain_art"], "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "email 3", "phone": "phone 3", "contactOther": "contact other 3", "logo": "logo 3", "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_yes", "groupSize": "9", "scopeId": "scope_urban", "target": ["target_adults"], "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3" }' 




*/