

var MapIV = Mn.ItemView.extend({
    attributes: {
        style: "height: 100%; xborder: solid green 1px; "
    },
    template: "map/templates/map-container.html",

    initialize: function(){

        cartografiaChannel.reply("updateMarkers", function(options){
debugger;
            this.updateMarkers(options || {});
        }, this);

    },

    initializeMap: function(){

        // create the leaflet map
        var div = this.$("div.mn-leaflet-map").get(0);

        // crate the leaflet map in the correct div
        this.map = L.map(div, {
            zoomControl: false,
            attributionControl: false,
            zoom: this.model.get("zoom"),
            maxZoom: this.model.get("maxZoom"),
            minZoom: this.model.get("minZoom"),
            center: this.model.get("center"),
        });
        this.model.set("leafletMap", this.map);
        this.model.addZoomControl();
        this.model.addScaleControl();
        this.model.addMapEvents();

/*
        this.map.on("movestart", function(){
            RC.mapIsMoving = true;
        });

        this.map.on("moveend", _.debounce(this.updateModel, 10), this);

        this.map.on("moveend", function(){
            RC.mapIsMoving = false;

            //console.log("update markers at " + Date.now())
        }, this);
*/
        //this.model.set("active", true);
        

        // add the default base map (tile layer) to the leaflet map
        baseLayersC.get(RCData.initial.baseLayer).select();

        // we have an instance to L.GeoJson in the map model, but it is not added to the map yet
        this.model.get("markersLayer").addTo(this.map);
        
    },

    // updateModel: function(){

    //     var zoom = this.map.getZoom(), center = this.map.getCenter();

    //     if(this.model.attributes.zoom !== zoom){
    //         //console.log("mapIV.updateModel (zoom) @ " + Date.now());
    //         this.model.set("zoom", zoom);
    //     }

    //     if(this.model.attributes.center.lat !== center.lat || 
    //         this.model.attributes.center.lng !== center.lng){
    //         //console.log("mapIV.updateModel (center) @ " + Date.now());
    //         this.model.set("center", center);
    //     }
        
    // },

    updateMarkers: function(options){

        // ids of the initiatives that are currently in the map
        var initiativesIds = [];
        var leafletIds = [];
        var markersGroup = this.model.get("markersLayer");
        var _layers = markersGroup._layers;

        for(var key in _layers){
            initiativesIds.push(_layers[key].feature.properties.id);
            leafletIds.push(key);
        }
//debugger;


        // var x = markersGroup._layers;
        // debugger;

        // var initiativesIds = _.map(markersGroup._layers, function(layer){
        //     return layer.feature.properties.id;
        // });

        //debugger;

        // array with geoJson objects that will be added to the map
        var geoJsonData = [];

        var push, model, i, j, l, l2;
        for(i=0, l=initiativesC.models.length; i<l; i++){
            model = initiativesC.models[i];

            // this initiative should be added to the map (if it isn't already)
            if(model.attributes.inVisibleBounds && model.attributes.inFilters){

                // verify if this initiative is currently in the map; if not we add the geoJson object to the array
                push = true;
                for(j=0, l2=initiativesIds.length; j<l2; j++){
                    if(initiativesIds[j]===model.attributes.id){
                        push = false;
                        break;
                    }
                }

                // if(!RC.markerIsVisibleInMap(model.attributes.geoJson)){
                //     push = false;
                // };

                if(push){
                    //debugger
                    geoJsonData.push(model.attributes.geoJson);
                }
            }

            // this initiative should be removed from the map (if it isn't already)
            else{

                for(j=0, l2=initiativesIds.length; j<l2; j++){
                    if(initiativesIds[j]===model.attributes.id){
                        //debugger;
                        markersGroup.removeLayer(leafletIds[j])
                        break;
                    }
                }
            }
        }

//debugger;        

        if(geoJsonData.length > 0){
            markersGroup.addData(geoJsonData);    
        }

        options = options || {};

        // if(options.fitBounds && !_.isEmpty(_layers) && RC.initialDisplayFlag > 0){
        //     var bounds = markersGroup.getBounds();
        //     this.model.attributes.leafletMap.fitBounds(bounds, {
        //         // add 30px padding from the top to account for the height of the icon;
        //         // add 400px padding from the left to account for the menu (however the width 
        //         // of the menu is dinamic, so this must be improved)
        //         paddingTopLeft: [450, 30],
        //         maxZoom: 11
        //     });                            
        // }

        RC.initialDisplayFlag++;

        


        

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

        // show the menu already open at the beggining
        mapM.set("menuOpen", true); 
    }
});

