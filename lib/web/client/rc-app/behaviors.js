window.Behaviors = window.Behaviors || {};

// NOTE: this is the view where the behavior is defined
window.Behaviors.ShowModal = Marionette.Behavior.extend({

    events: function(){
        var eventsHash = {};
        eventsHash["click @ui." + this.options.uiKey] = "showModal";

        return eventsHash;
    },

    showModal: function(e){
// debugger;
        var regionKey = this.options.stackLevel === 2 ? "modal2Region" : "modal1Region";

        // if a model instance was explicitely, use it; otherwise try to use some property
        // in the view that invoked the behaviour (using view.model as default)
        var model = this.options.model || this.view[this.options.modelKey || "model"];

        // add the model or collection from the view subjacent to this modal view
        var modalView = new this.options.viewClass({
            model: model
        });

        // first set the content of the modal
        RC[regionKey].show(modalView);

        // then show the modal using bootstrap js api 
        $modal = RC[regionKey].$el.parent().parent();
        $modal.modal("show");
        $modal.one('hidden.bs.modal', _.bind(modalView.destroy, modalView));
    },
});




// close the modal and destroy the view
window.Behaviors.CloseModal = Marionette.Behavior.extend({

    // behaviors have events that are bound to the views DOM
    events: {
        "click @ui.modalCloseBtn": "closeModal",
    },

    closeModal: function(){
// debugger;

        var regionKey = this.options.stackLevel === 2 ? "modal2Region" : "modal1Region";
        var $modal = RC[regionKey].$el.parent().parent()

        // the modal plugin will trigger "hidden.bs.modal", which will destroy the view
        $modal.modal("hide");
    },

});



/*
 window.Behaviors = window.Behaviors || {};

 // NOTE: this is the view where the behavior is defined
 window.Behaviors.ShowModal = Marionette.Behavior.extend({

     events: function(){
        var eventsHash = {};
        
        // default event type is "click"
        var eventType = this.options.eventType || "click";

        eventsHash[eventType + " @ui." + this.options.uiKey] = "showModal";

        return eventsHash;
     },

     showModal: function(e){
debugger;
        // IMPORTANT: we should use e.currentTarget instead of e.target, otherwise we 
        // get a <i> element (instead of <a>) when the click is done in the middle of 
        // the button
        var $anchor = $(e.currentTarget);

        // call preventDefault to avoid having the hash fragment changed
        e.preventDefault();
                
        // NOTE: this.view is the view where the behaviour was declared (that is, menuBodyIV)
        var layerId = $anchor.data("mapId");
        var layerM = mapM.get("ciracLayersC").get(layerId) || 
                    mapM.get("exclusiveLayersC").get(layerId) ||
                    mapM.get("overlappingLayersC").get(layerId);
        
        if(!layerM){
            throw new Error("Unknown mapId")
        }

        var modalView = new this.options.viewClass({
            model: layerM
        });

         var $modal = $("#modal-1");
         var region = Cartografia.modalOneRegion;

         // first set the content of the modal
         region.show(modalView);

         // then show the modal 
         $modal.modal("show");
     },
 });


 // close the modal and destroy the view
 window.Behaviors.CloseModal = Marionette.Behavior.extend({

     // behaviors have events that are bound to the views DOM
     events: {
         "click @ui.closeBtn": "closeModal",
     },

     closeModal: function(){

        var $modal = $("#modal-1");
        $modal.modal("hide");
        this.view.destroy();
     },

 });


*/
