var Fs = require("fs");
var Path = require("path");
var Hoek = require("hoek");
var Boom = require("boom");
var Joi = require("joi");
var JSON5 = require("json5");
var _ = require("underscore");
var _s = require("underscore.string");

var Promise = require('bluebird');
var CsvStringify = Promise.promisify(require("csv-stringify"));
var Config = require('nconf');
var Seneca = require('seneca').instance;
var Validate = require("../../util/validate");
var Utils = require("../../util/utils");



var internals = {};

internals.definitions = JSON5.parse(Fs.readFileSync(Path.join(Config.get("rootDir"), "database/90_initial_data/9040-definitions.json"), "utf8")); 

internals.getDefinitionsArray = function(definitionPrefix){

    return _.chain(internals.definitions)
            .filter(function(obj){
                return obj.id.indexOf(definitionPrefix) === 0;
            })
            .pluck("id")
            .value();
};

// the definition ids present in the definitions table
internals.validation = {};
internals.validation.type = internals.getDefinitionsArray("type");
internals.validation.domains = internals.getDefinitionsArray("domain");
internals.validation.target = internals.getDefinitionsArray("target");
internals.validation.visitors = internals.getDefinitionsArray("visitors");
internals.validation.scope = internals.getDefinitionsArray("scope");
internals.validation.initiativeStatus = internals.getDefinitionsArray("initiative_status");
internals.validation.moderationStatus = internals.getDefinitionsArray("moderation_status").concat("all");


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
        typeId: Joi.any().only(internals.validation.type),
        typeOther: Joi.string().trim().allow(""),

        // if a string in the domains array is not present in validDomainsIds, it will be
        // automatically removed
        domains: Joi.array().items(Joi.string().only(internals.validation.domains)),
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
        visitorsId: Joi.string().only(internals.validation.visitors),
        groupSize: Joi.string().trim().allow("").required(),
        scopeId: Joi.string().only(internals.validation.scope).required(),

        target: Joi.array().items(Joi.string().only(internals.validation.target)).required(),
        targetOther: Joi.string().trim().allow(""),
        influence: Joi.array().items(Joi.number().required()).required(),
        physicalArea: Joi.string().trim().allow("").required(),
        videoUrl: Joi.string().trim().allow("").required(),
        docUrl: Joi.string().trim().allow("").required(),

        initiativeStatusId: Joi.string().only(internals.validation.initiativeStatus),
        moderationStatusId: Joi.string().only(internals.validation.moderationStatus),

        emailTemplate: Joi.string().only("awaitingApproval", "approved")
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
            typeId: Joi.any().only(internals.validation.type),
            typeOther: Joi.string().trim().allow(""),
            domains: Joi.array().items(Joi.string().only(internals.validation.domains)),
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
            visitorsId: Joi.string().only(internals.validation.visitors),
            groupSize: Joi.string().trim().allow("").required(),
            scopeId: Joi.string().only(internals.validation.scope).required(),
        
            target: Joi.array().items(Joi.string().only(internals.validation.target)).required(),

            targetOther: Joi.string().trim().allow(""),
            influence: Joi.array().items(Joi.number()).required(),
            physicalArea: Joi.string().trim().allow("").required(),
            videoUrl: Joi.string().trim().allow("").required(),
            docUrl: Joi.string().trim().allow("").required(),
            initiativeStatusId: Joi.string().only(internals.validation.initiativeStatus),
            moderationStatusId: Joi.string().only(internals.validation.moderationStatus),

            emailTemplate: Joi.string().only("awaitingApproval", "approved")
    });

    return Validate.payload(value, options, next, schemaCreate);
};

