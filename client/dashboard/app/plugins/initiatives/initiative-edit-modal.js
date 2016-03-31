//require("./initiatives-edit.css");

var Mn = require("backbone.marionette");
var Utils = require("../../common/utils")
var Behaviors = require("../../common/behaviors");
//var Radio = require("backbone.radio");


var InitiativeEditModal = Mn.LayoutView.extend({

    initialize: function(options) {
        Utils.logStack();
    },

    behaviors: {
        modalBehavior: {
            behaviorClass: Behaviors.Modal,
        }
    },

    template: require('./initiative-edit-modal.html'),

    className: "js-initiative-edit",

    ui: {
//        "closeModalBtn": "button.js-close-modal"
    },

    events: {
        // "click @ui.closeModalBtn": function(e){
        //     debugger;
        // }
    },

    onAttach: function() {
        //ModalView.prototype.showBootstrapModal.call(this);
    },

    regions: {
        //"initiativesList": "div.mn-r-initiatives-list"
    },

    onBeforeAttach: function() {
    },


});

module.exports = InitiativeEditModal;

if (NODE_ENV === "dev") {
    window.InitiativeEditModal = InitiativeEditModal;
}
