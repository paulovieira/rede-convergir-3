require("./initiatives-main.css");

//var $ = require("jquery");
var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");



var InitiativesMain = Mn.LayoutView.extend({

    initialize: function(options){
        //debugger;
    },

    template: require('./initiatives-main.html'),

    className: "js-initiatives-main",

    ui: {
        "editBtn": "button.js-btn-edit"
    },

    events: {
        "click @ui.editBtn": function(e){
            //debugger;

            this.channel.request("showView", {
                view: "initiative-edit",
                region: Radio.channel("commonRegions").request("modal")
            });
        }
    },

    onAttach: function(){
    },

    regions: {
        //"initiativesList": "div.mn-r-initiatives-list"
    },

    onBeforeAttach: function(){
    },

});

module.exports = InitiativesMain;

if(NODE_ENV==="dev"){
    window.InitiativesMain = InitiativesMain;
}
