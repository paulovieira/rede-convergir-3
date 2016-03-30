var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");
var Q = require("q");

var MenuMain = require("./menu-main");
var Entities = require("../../common/entities");
//var MenuRouteHandlers = require("./menu-route-handlers")


var menuPlugin = new Mn.Plugin({
    name: "menu",
    dependencies: [],
    views: [
    {
        viewName: "menu-main",
        viewClass: MenuMain,
    },

    ],

    routes: [
    {
        path: "activities",
        handler: {
            onNavigate: function(routeData){
                //debugger;

                Radio.channel("activity").request("showView", {
                    view: "loading-view",
                    region: this.defaultRegion
                });
                Radio.channel("menu").trigger("change:menuItem", "activities");

                var self = this;
                Q.delay(100)
                    .then(function(){

                        Radio.channel("activity").request("start", {
                            region: self.defaultRegion
                        });
                        
                    });

            }
        }
    },
    {
        path: "initiatives",
        handler: {
            onNavigate: function(routeData){
                //debugger;

                Radio.channel("activity").request("showView", {
                    view: "loading-view",
                    region: this.defaultRegion
                });
                Radio.channel("menu").trigger("change:menuItem", "initiatives");
                //debugger;

                var self = this;
                Q.delay(Entities.initiativesC.fetch())
                    .then(function(){

                        Radio.channel("initiatives").request("start", {
                            region: self.defaultRegion,
                            viewOptions: {
                                collection: Entities.initiativesC
                            }
                        });
                        
                    });

            }
        }
    }
    ],

});

module.exports = menuPlugin;