internals.readAll = {

	handler: function(request, reply) {

        if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

        var searchConditions = {};

        // in this endpoint we can have query string search conditions; if there are
        // no query strings, it means we don't have any conditions (that is, read all!);
        // however note that some query strings might have default values, so there's always at
        // least one value
        if(request.query.moderationStatusId){
            searchConditions["moderation_status_id"] = request.query.moderationStatusId;
        }
        if(request.query.typeId){
            searchConditions["type_id"] = request.query.typeId;
        }

        Seneca.actAsync({
                role: "initiatives", 
                cmd: "read",
                searchConditions: searchConditions
            })
            .then(function(data){

                if(request.query.csv){
                    // return promise
                    return CsvStringify(data, {header: true})
                        .then(function(csv){
                            
                            return reply(csv)
                                .code(200)
                                .header('content-type', 'text/csv')
                                .header('content-disposition', 'attachment; filename="rede_convergir_initiatives.csv"')

                        });

                }
                
                return reply(data).code(200);
            })
            .catch(function(err){

                // the action should always return a boom error
                err = err.isBoom ? err : Boom.badImplementation(err.message);
                return reply(err);
            });

	},
    
    validate: {
        query: {
            typeId: Joi.string().insensitive().valid(internals.validation.type),
            moderationStatusId: Joi.string().insensitive().valid(internals.validation.moderationStatus).default("moderation_status_002_approved"),
            csv: Joi.boolean().default(false)
        }
    },

    description: 'general read initiatives; the query string can be used to filter the results;',

};

/*
internals.readTest = {

    handler: function(request, reply) {

        //if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

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
};
*/

