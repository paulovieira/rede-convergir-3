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

if(NODE_ENV==="dev"){
    window.InitiativesM = InitiativesM;
    window.InitiativesC = InitiativesC;
    window.initiativesC = initiativesC;
}
