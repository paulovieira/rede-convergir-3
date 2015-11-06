

var MapIV = Mn.ItemView.extend({
    attributes: {
        style: "height: 100%; xborder: solid green 1px; "
    },
    template: "map/templates/map-container.html",

    initialize: function(){
    },

    initializeMap: function(){

        // create the leaflet map
        var center = this.model.get("center");
        var initialZoom = this.model.get("initialZoom");
        var maxZoom = this.model.get("maxZoom");
        var minZoom = this.model.get("minZoom");

        var div = this.$("div.mn-leaflet-map").get(0);

        // crate the leaflet map in the correct div
        this.map = L.map(div, {
            zoomControl: false,
            attributionControl: false,
            zoom: initialZoom,
            maxZoom: maxZoom,
            minZoom: minZoom,
            center: center,
        });

/*
        this.map = L.mapbox.map(div, undefined, {
            zoomControl: false,
            attributionControl: false,
            zoom: initialZoom,
            maxZoom: maxZoom,
            minZoom: minZoom,
            center: center,
        });
*/
        this.model.set("active", true);
        this.model.set("leafletMap", this.map);

        // we have an instance to L.GeoJson in the model, but it is not added to the map yet
        this.model.get("markersLayer").addTo(this.map);

        // add the initial tilelayer
        //debugger
        cartografiaChannel.request("selectLayer", "osm-base");
        //cartografiaChannel.request("selectLayer", "hydda-base");
/*        

        // add initial layers (given in the query params)
        // NOTE: can now make the request to "selectLayer", because at this point
        // the leaflet map has been created
        _.each(Cartografia.queryParams, function(value, layerId){

            // TODO: the map index is hardcoded
            cartografiaChannel.request("selectLayer", layerId);

        });

        delete Cartografia.queryParams;
*/
    },

    updateMarkers: function(){

        // var geojsonMarkerOptions = {
        //     radius: 8,
        //     fillColor: "#ff7800",
        //     color: "#000",
        //     weight: 1,
        //     opacity: 1,
        //     fillOpacity: 0.8
        // };


        // ids of the initiatives that are currently in the map
        var initiativesIds = [];
        var leafletIds = [];
        var _layers = this.model.get("markersLayer")._layers;

        for(var key in _layers){
            initiativesIds.push(_layers[key].feature.properties.id);
            leafletIds.push(key);
        }



        // var x = this.model.get("markersLayer")._layers;
        // debugger;

        // var initiativesIds = _.map(this.model.get("markersLayer")._layers, function(layer){
        //     return layer.feature.properties.id;
        // });

        //debugger;

        // array with geoJson objects that will be added to the map
        var geoJsonData = [];

        var push, model, i, j, l, l2;
        for(i=0, l=initiativesC.models.length; i<l; i++){
            model = initiativesC.models[i];

            // this initiative should be added to the map (if it isn't already)
            if(model.attributes.visible){

                // verify if this initiative is currently in the map; if not we add the geoJson object to the array
                push = true;
                for(j=0, l2=initiativesIds.length; j<l2; j++){
                    if(initiativesIds[j]===model.attributes.id){
                        push = false;
                        break;
                    }
                }

                if(push){
                    //debugger
                    geoJsonData.push(model.attributes.geoJson);
                }
            }

            // this initiative should be removed to the map (if it isn't already)
            else{

                for(j=0, l2=initiativesIds.length; j<l2; j++){
                    if(initiativesIds[j]===model.attributes.id){
                        //debugger;
                        this.model.get("markersLayer").removeLayer(leafletIds[j])
                        break;
                    }
                }
            }
        }


//debugger;        
        if(geoJsonData.length > 0){
            this.model.get("markersLayer").addData(geoJsonData);    
        }
        

        // this.geoJson = L.geoJson(geoJsonData, {
        //     pointToLayer: function (feature, latlng) {

        //         //return L.circleMarker(latlng, geojsonMarkerOptions);
        //         //debugger;
        //         return L.marker(feature.properties.coordinates, {
        //             icon: iconsC[feature.properties.typeId] || iconsC["other"]
        //         });
        //     }
        // });
        // this.geoJson.addTo(this.map);

    },

    initializeMapMenu: function(){
//debugger;
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

    // initializeGeocoder: function(){
    //     var geocoderOptions = {
    //         placeholder: "Search address...",
    //         errorMessage: "Morada desconhecida",
    //         placeholder: "Inserir morada",
    //         geocoder: L.Control.Geocoder.bing('AoArA0sD6eBGZyt5PluxhuN7N7X1vloSEIhzaKVkBBGL37akEVbrr0wn17hoYAMy'),
    //         //geocoder: L.Control.Geocoder.google('AIzaSyBoM_J6Ysno6znvigDm3MYja829lAeVupM'),
            
    //         collapsed: "true",
    //     };

    //     var geocoderControl = new L.Control.geocoder(geocoderOptions);
    //     this.map.addControl(geocoderControl);
    // },

    onAttach: function(){

        this.initializeMap();
        this.updateMarkers();
        this.initializeMapMenu();
        this.initializeZoom();
        this.initializeScale();
//        this.initializeGeocoder();

        // show the menu already open at the beggining
        mapM.set("menuOpen", true); 
    }
});

