var Hoek = require("hoek");
var Boom = require("boom");
var Joi = require("joi");
var Config = require("config");

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






internals.validatePayloadForCreate = function(value, options, next) {

    

    // note: all fields are necessary
    var schemaCreate = Joi.object({

        name: Joi.string().required(),
        slug: Joi.string(),
        description: Joi.string().required(),
        typeId: Joi.any().only(internals.validTypeIds),
        typeOther: Joi.string().allow(""),

        // if a string in the domains array is not present in validDomainsIds, it will be
        // automatically removed
        domains: Joi.array().items(Joi.string().only(internals.validDomainsIds)),
        //        domains: Joi.array().items(Joi.string()),

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
        countryCode: Joi.string(),
        coordinates: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),  // array must contain at least two numbers
        promoter: Joi.string().allow("").required(),
        startDate: Joi.date().iso().required(),
        //registryDate: Joi.date().iso(),
        //updateDate: Joi.date().iso(),
        visitorsId: Joi.string().only(internals.validVisitorsIds),
        groupSize: Joi.string().allow("").required(),
        scopeId: Joi.string().only(internals.validScopeIds).required(),

        target: Joi.array().items(Joi.string().only(internals.validTargetIds)).required(),
        //        target: Joi.array().items(Joi.string()).required(),

        targetOther: Joi.string().allow(""),
        influence: Joi.array().items(Joi.number().required()).required(),
        physicalArea: Joi.string().allow("").required(),
        videoUrl: Joi.string().allow("").required(),
        docUrl: Joi.string().allow("").required(),

        statusId: Joi.string().only(internals.validStatusIds),
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
        typeId: Joi.any().only(internals.validTypeIds),
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
        countryCode: Joi.string(),
        coordinates: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2).required(),  // array must contain at least two numbers
        promoter: Joi.string().allow("").required(),
        startDate: Joi.date().iso().required(),
        //registryDate: Joi.date().iso(),
        //updateDate: Joi.date().iso(),
        visitorsId: Joi.string().only(internals.validVisitorsIds),
        groupSize: Joi.string().allow("").required(),
        scopeId: Joi.string().only(internals.validScopeIds).required(),
        
        target: Joi.array().items(Joi.string().only(internals.validTargetIds)).required(),

        targetOther: Joi.string().allow(""),
        influence: Joi.array().items(Joi.number()).required(),
        physicalArea: Joi.string().allow("").required(),
        videoUrl: Joi.string().allow("").required(),
        docUrl: Joi.string().allow("").required(),

        statusId: Joi.string().only(internals.validStatusIds),
    });

    return Validate.payload(value, options, next, schemaCreate);
};

internals.readAll = {

	handler: function(request, reply) {

        var searchConditions = {};
        if(request.query.type){
            console.log("request.query: ", request.query)
            searchConditions["type"] = request.query.type;
        }

        var pattern = {
            role: "initiatives", 
            cmd: "read",
            searchConditions: searchConditions
        };

        request.server.seneca.act(pattern, function(err, data){

            if(err){
                return reply(Boom.badImplementation(err.msg, err));
            }

            return reply(data);
        });
	},

};

internals.read = {

    handler: function(request, reply) {

        // the Validate.ids function has transformed request.params.ids in an
        // array of objects ready to used in the postgres functions; however this
        // array should be stored somewhere else
        var pattern = {
            role: "initiatives", 
            cmd: "read",
            searchConditions: request.params.ids
        };

        request.server.seneca.act(pattern, function(err, data){

            if(err){
                return reply(Boom.badImplementation(err.msg, err));
            }

            if (data.length === 0) {
                return reply(Boom.notFound("The resource does not exist."));
            }

            return reply(data);
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
    --data '{"name":"TU - Transição Universitária da FCUL","description":"O TU - Transição Universitária é um grupo de intervinientes da Faculdade de Ciências da Universidade de Lisboa (FCUL) que tem como objectivo facilitar a Transição aqui mesmo na nossa Faculdade. <br />Como? Através de sensibilização, aumento da consciência colectiva e realização de projectos práticos que vão de encontro ao objectivo do TU.","typeId":"type_transition","domains":["Espiritualidade", "xyz", "Economia alternativa",  "Partilha de conhecimento"],"url":"http://www.tu-fcul.net","contactName":"Raquel Clemente","email":"info@tu-fcul.net","phone":"","contactOther":"skype: dnavelar","logo":"tu-transicao-universitaria-da-fcul-1.gif","street":"Faculdade de Ciências da Universidade de Lisboa","city":"Lisboa","postalCode":"1749-016","promoter":"","startDate":"2011-02-01T00:00:00.000Z","registryDate":"2012-03-02T00:00:00.000Z","updateDate":"2012-04-29T23:00:00.000Z","visitorsId":"visitors_yes","groupSize":"7","scopeId":"scope_urban","target":["Adultos","Geral", "dummy target", "Academia"],"influence":[500,5],"physicalArea":"","videoUrl":"","docUrl":"jornalTU.pdf","idOld":"120131154140","logoOld":"tuLogo.gif","coordinates":[38.75618,-9.156579999999963]}' 



curl  http://127.0.0.1:6001/api/v1/initiatives  \
    --request POST  \
    --header "Content-Type: application/json"  \
    --data '{"name":"TU - Transição Universitária da FCUL 2","description":"O TU - Transição Universitária é um grupo de intervinientes da Faculdade de Ciências da Universidade de Lisboa (FCUL) que tem como objectivo facilitar a Transição aqui mesmo na nossa Faculdade. <br />Como? Através de sensibilização, aumento da consciência colectiva e realização de projectos práticos que vão de encontro ao objectivo do TU.","typeId":"type_transition","domains":["domain_husbandry", "domain_sharing"],"url":"http://www.tu-fcul.net","contactName":"Raquel Clemente","email":"info@tu-fcul.net","phone":"","contactOther":"skype: dnavelar","logo":"tu-transicao-universitaria-da-fcul-1.gif","street":"Faculdade de Ciências da Universidade de Lisboa","city":"Lisboa","postalCode":"1749-016","promoter":"","startDate":"2011-02-01T00:00:00.000Z","registryDate":"2012-03-02T00:00:00.000Z","updateDate":"2012-04-29T23:00:00.000Z","visitorsId":"visitors_yes","groupSize":"7","scopeId":"scope_urban","target":["target_general"],"influence":[500,5],"physicalArea":"","videoUrl":"","docUrl":"jornalTU.pdf","idOld":"120131154140","logoOld":"tuLogo.gif","coordinates":[38.75618,-9.156579999999963]}' 




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