var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");
var Utils = require("./utils");

var Modal = Mn.Behavior.extend({

    // at this point the modal's html is already in DOM (in the public region given by 
    // div.mn-r-modal-contents, created in the config); 
    // we now show it using bootstrap's js api; see:
    // http://getbootstrap.com/javascript/#modals-methods
    onAttach: function(){
//debugger;
        var modalRegion = Radio.channel("public").request("modalRegion");
        $modal = modalRegion.$el.parent().parent();
        $modal.modal("show");

        // the dom manipulation to hide the modal is completely handled by bootstrap (via the "data-dismiss" attribute)
        // but still have to attach a handler to actually empty the modalRegion (we just care about destroying the view)
        $modal.one('hidden.bs.modal', function(){

            modalRegion.empty();
        });
    }

});

var SyncState = Mn.Behavior.extend({

    // we place the state sync setup at onBeforeRender because we need a reference to this.channel
    // (which will exist only after the view instance is created); "before:render" is the first view
    // event triggered after the view is created;
    onBeforeRender: function(){
        //debugger;
        this.view.state = new this.options.stateClass({ component: this.view});

        // make the view listen to the events triggered by the view's state
        Mn.State.syncEntityEvents(this.view,       this.view.state,   this.view.stateEvents || {}, this.options.syncEvent || "before:attach");

        // make the view's state listen to the events triggered by the view
        Mn.State.syncEntityEvents(this.view.state, this.view,         this.view.state.viewEvents || {});

        // make the view's state listen to the events triggered by the view's channel
        // (which is the plugin's channel)
        Mn.State.syncEntityEvents(this.view.state, this.view.channel, this.view.state.channelEvents || {});
    }

});


module.exports.Modal = Modal;
module.exports.SyncState = SyncState;

if (NODE_ENV === "dev") {
    window.Behaviors = {};
    window.Behaviors.Modal = Modal;
}
