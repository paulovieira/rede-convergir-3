"use strict";

var Joi = require("joi");
var Hoek = require("hoek");
var Boom = require("boom");
var _s = require('underscore.string');
var _ = require('underscore');
var Config = require('nconf');
var Nunjucks = require('hapi-nunjucks');
var Utils = require('./utils');


var internals = {};

// general validation functoin para URL params; accepts multiple comma-separated params, like this
// host/api/xyz/3,5,6
internals.generalParamValidation = function(value, options, next, paramNameSingular, paramNamePlural, schema){

    value[paramNamePlural] = _s.trim(value[paramNamePlural], ",").split(",");

    // must be an objet like this: "{ ids: [3,5,7] }"

    var objKeys = {};
    objKeys[paramNamePlural] = Joi.array().unique().items(schema);
    var objSchema = Joi.object().keys(objKeys);

    var validation = Joi.validate(value, objSchema, Config.get('hapi:joi'));

    if (validation.error) {
        return next(validation.error);
    }

    // at this point validation.value is on object of the form { ids: [3] } or { ids: [3,5] }; we want it to be
    // { ids: [{id: 3}, {id: 5}] }  (then we simply have pass the [{id: 3}, {id: 5}] to the postgres function)

    validation.value[paramNamePlural] = validation.value[paramNamePlural].map(function(paramValue) {

        var obj = {};
        obj[paramNameSingular] = paramValue;
        return obj;
    });

    return next(undefined, validation.value);
};

exports.ids = function(value, options, next) {

    if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

    var idSchema = Joi.number().integer().min(0);
    return internals.generalParamValidation(value, options, next, "id","ids", idSchema);
};

exports.mapsIds = function(value, options, next) {

    if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

    var nameSchema = Joi.string().min(1);
    return internals.generalParamValidation(value, options, next, "id","ids", nameSchema);
};


/*
old version!

exports.ids = function(value, options, next) {

    if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

    value.ids = _s.trim(value.ids, ",").split(",");

    var idSchema = Joi.number().integer().min(0);

    // must be an objet like this: "{ ids: [3,5,7] }""
    var schema = Joi.object().keys({
        ids: Joi.array().unique().items(idSchema)
    });

    var validation = Joi.validate(value, schema, Config.get('hapi:joi'));

    if (validation.error) {
        return next(validation.error);
    }

    // at this point validation.value is on object of the form { ids: [3] } or { ids: [3,5] }; we want it to be
    // { ids: [{id: 3}, {id: 5}] }  (then we simply have pass the [{id: 3}, {id: 5}] to the postgres function)

    validation.value.ids = validation.value.ids.map(function(id) {
        return {
            "id": id
        };
    });

    return next(undefined, validation.value);
};
*/
exports.payload = function(value, options, next, schema, overrideJoiOptions) {

    if(global.NODE_ENV==="dev"){  Utils.logCallsite(Hoek.callStack()[1]);  }

    if (_.isObject(value) && !_.isArray(value)) {
        value = [value];
    }

    // validate the elements of the array using the given schema; note that if the "stripUnknown" is true
    // (which is the case), then properties whose keys are not present in the schema will be deleted

    var validated = [], tempValidate;
    for(var i=0; i<value.length; i++){
        tempValidate = Joi.validate(value[i], schema, Config.get('hapi:joi'));
        if (tempValidate.error) {
            return next(tempValidate.error);
        }

        validated.push(tempValidate.value);
    }

//    console.log("validated: ", validated);


    // validateIds was executed before this one; the ids param (if defined) is now an array of objects like this: 
    // { ids: [{ id: 5}, { id: 7}] }
    var ids = options.context.params.ids;

//    console.log("confirm that this is an array of objects: ", ids);

    // if the ids param is defined, make sure that the ids in the param and the ids in the payload are consistent
    if (ids) {

        for (var i = 0, l = validated.length; i < l; i++) {
            console.log("ids[i]", ids[i])
            console.log("validated[i]", validated[i])
            // the id in the URL param and in the payload must be equal and in the same order

            if (ids[i].id !== validated[i].id) {
                return next(Boom.conflict("The ids given in the payload and in the URI must match (including the order)."));
            }
        }
    }

    // update the value that will be available in request.payload when the handler executes;
    // note tgat Joi will coerc the values to of the type defined in the schemas (so instead of
    // "someProp": "100" we will have "someProp": 100)

    return next(undefined, validated);
};

exports.lang = function(value, options, next){

    value.lang = encodeURIComponent(value.lang || "").toLowerCase();

    // if lang param is allowed, set the global variable in Nunjucks
    // and return it as it came (do nothing)
    if(_.contains(Config.get("allowedLanguages"), value.lang)){
        Nunjucks.addGlobal("lang", value.lang);
    }
    else {
        // otherwise change the param to undefined; this will make
        // the pre-requisite method redirect to the general 404 page 
        value.lang = undefined;
    }

    return next(undefined, value);  
};

