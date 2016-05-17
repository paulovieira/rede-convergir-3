//require("./maps-main.css");

var Mn = require("backbone.marionette");

var EventsMainState = Mn.State.extend({

    initialize: function(){
    },

    defaultState: {
        something: null
    },

    viewEvents: {
        "click:somethingInTheUi": function(value) {
            //debugger;
            this.set("something", value);
        }
    },

});

var EventsMain = Mn.LayoutView.extend({

    initialize: function(options){
    },

    template: require('./events-main.html'),

    ui: {
    },

    events: {
    },

    onAttach: function(){
    },

    regions: {
    },

    onBeforeAttach: function(){
    },

    stateClass: EventsMainState,
    stateEvents: {
        'change:something': function(state, currentSomething, options){

            //debugger;
            if(!currentSomething){ return; }

        }
    },


});

if(NODE_ENV==="dev"){
    window.EventsMain = EventsMain;
}

module.exports = EventsMain;
