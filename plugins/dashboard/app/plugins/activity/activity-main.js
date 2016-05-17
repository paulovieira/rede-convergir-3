//require("./maps-main.css");

var Mn = require("backbone.marionette");

var ActivityMain = Mn.LayoutView.extend({

    initialize: function(options){
    },

    template: require('./activity-main.html'),

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



});

if(NODE_ENV==="dev"){
    window.ActivityMain = ActivityMain;
}

module.exports = ActivityMain;
