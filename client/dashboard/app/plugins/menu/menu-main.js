
require("./menu-main.css");

var Q = require("q");
var $ = require("jquery");
var _ = require("underscore");
var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");
var BaseRouter = require("backbone.base-router");
var Entities = require("../../common/entities");

var StateModelClass = Backbone.Model.extend({

    pluginNames: ["activities", "initiatives", "events", "profile", undefined],

    validate: function(attrs, options){

        var value = attrs["menuItem"];
        if(_.contains(this.pluginNames, value)){
            return false;
        }

        throw new Error("invalid plugin name: " + value);
    }
});

var MenuMainState = Mn.State.extend({

    modelClass: StateModelClass,

    initialState: {
        menuItem: undefined
    },

    // viewEvents: {
    // },

    channelEvents: {
        "change:menuItem": function(menuItem){
            //debugger;
            this.set({"menuItem": menuItem}, {validate: true});
        }
    }
    
});


var MenuMain = Mn.LayoutView.extend({

    initialize: function(options){
    },

    onBeforeRender: function(){
        this.state = new MenuMainState({ component: this});

        // make the view listen to the events triggered by the state
        Mn.State.syncEntityEvents(this,       this.state,   this.stateEvents || {}, "before:attach");

        // make the state listen to the events triggered by the view
        Mn.State.syncEntityEvents(this.state, this,         this.state.viewEvents || {});    

        // make the state listen to the events triggered by the view's channel
        // (which is the plugin's channel)
        Mn.State.syncEntityEvents(this.state, this.channel, this.state.channelEvents || {});
    },

    // dummy class to narrow the scope the css classes to the view's element
    className: "js-menu-main",

    template: require('./menu-main.html'),

    ui: {
        menuItem: "ul > li",
    },

    events: {
        // "click @ui.menuItem": function(e){

        //     var id = $(e.currentTarget).prop("id").substring("js-menu-item-".length);
        //     this.trigger("click:menuItem", id);
        // }
    },

    //stateClass: MenuMainState,
    stateEvents: {
        'change:menuItem': function(state, currentMenuItem, options){
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
            this.triggerMethod(currentMenuItem + ":plugin:start");

        },

    },

    onInitiativesPluginStart: function(){
        //debugger;
        this.ui.menuItem.filter("[id*='initiatives']").addClass('active');

        Radio.channel("initiatives").request("showView", {
            view: "loading-view",
            region: this.getRegion("default")
        });

        var self = this;
        Q.delay(100)
            .then(Entities.initiativesC.fetch())
            .then(function(){

                Radio.channel("initiatives").request("start", {
                    region: self.getRegion("default"),
                    viewOptions: {
                        collection: Entities.initiativesC
                    }
                });
                
            });
    },

    onActivitiesPluginStart: function(){
        //debugger;
        this.ui.menuItem.filter("[id*='activities']").addClass('active');

        Radio.channel("activities").request("showView", {
            view: "loading-view",
            region: this.getRegion("default")
        });

        var self = this;
        Q.delay(100)
            .then(function(){

                Radio.channel("activities").request("start", {
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
            window.location.hash = "#/activities";
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
/*
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

var activityHandler = new RouteHandler({

    onNavigate: function(){
        console.log("xyz @ actvity, ", this.originalRoute)
        this.set("menuItem", menuItem);
    }
})

var MenuRouter = BaseRouter.extend({
    onNavigate: function(routeData) {
        debugger;
        var routeObj = routeData.linked;
        routeObj.query = routeData.query;
        routeObj.params = routeData.params;
        routeObj.originalRoute = routeData.originalRoute;
        routeObj.onNavigate();
    },
    routes: {
        "activity": activityHandler,
        "initiatives": new RouteHandler({
            xyz: function(){
                console.log("xyz @ initiatives, ", this.originalRoute)
            }
        })
    }
});

var menuRouter = new MenuRouter();
*/
if(NODE_ENV==="dev"){
    window.MenuMain = MenuMain;
}

module.exports = MenuMain;
