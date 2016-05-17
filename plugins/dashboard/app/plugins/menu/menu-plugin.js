var Q = require("q");
var _ = require("underscore")
var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");
var BaseRouter = require("backbone.base-router");


var MenuMain = require("./menu-main");
var Entities = require("../../common/entities");
//var MenuRouteHandlers = require("./menu-route-handlers")



var MenuPlugin = Mn.Plugin.extend({
    name: "menu",
    dev: NODE_ENV==="dev",
    initialize: function(options){
        //debugger;

        var routes = {};

        // route: "activities"

        routes["activities"] = {


            onNavigate: function(routeData){
                //debugger;

                // TODO: this trigger will only have effect if the plugin has been started already
                // (because only then will the default view have been instantiated, which means the view's state
                // have also been instantiated and so the channel's trigger will reach it)
                // so when this method executes we must check is the plugin is running; and if not start it manually
                // so calling this route is equivalent to starting the respective plugin
                //console.log(this.isRunning)
                this.channel.trigger("change:menuItem", "activities");
/*
                Radio.channel("activity").request("showView", {
                    view: "loading-view",
                    region: this.defaultRegion
                });

                this.channel.trigger("change:menuItem", "activities");

                var self = this;
                Q.delay(100)
                    .then(function(){

                        Radio.channel("activity").request("start", {
                            region: self.defaultRegion
                        });
                        
                    });
*/
            }
        };

        routes["activities"].onNavigate = _.bind(routes["activities"].onNavigate, this);

        // route: "initiatives "

        routes["initiatives"] = {

            onNavigate: function(routeData){
                //debugger;
                //console.log(this.isRunning)
                this.channel.trigger("change:menuItem", "initiatives");
/*
                Radio.channel("initiatives").request("showView", {
                    view: "loading-view",
                    region: this.defaultRegion
                });
                this.channel.trigger("change:menuItem", "initiatives");
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
*/
            }
        };

        routes["initiatives"].onNavigate = _.bind(routes["initiatives"].onNavigate, this);


        this.router = new Mn.Router({ 
            routes: routes
        });
    },
});

var menuPlugin = new MenuPlugin({
    
    dependencies: [],
    views: [
    {
        viewName: "menu-main",
        viewClass: MenuMain,
    },

    ],


/*
    xroutes: [
    {
        path: "activities",
        handler: {
            onNavigate: function(routeData){
                debugger;

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

                Radio.channel("initiatives").request("showView", {
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
*/
});

if(NODE_ENV==="dev"){
    window.menuPlugin = menuPlugin;
}

module.exports = menuPlugin;
