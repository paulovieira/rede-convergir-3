

var MapIV = Mn.ItemView.extend({
    attributes: {
        style: "height: 100%; xborder: solid green 1px; "
    },
    template: "map/templates/map-container.html",

    initialize: function(){
    },

    initializeMap: function(){

        // create the leafmap map
        var mapIndex = this.model.get("mapIndex");
        var center = this.model.get("center");
        var initialZoom = this.model.get("initialZoom");
        var maxZoom = this.model.get("maxZoom");
        var minZoom = this.model.get("minZoom");

        var div = this.$("div.mn-leaflet-map").get(mapIndex);

        // crate the leaflet map in the correct div
        this.map = L.mapbox.map(div, undefined, {
            zoomControl: false,
            attributionControl: false,
            zoom: initialZoom,
            maxZoom: maxZoom,
            minZoom: minZoom,
            center: [center.lat, center.lng],
        });

        this.model.set("active", true);
        this.model.set("leafletMap", this.map);

        // add the initial tilelayer
        cartografiaChannel.request("selectLayer", 0, "mapquest");
        //cartografiaChannel.request("selectLayer", 0, "hydda-base");
        

        // add initial layers (given in the query params)
        // NOTE: can now make the request to "selectLayer", because at this point
        // the leaflet map has been created
        _.each(Cartografia.queryParams, function(value, layerId){

            // TODO: the map index is hardcoded
            cartografiaChannel.request("selectLayer", 0, layerId);

        });

        delete Cartografia.queryParams;

    },



    initializeMapMenu: function(){

        // instantiate and render the menu view
        this.menuLV = new MenuLV({
            model: this.model
        });
        this.menuLV.render();

        // add a reference to the parent view
        //this.menuLV.mapIV = this;

        // create the control instance and add to the map
        this.menuControl = new L.Control.BackboneView({
            view: this.menuLV,
            position: "topleft"
        });
//debugger;
        // map.addControl will add the html element of the menuLV view to the DOM
        // in the right place
        this.map.addControl(this.menuControl);

        // the following assertion should be true
        //this.map === this.menuLV._map;

        // we must have the parent with the correct height
        this.menuLV.$el.parent().css("height", "100%");
        this.menuLV.$el.parent().parent().css("height", "100%");

    },

    // add the zoom control
    initializeZoom: function(options) {

        var defaultOptions = {
            position: "topright"
            //position: "bottomright",
        };

        var zoomControl = L.control.zoom(_.extend(defaultOptions, options));
        this.map.addControl(zoomControl);
    },

    // add the scale control
    initializeScale: function(options) {

        var defaultOptions = {
            position: "bottomright",
            imperial: false,
            maxWidth: 130
        };

        var scaleControl = L.control.scale(_.extend(defaultOptions, options));
        window.scaleControl = scaleControl;
        this.map.addControl(scaleControl);
    },

    initializeGeocoder: function(){
        var geocoderOptions = {
            placeholder: "Search address...",
            errorMessage: "Morada desconhecida",
            placeholder: "Inserir morada",
            geocoder: L.Control.Geocoder.bing('AoArA0sD6eBGZyt5PluxhuN7N7X1vloSEIhzaKVkBBGL37akEVbrr0wn17hoYAMy'),
            //geocoder: L.Control.Geocoder.google('AIzaSyBoM_J6Ysno6znvigDm3MYja829lAeVupM'),
            
            collapsed: "true",
        };

        var geocoderControl = new L.Control.geocoder(geocoderOptions);
        this.map.addControl(geocoderControl);
    },

    onAttach: function(){

        this.initializeMap();
        this.initializeMapMenu();
        this.initializeZoom();
        this.initializeScale();
        this.initializeGeocoder();

        // show the menu already open at the beggining
        map0M.set("menuOpen", true); 
    }
});

