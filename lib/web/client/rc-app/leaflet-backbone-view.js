var ControlLV = Mn.LayoutView.extend({

    onRender: function(){

        this.disableMouseInteractions();
    },

    // all mouse related actions in the menu (such as dblclick) should not propagate
    // to the map; example: a double click on the map gives rise to a zoom in, but
    // we don't want that; 
    disableMouseInteractions: function(){
        // NOTE: to work in firefox we must add "DOMMouseScroll MozMousePixelScroll" (!???)
        // http://stackoverflow.com/questions/13274326/firefoxjquery-mousewheel-scroll-event-bug
        
        $(this.el).on("mousewheel DOMMouseScroll MozMousePixelScroll dblclick", function(e){
            e.stopPropagation();
        });

        // check the correct event name (from modernizr)
        var eventName = "mousedown";
        if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          eventName = "touchstart";
        }

        $(this.el).on(eventName, function(e){
          //console.log(eventName)
          e.stopPropagation();
        });

        // NOTE: for non-touch browsers, "click" and "dblclick" are not necessary ("mousedown" is sufficient); but they are for
        // touch devices (where "touchstart" will be used insteadof "mousedown")
        $(this.el).on("dblclick", function(e){
           e.stopPropagation();
        });

        $(this.el).on("click", function(e){
           e.stopPropagation();
        });

    },
});

L.Control.BackboneView = L.Control.extend({
    options: {
        position: "bottomright"             
    },

    initialize: function(options){

        L.Util.setOptions(this, options);

        if(options.view){
            this._view = options.view;  
        }
        
    },

    onAdd: function (map) {

        if(this._view){
            this._view._map = this._map;
        }

        return this._view.el;
    },

    onRemove: function(map){

        //this.view.destroy();
        //this.view = undefined;
    },

    getView: function(){
        return this._view;
    },

/*
    // this is essentially the locally already implemented in the addTo method in L.Control
    resetView: function(view){
//debugger;
        var map = this._map,
            container, pos, corner;

        if (map) {
            this._view = view;  
            view.map = map;
            pos = this.getPosition();
            corner = map._controlCorners[pos];

            // remove the current element
            corner.removeChild(this._container);

            // update the element to the the one relative to the passed view
            container = this._container = view.el;
            L.DomUtil.addClass(container, 'leaflet-control');

            if (pos.indexOf('bottom') !== -1) {
                corner.insertBefore(container, corner.firstChild);
            } else {
                corner.appendChild(container);
            }
        }

        return this;
    }
*/
});
