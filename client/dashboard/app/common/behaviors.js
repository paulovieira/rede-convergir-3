var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");

var Modal = Mn.Behavior.extend({

    // at this point the modal's html is already in DOM (in the region given by 
    // div.mn-r-modal-contents); we now show it using bootstrap's js api
    // http://getbootstrap.com/javascript/#modals-methods
    onAttach: function(){

        // this.view is a reference to the View instance that the Behavior is attached to
        var region = Radio.channel("commonRegions").request("modal");
        $modal = region.$el.parent().parent();
        $modal.modal("show");

        // attach a handler to empty the region;
        // the dom manipulation to hide the modal is completely handled by bootstrap
        // (we just care about destroying the view)
        $modal.one('hidden.bs.modal', function(){

            region.empty();
        });
    }

});

module.exports.Modal = Modal;

if (NODE_ENV === "dev") {
    window.Behaviors = {};
    window.Behaviors.Modal = Modal;
}