internals.read = {

    handler: function(request, reply) {

        if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

        // in this endpoint the only search condition is built-in in the param of the url

        // the Validate.ids function has transformed request.params.ids in an
        // array of objects ready to used in the postgres functions; 
        // TODO: this array should be stored somewhere else
console.log("request.params.ids: ", request.params.ids);
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


// todo: handle the error where slug is not unique (409 conflict)
internals.create = {

    handler: function(request, reply) {

        if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

        // make sure the url fields have "http://"
        request.payload[0].url = internals.correctUrl(request.payload[0].url);
        request.payload[0].videoUrl = internals.correctUrl(request.payload[0].videoUrl);

        Seneca.actAsync({
                role: "initiatives",
                cmd: "upsert",
                data: request.payload[0]
            })
            .then(function(createdData){

                //console.log("createdData", createdData);

                if(Config.get("email:send")===true && createdData.length>=1){
                    
                    console.log("send email")
                    var emailCtx = {
                        lang: "pt",
                        name: createdData[0].name,
                        contactName: createdData[0].contactName,
                        email: createdData[0].email,
                    };

                    // TODO: the name of the template should be in the payload
                    var templateName = request.payload[0].emailTemplate;
                    Utils.sendEmail(templateName, emailCtx);
                }

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

// todo: handle the error where slug is not unique (409 conflict)
internals.update = {

    handler: function(request, reply) {
console.log("update: \n", request.payload[0]);

        if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

        // make sure the url fields have "http://"
        request.payload[0].url = internals.correctUrl(request.payload[0].url);
        request.payload[0].videoUrl = internals.correctUrl(request.payload[0].videoUrl);


        var previousData = [];
        Seneca.actAsync({
                role: "initiatives",
                cmd: "read",
                searchConditions: [{ id: request.payload[0].id }] // xxx
            })
            .delay(500)
            .then(function(data){

                if (data.length === 0) {
                    return reply(Boom.notFound("The resource does not exist."));
                }

                // bad hack - use function scope to place the retrieved data in a variable that can
                // be accessed in the next step
                previousData = data;
//console.log("previousData: \n", previousData)

                return Seneca.actAsync({
                    role: "initiatives",
                    cmd: "upsert",
                    data: request.payload[0]
                });
            })
            .then(function(updatedData){

                if(Config.get("email:send")===true 
                    && updatedData.length>=1
                    && previousData[0].moderationStatusId === "moderation_status_001_pending"
                    && updatedData[0].moderationStatusId === "moderation_status_002_approved"
                    ){
                    
                    var emailCtx = {
                        lang: "pt",
                        name: updatedData[0].name,
                        contactName: updatedData[0].contactName,
                        email: updatedData[0].email,
                        slug: updatedData[0].slug,
                    };
                    
                    // TODO: the name of the template should be in the payload
                    var templateName = "approved";
                    Utils.sendEmail(templateName, emailCtx);

                }

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

        if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

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
    --data '{"name":"TU - Transição Universitária da FCUL 2","description":"O TU - Transição Universitária é um grupo de intervinientes da Faculdade de Ciências da Universidade de Lisboa (FCUL) que tem como objectivo facilitar a Transição aqui mesmo na nossa Faculdade. <br />Como? Através de sensibilização, aumento da consciência colectiva e realização de projectos práticos que vão de encontro ao objectivo do TU.","typeId":"type_002_transition","domains":["domain_002_husbandry", "domain_010_sharing"],"url":"http://www.tu-fcul.net","contactName":"Raquel Clemente","email":"paulovieira.ml@gmail.com","phone":"","contactOther":"skype: dnavelar","logo":{"filename": "tu-transicao-universitaria-da-fcul-1.gif"},"street":"Faculdade de Ciências da Universidade de Lisboa","city":"Lisboa","postalCode":"1749-016","promoter":"","startDate":"2011-02-01T00:00:00.000Z","registryDate":"2012-03-02T00:00:00.000Z","updateDate":"2012-04-29T23:00:00.000Z","visitorsId":"visitors_001_yes","groupSize":"7","scopeId":"scope_001_urban","target":["target_008_general"],"influence":[500,5],"physicalArea":"","videoUrl":"","docUrl":"jornalTU.pdf","idOld":"120131154140","logoOld":"tuLogo.gif","coordinates":[38.75618,-9.156579999999963]}' 



curl  http://127.0.0.1:6001/api/v1/initiatives/2  \
    --request PUT  \
    --header "Content-Type: application/json"  \
    --data '{ "id": 2, "name": "name 3", "description": "description 3", "typeId": "type_001_permaculture", "typeOther": "type other 3", "domains": ["domain_002_husbandry", "domain_005_art"], "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "email 3", "phone": "phone 3", "contactOther": "contact other 3", "logo":{"filename": "tu-transicao-universitaria-da-fcul-1.gif", "min": 555, "max": 666}, "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_003_confirmation", "groupSize": "9", "scopeId": "scope_002_rural", "target": ["target_999_other"], "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3" }' 



curl  http://127.0.0.1:6001/api/v1/initiatives/676  \
    --request PUT  \
    --header "Content-Type: application/json"  \
    --data '{ "id": 676, "name": "name 3", "description": "description 3", "typeId": "type_001_permaculture", "typeOther": "type other 3", "domains": ["domain_002_husbandry"], "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "email 3", "phone": "phone 3", "contactOther": "contact other 3", "logo":{"filename": "tu-transicao-universitaria-da-fcul-1.gif", "min": 555, "max": 666}, "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_003_confirmation", "groupSize": "9", "scopeId": "scope_002_rural", "target": ["target_999_other"], "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3" }' 



curl  http://127.0.0.1:6001/api/v1/initiatives/6769  \
    --request PUT  \
    --header "Content-Type: application/json"  \
    --data '{ "id": 6769, "name": "name 3", "description": "description 3", "typeId": "type_001_permaculture", "typeOther": "type other 3", "domains": ["domain_002_husbandry", "domain_005_art"], "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "email 3", "phone": "phone 3", "contactOther": "contact other 3", "logo":{"filename": "tu-transicao-universitaria-da-fcul-1.gif", "min": 555, "max": 666}, "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_003_confirmation", "groupSize": "9", "scopeId": "scope_002_rural", "target": ["target_999_other"], "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3" }' 


curl  http://127.0.0.1:6001/api/v1/initiatives/746  \
    --request PUT  \
    --header "Content-Type: application/json"  \
    --data '{ "id": 746, "name": "name 3", "slug":"zzz-25c0e", "description": "description 3", "typeId": "type_001_permaculture", "typeOther": "type other 3", "domains": ["domain_002_husbandry", "domain_005_art"], "domainsOther": "domains other 3", "url": "url 3", "contactName": "contact name 3", "email": "paulovieira.ml@gmail.com", "phone": "phone 3", "contactOther": "contact other 3", "logo":{"filename": "tu-transicao-universitaria-da-fcul-1.gif", "min": 555, "max": 666}, "street": "street 3", "city": "city 3", "postalCode": "postal code 3", "coordinates": [4.4, 5.5], "promoter": "promoter 3", "startDate": "1985-04-05", "registryDate": "2015-10-27", "visitorsId": "visitors_003_confirmation", "groupSize": "9", "scopeId": "scope_002_rural", "target": ["target_999_other"], "targetOther": "targetOther 3", "influence": [4,8], "physicalArea": "physicalArea 3", "videoUrl": "videoUrl 3", "docUrl": "docUrl 3", "moderationStatusId": "moderation_status_002_approved" }' 


curl  http://127.0.0.1:6001/api/v1/initiatives/331  \
    --request DELETE

curl  http://127.0.0.1:6001/api/v1/initiatives/684  \
    --request DELETE

*/


