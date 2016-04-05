var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");
var Utils = require("./utils");

var Modal = Mn.Behavior.extend({

    initialize: function(){

        this.modalRegion = Radio.channel("public").request("modalRegion");
        this.$modal = this.modalRegion.$el.parent().parent();
    },

    // at this point the modal's html is already in DOM (in the public region given by 
    // div.mn-r-modal-contents, created in the config); 
    // we now show it using bootstrap's js api; see:
    // http://getbootstrap.com/javascript/#modals-methods
    onAttach: function(){

        var self = this;

        // trigger a custom event on the view when the modal has been made visible 
        // to the user (will wait for CSS transitions to complete).
        // we need this to start other plugins/libs that requires the modal to fully
        // loaded (such as creating a leaflet map)
        this.$modal.one('shown.bs.modal', function(){

            self.view.triggerMethod("shown:bs:modal");
        });

        // the dom manipulation to hide the modal is completely handled by bootstrap (via the "data-dismiss"
        // attribute) but we still have to attach a handler to actually empty the modalRegion (we just care
        // about destroying the view)

        this.$modal.one('hidden.bs.modal', function(){

            self.modalRegion.empty();
        });

        this.$modal.modal("show");

    },
/*
    onHideModal: function(){
        
        // this method is called after we get the response to the PUT request (save data);
        // instead of using the bootstrap js api directly, we simulate a click in the "close"
        // button and let bootstrap handle the closing for us

        // note: data-dismiss="modal" is the special data attributes that bootstrap
        // identifies as the element whose click will close the modal
        this.view.$('[data-dismiss="modal"]').trigger("click");
    }
*/
});

var SyncState = Mn.Behavior.extend({

    // we place the state sync setup at onBeforeRender because we need a reference to this.channel
    // (which will exist only after the view instance is created); "before:render" is the first view
    // event triggered after the view is created;
    onBeforeRender: function(){
        //debugger;
        this.view.state = new this.options.stateClass({ component: this.view});

        // make the view listen to the events triggered by the view's state
        //Mn.State.syncEntityEvents(this.view,       this.view.state,   this.view.stateEvents || {}, this.options.syncEvent || "before:attach");
        Mn.State.syncEntityEvents(this.view,       this.view.state,   this.view.stateEvents || {}, this.options.syncEvent);

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
