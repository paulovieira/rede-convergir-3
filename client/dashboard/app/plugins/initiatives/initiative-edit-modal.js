//require("./initiatives-edit.css");

var _ = require("underscore");
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

        // make a cheap clone of the definitions (to be used in a nunjucks loops);
        // note that each definition property is an array of objects
        var definitions = JSON.parse(JSON.stringify(Entities.definitions));

        // if the model has the domain, add a corresponding "checked" attribute 
        // (makes the template logic much simpler)
        _.each(definitions.domain, function(obj){
 
            obj.checked = _.contains(this.model.get("domains"), obj.id) ? true : false;
        }, this);

        // same for the initiativeStatusId
        _.each(definitions.initiativeStatus, function(obj){

            obj.checked = this.model.get("initiativeStatusId") === obj.id ? true : false;
        }, this);

        // same for the moderationStatusId
        _.each(definitions.moderationStatus, function(obj){

            obj.checked = this.model.get("moderationStatusId") === obj.id ? true : false;
        }, this);

        // same for the scopeId
        _.each(definitions.scope, function(obj){

            obj.checked = this.model.get("scopeId") === obj.id ? true : false;
        }, this);

        // same for target
        _.each(definitions.target, function(obj){

            obj.checked = _.contains(this.model.get("target"), obj.id) ? true : false;
        }, this);

        // same for the typeId
        _.each(definitions.type, function(obj){

            obj.checked = this.model.get("typeId") === obj.id ? true : false;
        }, this);

        // same for the visitorsId
        _.each(definitions.visitors, function(obj){

            obj.checked = this.model.get("visitorsId") === obj.id ? true : false;
        }, this);


        // repeat the process for the startDate field 
        var startDate = new Date(this.model.get("startDate"));
        var startDateMonth = startDate.getMonth();
        var startDateYear = startDate.getFullYear();

        // in this case we have to generate an array of objects representing the months
        // we reuse the internatiolization data that was previously configured in Fecha (see 
        // the config file)
        definitions.months = _.map(Fecha.i18n.monthNames, function(monthName, i){

            return  { 
                id: i,
                title: monthName,
                checked: startDateMonth === i ? true :  false
            };
        });

        // same for influence (we manually build the array)
        definitions.influence = [
            {id: "0-10",            title: "0 &ndash; 10" },
            {id: "10-25",           title: "10 &ndash; 25" },
            {id: "25-100",          title: "25 &ndash; 100" },
            {id: "100-500",         title: "100 &ndash; 500" },
            {id: "500-5000",        title: "500 &ndash; 5000" },
            {id: "5000-10000",      title: "5000 &ndash; 10000" },
            {id: "10000-999999999", title: "10000 &ndash; 999999999" }
        ];

        _.each(definitions.influence, function(obj){

            // important: use double equals to execute string to number coercion
            obj.checked = this.model.get("influence")[0]  == obj.id.split("-")[0] ? true : false;
        }, this);


        // the contents of this object will be included in the template context (the model)
        return {
            definitions: definitions,
            startDateYear: startDateYear
        };
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
        "formInitiativeModerationStatus": "fieldset#initiatives-moderation-status-form input[type=radio]",
        

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
        this.ui.formInitiativeModerationStatus.checkbox();
        
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
