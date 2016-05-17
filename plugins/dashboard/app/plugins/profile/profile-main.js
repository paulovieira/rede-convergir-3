//require("./maps-main.css");

var Mn = require("backbone.marionette");

var ProfileMainState = Mn.State.extend({

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

var ProfileMain = Mn.LayoutView.extend({

    initialize: function(options){
    },

    template: require('./profile-main.html'),

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

    stateClass: ProfileMainState,
    stateProfile: {
        'change:something': function(state, currentSomething, options){

            //debugger;
            if(!currentSomething){ return; }

        }
    },


});

if(NODE_ENV==="dev"){
    window.ProfileMain = ProfileMain;
}

module.exports = ProfileMain;
