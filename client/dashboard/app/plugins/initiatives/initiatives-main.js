require("./initiatives-main.css");

//var $ = require("jquery");
var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");
var Entities = require("../../common/entities");


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
            var $target = $(e.currentTarget);
            var initiativeId = $target.data("initiativeId");
            var initiativeM = Entities.initiativesC.get(initiativeId);

            if(!initiativeM){
                throw new Error("there is no model with id " + initiativeId + " in the initiatives collection");
            }

            //initiativeM.set("_definitions", )

            this.channel.request("showView", {
                view: "initiative-edit-modal",
                viewOptions: {
                    model: initiativeM
                },
                region: Radio.channel("public").request("modalRegion")
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
