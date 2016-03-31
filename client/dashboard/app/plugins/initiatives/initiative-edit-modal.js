//require("./initiatives-edit.css");

var Backbone = require("backbone");
var Mn = require("backbone.marionette");
//var $ = require("jquery");
var Utils = require("../../common/utils")
var Behaviors = require("../../common/behaviors");
//var Radio = require("backbone.radio");
var Fecha = require("fecha");
var Entities = require("../../common/entities");


var InitiativeEditModal = Mn.LayoutView.extend({

    initialize: function(options) {
        Utils.logStack();
    },

    behaviors: [
        {
            behaviorClass: Behaviors.Modal,
        }
    ],

    template: require('./initiative-edit-modal.html'),

    // include in the template context the definitions object decorated with an extra "checked" property
    templateHelpers: function(){

        // make a cheap clone of the definitions (to be used in a nunjucks loop in the template);
        // each definition property is an array of objects
        var definitions = JSON.parse(JSON.stringify(Entities.definitions));

        // if the model has the domain, add a corresponding "checked" attribute (to be used in the template)
        _.each(definitions.domain, function(obj){
 
           if(_.contains(this.model.get("domains"), obj.id)){  obj.checked = true;  }
        }, this);

        // same for target
        _.each(definitions.target, function(obj){

            if(_.contains(this.model.get("target"), obj.id)){  obj.checked = true;  }
        }, this);

        // same for the typeId
        _.each(definitions.type, function(obj){

            if(this.model.get("typeId") === obj.id){  obj.checked = true;  }
        }, this);

        // same for the initiativeStatusId
        _.each(definitions.initiativeStatus, function(obj){

            if(this.model.get("initiativeStatusId") === obj.id){  obj.checked = true;  }
        }, this);

        // same for the scopeId
        _.each(definitions.scope, function(obj){

            if(this.model.get("scopeId") === obj.id){  obj.checked = true;  }
        }, this);

        // same for the visitorsId
        _.each(definitions.visitors, function(obj){

            if(this.model.get("visitorsId") === obj.id){  obj.checked = true;  }
        }, this);

        //debugger;
        var startDate = new Date(this.model.get("startDate"));
        var startDateMonth = startDate.getMonth();
        var startDateYear = startDate.getFullYear();

        // the contents of this object will be included in the template context (the model)
        return {
            definitions: definitions,
            startDateMonth: startDateMonth,
            startDateYear: startDateYear
        }
    },

    className: "js-initiative-edit",

    ui: {
        "closeModalBtn": "button.js-close-modal",
        "formInitiativeTypes":     "fieldset#initiatives-type-form      input[type=radio]",
        "formInitiativeDomains":   "fieldset#initiatives-domains-form   input[type=checkbox]",
        "formInitiativeVisitors":  "fieldset#initiatives-visitors-form  input[type=radio]",
        "formInitiativeScope":     "fieldset#initiatives-scope-form     input[type=radio]",
        "formInitiativeTarget":    "fieldset#initiatives-target-form    input[type=checkbox]",
        "formInitiativeInfluence": "fieldset#initiatives-influence-form input[type=radio]",
        "formInitiativeStatus":    "fieldset#initiatives-status-form    input[type=radio]",
        

        "tooltips": 'span[data-toggle="tooltip"]',
        "btnSave": "button.js-modal-save"
    },


    events: {
        "click @ui.btnSave": function(e){
            debugger;
            var data = Backbone.Syphon.serialize(this);
            
            // influence
            data.influence = data.influence.split("-");

            // start date
            var startDate = new Date(data.startDateYear, data.startDateMonth, 1);
        }
    },


    onAttach: function() {
//debugger;
        // formstone checkbox plugin
        this.ui.formInitiativeTypes.checkbox();
        this.ui.formInitiativeDomains.checkbox();
        this.ui.formInitiativeVisitors.checkbox();
        this.ui.formInitiativeScope.checkbox();
        this.ui.formInitiativeTarget.checkbox();
        this.ui.formInitiativeInfluence.checkbox();
        this.ui.formInitiativeStatus.checkbox();
        
        // active tooltips (bootstrap js plugin)
        this.ui.tooltips.tooltip({
            trigger: "hover",  // avoid show the tooltip on focus
            delay: 400,
            placement: "right"
        });

        console.log("TODO: na listagem, por uma secção com as iniciativas por aprovar, ou fazer um checkbox e actualizar a lista; nos campos, adicionar o campo do estado de aprovacao; ")
    },

    regions: {
        //"initiativesList": "div.mn-r-initiatives-list"
    },



});

module.exports = InitiativeEditModal;

if (NODE_ENV === "dev") {
    window.InitiativeEditModal = InitiativeEditModal;
}
