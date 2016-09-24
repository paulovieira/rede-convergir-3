require("./initiatives-list.css");

var $ = require("jquery");
var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");
var Entities = require("../../common/entities");
//var Entities = require("../../common/entitiesx");


var InitiativesList = Mn.LayoutView.extend({

    initialize: function(options){
        //debugger;
    },
    
    template: require('./initiatives-list.html'),

    className: "js-initiatives-list",

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
                throw new Error("there is no model with id " + initiativeId + " in the initiatives collection ");
            }

            // this.channel.request("showView", {
            //     view: "initiative-edit-modal",
            //     viewOptions: {
            //         model: initiativeM
            //     },
            //     region: Radio.channel("public").request("modalRegion")
            // });
            this.plugin.showView({
                view: "initiative-edit-modal",
                viewOptions: {
                    //model: initiativeM,
                    templateContext: initiativeM.toJSON()
                },
                region: Radio.channel("public").request("modalRegion")
            });
        }
    },

    onAttach: function(){
    },

    onBeforeAttach: function(){
    },

});

module.exports = InitiativesList;

if(NODE_ENV==="dev"){
    window.InitiativesList = InitiativesList;
}
