var _ = require("underscore");
var Backbone = require("backbone");

var InitiativesM = Backbone.Model.extend({
    defaults: {
    },

    // we need to specify the urlRoot because the url in the collection
    // has a query string, so the updates would result in something like
    // PUT /api/v1/initiatives?moderationStatusId=all/123
    urlRoot: "/api/v1/initiatives"

});

// todo: include also the initiatives that have been excluded 
var InitiativesC = Backbone.Collection.extend({
    model: InitiativesM,
    url: "/api/v1/initiatives?moderationStatusId=all"
});

var initiativesC = new InitiativesC();

// epoch time (1970.01.01)
initiativesC.lastFetch = 0;



module.exports.definitions = window.definitions;
//module.exports.InitiativesM = InitiativesM;
//module.exports.InitiativesC = InitiativesC;
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
//    window.InitiativesM = InitiativesM;
//    window.InitiativesC = InitiativesC;
    window.initiativesC = initiativesC;
}
