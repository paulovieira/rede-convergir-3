window.Behaviors = window.Behaviors || {};

window.Behaviors.ShowModal = Marionette.Behavior.extend({

    events: function(){
        var eventsHash = {};
        eventsHash["click @ui." + this.options.uiKey] = "showModal";

        return eventsHash;
    },

    showModal: function(e){
// debugger;
        var regionKey = this.options.stackLevel === 2 ? "modal2Region" : "modal1Region";

        // if a model instance was explicitely given, use it; otherwise try to use some property
        // in the view that invoked the behaviour (using view.model as default);
        var model = this.options.model || this.view[this.options.modelKey || "model"];

        // the model can also be given at run-time via getModel
        if(this.options.getModel){
            model = this.options.getModel();
        }


        // add the model or collection from the view subjacent to this modal view
        var modalView = new this.options.viewClass({
            model: model
        });

        // first set the content of the modal
        RC[regionKey].show(modalView);

        // add the class to define the size of the modal
        var sizeClass = this.options.sizeClass
        if(sizeClass){
            RC[regionKey].$el.parent().addClass(sizeClass);
        }
        
        // then show the modal using bootstrap js api 
        $modal = RC[regionKey].$el.parent().parent();
        $modal.modal("show");
        //$modal.one('hidden.bs.modal', _.bind(modalView.destroy, modalView));
        $modal.one('hidden.bs.modal', function(){

            RC[regionKey].$el.parent().removeClass(sizeClass);
            RC[regionKey].reset();
        });
    },
});

