var _ = require("underscore");
var Backbone = require("backbone");

var InitiativesM = Backbone.Model.extend({
    defaults: {
    },
    // parse: function(response){
    //     return response;
    // }
});

// todo: include also the initiatives that have been excluded 
var InitiativesC = Backbone.Collection.extend({
    model: InitiativesM,
    url: "/api/v1/initiatives"
});

var initiativesC = new InitiativesC();






module.exports.InitiativesM = InitiativesM;
module.exports.InitiativesC = InitiativesC;
module.exports.initiativesC = initiativesC;

module.exports.getStateModelClass = function(allowedValues){

    return Backbone.Model.extend({

        allowedValues: allowedValues,
        keysForValidation: _.keys(allowedValues),
        validate: function(attrs, options){

            for(var key in attrs){
                if(_.contains(this.keysForValidation, key)){
                    var value = attrs[key];
                    if(!_.contains(allowedValues[key], value)){
                        throw new Error('invalid value for key "' + key + '"');
                    }
                }
            }

            return false;
        }
    });

}
if(NODE_ENV==="dev"){
    window.InitiativesM = InitiativesM;
    window.InitiativesC = InitiativesC;
    window.initiativesC = initiativesC;
}
