require("./menu-main.css");


var Q = require("q");
var $ = require("jquery");
var _ = require("underscore");
var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");
//var BaseRouter = require("backbone.base-router");
var Utils = require("../../common/utils");
var Entities = require("../../common/entities");
var Behaviors = require("../../common/behaviors");

var initiativesPlugin = require("../initiatives/initiatives-plugin.js");
var activityPlugin = require("../activity/activity-plugin.js");

var MenuMainState = Mn.State.extend({

    modelClass: Entities.getStateModelClass({
        // allowed values for the key "menuItem"
        menuItem: ["activities", "initiatives", "events", "profile", undefined],
    }),

    defaultState: {
        menuItem: undefined
    },

    // viewEvents: {
    // },

    channelEvents: {
        "change:menuItem": function xyz(menuItem){
            //debugger;
            
            this.set({ "menuItem": menuItem }, {validate: true});
        }
    }
    
});


var MenuMain = Mn.LayoutView.extend({

    initialize: function(options){
    },

    behaviors: [
        // state syncronization setup
        {
            behaviorClass: Behaviors.SyncState,
            stateClass: MenuMainState
        }
    ],

    // dummy class to narrow the scope the css classes to the view's element
    className: "js-menu-main",

    template: require('./menu-main.html'),

    ui: {
        menuItem: "ul > li",
    },

    events: {
    },

    stateEvents: {
        'change:menuItem': function (state, currentMenuItem, options){
            //debugger;
            if(!currentMenuItem){ return; }
/*
            var previousMenuItem = state.previousAttributes().menuItem;
            if(previousMenuItem){

                // NOTE: no need to stop the plugin because that is done automatically when
                // the default is closed
                // see "Attribute Contains Selector":
                //   https://api.jquery.com/attribute-contains-selector/
                this.$("ul > li[id*=" + previousMenuItem + "]").removeClass("active");
            }

            this.$("ul > li[id*=" + currentMenuItem + "]").addClass("active");
*/

            // TODO: in this case the plugin has not been started yet; when we show the 
            // loading view, it will be started; so what is the point of having a "start" method
            // we could always use the "showView" request, passing a special "view: 'default'" option
            // which would pick the first view in the plugin
            // or maybe it only makes sense to start the plugin when the default view is used (so in this case
            // the plugin should not be started when the loading view is used )
            //debugger;

            this.ui.menuItem.removeClass("active");

            // call the method that will start the plugin
            this.triggerMethod(currentMenuItem + ":plugin:start");
        },

    },

    onInitiativesPluginStart: function(){
        //debugger;
        this.ui.menuItem.filter("[id*='initiatives']").addClass('active');

        // Radio.channel("initiatives").request("showView", {
        //     view: "loading-view",
        //     region: this.getRegion("default")
        // });
        initiativesPlugin.showView({
            view: "loading-view",
            region: this.getRegion("default")
        });

        //Utils.logStack();

        initiativesPlugin.start({
            region: this.getRegion("default"),
        });

    },

    onActivitiesPluginStart: function(){
        //debugger;
        this.ui.menuItem.filter("[id*='activities']").addClass('active');

        // Radio.channel("activities").request("showView", {
        //     view: "loading-view",
        //     region: this.getRegion("default")
        // });
        activityPlugin.showView({
            view: "loading-view",
            region: this.getRegion("default")
        });

        var self = this;
        Q.delay(300)
            .then(function(){

                // Radio.channel("activity").request("start", {
                //     region: self.getRegion("default")
                // });
                activityPlugin.start({
                    region: self.getRegion("default")
                });
                
            });

    },

    onAttach: function(){
        //debugger;
        
        var hash = window.location.hash.slice(1).split("?");

        // if the url that is initially loaded doesn't have the hash, force the default one;
        // this will make the router call the route handler

        // IMPORTANT: we shouldn't use router.navigate here (via the plugin's channel),
        // because that would call immediatelly the route handlers; if we instead set 
        // location.hash, it seems the route handler will be executed in a future loop
        // (we might have to use setTimeout to make sure it is working)
        if(!hash[0]){
            //window.location.hash = "#/activities";
            window.location.hash = "#/initiatives";
        }
/*  
        else{
            var now = Date.now();

            // if the hash is given but there is no query string, add a dummy timestamp
            // (to make sure the hash is different)
            if(!hash[1]){
                window.location.hash = hash[0] + "?ts=" + now;
                
            }
            // finally, if there is a query string, use it but replace an eventual 
            // "ts=..."
            else{
                var qs = hash[1].split("&"), qs2 = "";
                var l = qs.length;
                while(l--){
                    if(qs[l] !== "" && qs[l].indexOf("ts=")===-1){
                        qs2 += qs[l] + "&";
                    }
                }

                window.location.hash = hash[0] + "?" + qs2 + "&ts=" + now;
            }
        }
*/

    },

    regions: {
        content: "div#mn-r-content",

        // TODO: we should add this region automatically in the plugin code
        // (no need to define it here)
        default: "div.mn-r-default"
    },


});

if(NODE_ENV==="dev"){
    window.MenuMain = MenuMain;
}

module.exports = MenuMain;
