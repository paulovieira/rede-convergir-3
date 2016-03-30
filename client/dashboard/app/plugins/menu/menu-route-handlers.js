var Mn = require("backbone.marionette");

var RouteHandler = Mn.Object.extend({
    constructor: function(options){
        this.options = _.extend(this, options);
    },
    initialize: function(){
        debugger;
    },
    onNavigate: function(){
        debugger;
    }
});

var ActivityRouteHandler = RouteHandler.extend({
    onNavigate: function(){
        debugger;
    }
})


module.exports.ActivityRouteHandler = ActivityRouteHandler;