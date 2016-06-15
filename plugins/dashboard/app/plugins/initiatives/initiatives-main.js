require("./initiatives-main.css");

var _ = require("underscore");
//var $ = require("jquery");
var Q = require("q");
var Backbone = require("backbone");
var Mn = require("backbone.marionette");
//var Radio = require("backbone.radio");
var Entities = require("../../common/entities");
var Behaviors = require("../../common/behaviors");

var THIRTY_SECONDS = 30*1000;
//var THIRTY_SECONDS = 5*1000;

var InitiativesMainState = Mn.State.extend({

    defaultState: {
        moderationStatus: {
            moderation_status_001_pending: true,
            moderation_status_002_approved: true,
            moderation_status_003_rejected: false
        },
    },

    viewEvents: {
        "change:moderationStatus": function(filterData){
debugger;
            this.set(filterData);
        }
    },

    // channelEvents: {
    //     "change:menuItem": function xyz(menuItem){
    //         //debugger;
            
    //         this.set({ "menuItem": menuItem }, {validate: true});
    //     }
    // }
    
});

var InitiativesMain = Mn.LayoutView.extend({

    initialize: function(options){
        //debugger;
    },

    template: require('./initiatives-main.html'),

    // include in the template context the definitions object decorated with an extra "checked" property
    templateHelpers: function(){

        // make a cheap clone of the definitions (to be used in a nunjucks loops);
        // note that each definition property is an array of objects
        var definitions = JSON.parse(JSON.stringify(Entities.definitions));

        // the contents of this object will be included in the template context (the model)
        //debugger;
        return {
            state: this.state.attributes,
            definitions: definitions,
        };
    },

    behaviors: [
        // state syncronization setup
        {
            behaviorClass: Behaviors.SyncState,
            stateClass: InitiativesMainState,
            syncEvent: "before:render"
        }
    ],

    className: "js-initiatives-main",

    ui: {
        //"editBtn": "button.js-btn-edit"
        "formInitiativeModerationStatus": "fieldset#initiatives-list-moderation-status-form input[type=checkbox]",
        "tooltips": 'span[data-toggle="tooltip"]',
    },

    // user interface events
    events: {
        "change @ui.formInitiativeModerationStatus": function(e){

            // trigger a change in the state
            this.trigger("change:moderationStatus", Backbone.Syphon.serialize(this));
        },

    },

    stateEvents: {
        "change:moderationStatus": function(state, currentModerationStatus, options){
            //debugger;
            
            // filter the list to show only those corresponding to the selected
            // moderation status checkboxes (given by the view state)
            var selectedModerationStatus = _.chain(this.state.attributes.moderationStatus)
                                            .pick(function(value, key){ return !!value;})
                                            .keys()
                                            .value();


            this.channel.request("showView", {
                view: "loading-view",
                region: this.getRegion("initiativesList")
            });

            // fetch the collection data from the server, but only if the last fetch
            // has been done more than 30 seconds ago
            var p1 = Q()
                    .then(function(){

                        if(Date.now() - Entities.initiativesC.lastFetch > THIRTY_SECONDS){
                            Entities.initiativesC.lastFetch = new Date().getTime();
                            return Entities.initiativesC.fetch();    
                        }
                    });


            var p2 = Q.delay(300);

            var self = this;

            Q.all([p1, p2])
            .then(function(){
//debugger;
                var initiatives = _.filter(Entities.initiativesC.toJSON(), function(obj){
                    //debugger;
                    return _.contains(selectedModerationStatus, obj.moderationStatusId);
                });

                self.channel.request("showView", {
                     view: "initiatives-list",
                     viewOptions: {
                        model: new Backbone.Model({
                            initiatives: initiatives,
                        })
                         
                     },
                     region: self.getRegion("initiativesList"),
                });  
            })

        }
    },

    onAttach: function() {

        // formstone checkbox plugin
        this.ui.formInitiativeModerationStatus.checkbox();
        
        // active tooltips (bootstrap js plugin)
        this.ui.tooltips.tooltip({
            trigger: "hover",  // avoid show the tooltip on focus
            delay: 400,
            placement: "right"
        });
//debugger;
        // force a change in the view state (to make the initial render in the list)
        // see the change:moderationStatus handler in the stateEvents
        this.state.set({
            moderationStatus: {
                moderation_status_001_pending: true,
                moderation_status_002_approved: true,
                moderation_status_003_rejected: false,
                //dummy: Date.now()
            },
        });

    },

    onBeforeRender: function(){
    },


    onBeforeAttach: function(){
    },

    regions: {
        "initiativesList": "div.mn-r-initiatives-list"
    },


});

module.exports = InitiativesMain;

if(NODE_ENV==="dev"){
    window.InitiativesMain = InitiativesMain;
}
