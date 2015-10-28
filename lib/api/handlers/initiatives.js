var Hoek = require("hoek");
var Boom = require("boom");
var Joi = require("joi");
var Config = require("config");

var Utils = require("../../common/utils");
// var Pre = require("../../common/prerequisites");
var Validate = require("../../common/validate");

var internals = {};

internals.validatePayloadForCreate = function(value, options, next) {

    var schemaCreate = Joi.object({

        name: Joi.string().required(),
        description: Joi.string().required(),
        typeId: Joi.string().required(),
        typeOther: Joi.string().allow(""),
        domainsOther: Joi.string().allow(""),
        url: Joi.string().allow(""),
        contactName: Joi.string().required(),
        email: Joi.string().allow(""),
        phone: Joi.string().allow(""),
        contactOther: Joi.string().allow(""),
        logo: Joi.string().allow(""),
        street: Joi.string().allow(""),
        city: Joi.string().allow(""),
        postalCode: Joi.string().allow(""),
        coordinates: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2),  // array must contain at least two numbers
        promoter: Joi.string().allow(""),
        startDate: Joi.date().iso(),
        //registryDate: Joi.date().iso(),
        //updateDate: Joi.date().iso(),
        visitorsId: Joi.string().required(),
        groupSize: Joi.string().allow(""),
        scopeId: Joi.string().required(),
        targetOther: Joi.string().allow(""),
        influence: Joi.array().items(Joi.number()),
        physicalArea: Joi.string().allow(""),
        videoUrl: Joi.string().allow(""),
        docUrl: Joi.string().allow(""),
    });

    return Validate.payload(value, options, next, schemaCreate);
};

internals.validatePayloadForUpdate = function(value, options, next) {

    var schemaCreate = Joi.object({
        
        id: Joi.number().integer().min(0).required(),

        // from here below, it is the same validation as in "create"
        name: Joi.string(),
        description: Joi.string(),
        typeId: Joi.string(),
        typeOther: Joi.string().allow(""),
        domainsOther: Joi.string().allow(""),
        url: Joi.string().allow(""),
        contactName: Joi.string(),
        email: Joi.string().allow(""),
        phone: Joi.string().allow(""),
        contactOther: Joi.string().allow(""),
        logo: Joi.string().allow(""),
        street: Joi.string().allow(""),
        city: Joi.string().allow(""),
        postalCode: Joi.string().allow(""),
        coordinates: Joi.array().items(Joi.number().required(), Joi.number().required()).length(2),  // array must contain at least two numbers
        promoter: Joi.string().allow(""),
        startDate: Joi.date().iso(),
        //registryDate: Joi.date().iso(),
        //updateDate: Joi.date().iso(),
        visitorsId: Joi.string(),
        groupSize: Joi.string().allow(""),
        scopeId: Joi.string(),
        targetOther: Joi.string().allow(""),
        influence: Joi.array().items(Joi.number()),
        physicalArea: Joi.string().allow(""),
        videoUrl: Joi.string().allow(""),
        docUrl: Joi.string().allow(""),
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
