
var MapIV = Mn.ItemView.extend({
    
    attributes: {
        style: "height: 100%; xborder: solid green 1px; "
    },
    
    template: "map/templates/map-container.html",

    onAttach: function(){

        // create the leaflet map
        var mapContainer = this.$("div.mn-leaflet-map").get(0);
        this.model.createMap(mapContainer);
        this.model.initializeMap();
    }
});

