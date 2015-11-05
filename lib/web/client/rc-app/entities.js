
var LayerM = Backbone.Model.extend({
    initialize: function() {

        // apply the backbone.select mixin (must also be done in the respective collection)
        Backbone.Select.Me.applyTo(this);
    },

});


var LayersBaseC = Backbone.Collection.extend({

    addTileLayer: function(layerM) {
//debugger;
        var leafletMap = layerM.collection.parent.get("leafletMap");

        if (!leafletMap || leafletMap.hasLayer(layerM.get("tileLayer"))) {
            return;
        }

        // 1. add the tile layer
        leafletMap.addLayer(layerM.get("tileLayer"));

        // 3. add the legend (if defined in the project in tilemill)
        var legend = layerM.get("tileJson").legend;
        if (legend) {
            leafletMap.legendControl.addLegend(legend);
        }

    },

    removeTileLayer: function(layerM) {

        var leafletMap = layerM.collection.parent.get("leafletMap");

        if (!leafletMap || !leafletMap.hasLayer(layerM.get("tileLayer"))) {
            return;
        }

        // 1. remove the tile layer
        leafletMap.removeLayer(layerM.get("tileLayer"));

        // 3. remove the legend (if defined in the project in tilemill)
        var legend = layerM.get("tileJson").legend;
        if (legend) {
            leafletMap.legendControl.removeLegend(legend);
        }

    },

    // update the layers in the underlying leaflet map (tileLayer, gridlayer, etc)
    addLayer: function(layerM) {
//        debugger;

        var layer = layerM.get("tileLayer");

        // if it is a regular map, the tileLayer property will be an instance of L.TileLayer...
        if (layer && layer instanceof L.TileLayer) {

            this.addTileLayer(layerM);
            //this.updateMenuEntry(layerM, true)
        }
        // // if it is a sequential map, it will be a Backbone collection
        // else if (tileLayer instanceof Backbone.Collection) {

        //     // this is a sequential map
        //     layerM.addSequentialControl();
        //     this.updateMenuEntry(layerM, true)
        // } else {
        //     throw new Error("invalid Tilelayer");
        // }
    },

    removeLayer: function(layerM) {
//        debugger;

        var layer = layerM.get("tileLayer");

        if (layer && layer instanceof L.TileLayer) {

            this.removeTileLayer(layerM);
            //this.updateMenuEntry(layerM, false)
        } 
        // else if (tileLayer instanceof Backbone.Collection) {

        //     layerM.removeSequentialControl();
        //     this.updateMenuEntry(layerM, false)
        // } else {
        //     throw new Error("invalid Tilelayer");
        // }
    }



});

/*
*/

/*
var OverlappingLayersC = LayersBaseC.extend({
    model: LayerM,
    initialize: function(models) {

        // apply the backbone.select mixin (must also be done in the respective model)
        Backbone.Select.Many.applyTo(this, models);


        // listen for the events triggered by the select plugin

        // NOTE: we have to listen to select:all and select:none as well;
        // if there is only 2 models selected and we deselect 1, the event that fires
        // is "select:some";
        // but if there is only 1 model selected and we deselect it, the event that fires
        // is "select:none" ("select:some" is not fired in this case)
        this.on("select:some select:all select:none", this.updateLayers);

    },

    // update the layers in the underlying leaflet map (tileLayer, gridlayer, etc)
    updateLayers: function(diff) {
debugger;
        var selected = diff.selected;
        var deselected = diff.deselected;

        // the selected array holds models which have been newly selected ;
        // likewise, models in the deselected array have changed their status from 
        // selected to deselected
        var i, l;
        for (i = 0, l = selected.length; i < l; i++) {
            this.addLayer(selected[i]);
        }

        // repeat for models that have been deselected
        for (i = 0, l = deselected.length; i < l; i++) {
            this.removeLayer(deselected[i]);
        }
    }
});
*/


var ExclusiveLayersC = LayersBaseC.extend({
    model: LayerM,
    initialize: function(models) {

        // apply the backbone.select mixin (must also be done in the respective model)
        Backbone.Select.One.applyTo(this, models);

        // listen for the events triggered by the select plugin
        this.on("select:one", this.addLayer);
        this.on("deselect:one", this.removeLayer);
    },
});
/*
*/

var MapM = Backbone.Model.extend({
    initialize: function(){},

    flyTo: function(coordinates){

        this.get("leafletMap").flyTo(coordinates, 11, {
            duration: 1.5,
            easeLinearity: 0.1
        });
    },

    openPopup: function(slug){

        var model = initiativesC.get(slug)
        if(!model){
            return;
        }

        var _layers = this.get("markersLayer")._layers;
        // for(var key in _layers){
        //     if(_layers[key].feature.properties.id
        // }

        for(var key in _layers){

            if(_layers[key].feature.properties.slug===slug){
                //debugger;
                _layers[key].openPopup();
            }
        }

    }
});

var mapM = new MapM({
    center: [39.5676, -8.7068],
    initialZoom: 7,
    maxZoom: 13,
    minZoom: 6,
    menuOpen: false,  // we will toggle the menu when the map view is created

    tileLayersC: new ExclusiveLayersC(),
    markersLayer: L.geoJson(null)
});

RC.popupTemplate = _.template("<h5><a href='<%= url %>' target='_blank'><%= name %></a>  <a href='<%= url %>' target='_blank'><i style='' class='fa fa-external-link'></i></a> </h5>");


//font-size: 75%;
_.extend(mapM.get("markersLayer").options, { 
    pointToLayer: function (feature, latlng){ 
//        return L.circleMarker(latlng); 

        var marker = L.marker(feature.properties.coordinates, {
            icon: iconsC[feature.properties.typeId] || iconsC["other"]
        });

        var popupContents = RC.popupTemplate({
            url: "/iniciativas/" + feature.properties.slug,
            name: feature.properties.name
        });

        marker.bindPopup(popupContents);
        return marker;
    },
    // onEachFeature: function(feature, layer){
    // },
    // filter: function(feature, layer) {
    // }
    
});



// var markersLayer = L.geoJson(null, {
//     // pointToLayer: function (feature, latlng) {

//     //     //return L.circleMarker(latlng, geojsonMarkerOptions);
//     //     //debugger;
//     //     return L.marker(feature.properties.coordinates, {
//     //         icon: iconsC[feature.properties.typeId] || iconsC["other"]
//     //     });
//     // }
// });

//mapM.set("markersLayer", markersLayer);

mapM.get("tileLayersC").parent = mapM;
//mapM.get("geoJsonLayersC").parent = mapM;

_.each(RCData.exclusiveLayers, function(tileJson){

    var layerM = new LayerM({
        id: tileJson.id,
        tileJson: tileJson,
        //tileLayer: L.mapbox.tileLayer(tileJson)
        tileLayer: L.tileLayer("http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg")
    });

    mapM.get("tileLayersC").push(layerM);
});


/*


// add the hardcoded tileJson objects in Cirac.exclusiveLayers to the main Cirac.layers array (before the ones that come from the server)
_.each(Cirac.exclusiveLayers, function(tileJson) {
//debugger;
    Cirac.layers.unshift(tileJson);
});

// deep clone the mapsMenu array for each leaflet map
mapM.set("mapsMenu", JSON.parse(JSON.stringify(Cirac.mapsMenu)));


// populate the layers collection in mapM (using the mapIds in the mapMenu)

_.each(mapM.get("mapsMenu"), function(groupObj) {

    _.each(groupObj.maps, function(mapObj) {

        var tileJson = _.findWhere(Cirac.layers, {
            id: mapObj.mapId
        });
        if (!tileJson) {
            return;
        }

        var mapIndex = 0;

        // add the map index directly to the objects in the mapMenu array
        mapObj.mapIndex = mapIndex;

        // add some properties from the tileJson to the object in the mapsMenu (useful
        // to render the menu)
        mapObj.name = tileJson.name;
        mapObj.hasInfo = $.trim(tileJson.description).length > 0;


        tileJson.maxzoom = 9;
        var layerM = new LayerM({
            id: tileJson.id,
            zindex: tileJson.zIndex || 0,
            opacity: 100,
            tileJson: tileJson,
            mapIndex: mapIndex
        });


        // these are the 3 required fields in the tileJson to create a L.mapbox.tileLayer object
        // NOTE: the sequential maps don't have these fields, so the tileLayer property won't be set 
        if (tileJson.tiles && tileJson.minzoom && tileJson.maxzoom) {
            layerM.set("tileLayer", L.mapbox.tileLayer(tileJson));

            // the gridLayer + gridControl is only added if the teaser has been
            // defined in tilemill (otherwise it makes no sense to add )
            if (Cartografia.hasUTFGrid(tileJson)) {
                layerM.set("gridLayer", L.mapbox.gridLayer(tileJson));
                
                var gridControlOptions = {};

                var sanitizer = function(data){

                    var scriptTags = ["<script>", "</script>"];
                    var indexStart = data.indexOf(scriptTags[0]);
                    var indexEnd   = data.indexOf(scriptTags[1]);

                    if(indexStart===-1 || indexEnd===-1){
                        return data;
                    }

                    var code = $.trim(data.substring(indexStart+scriptTags[0].length, indexEnd));
                    var fn;
                    try{
                        fn = new Function(code);
                    }
                    catch(e){
                        fn = new Function("return 'Error in the teaser definition: " + e.message + "';")
                    }
                    finally {
                        return fn();
                    }
                };

                var gridControlOptions = {
                    sanitizer: sanitizer
                };

                layerM.set("gridControl", L.mapbox.gridControl(layerM.get("gridLayer"), gridControlOptions));
            }
        } 


        // NOTE: the above calls to the L.mapbox method are syncronous because we are passing 
        // the actual tileJson object (it would be asyncronous if we passed a string with the
        // id of the map, in which case the respective tileJson would be fetched with an ajax call)

        if (tileJson.isExclusive) {
            mapM.get("exclusiveLayersC").push(layerM);
        } 
        else if(tileJson.isCirac) {
            mapM.get("ciracLayersC").push(layerM);
        }
        else {
            mapM.get("overlappingLayersC").push(layerM);
        }

    });
});

*/





var InitiativeM = Backbone.Model.extend({

    initialize: function(){},
    idAttribute: "slug"

});

var InitiativesC = Backbone.Collection.extend({

    initialize: function(){},

    model: InitiativeM,

    parse: function(array){
        
        // array is the raw data coming from the server; here we add the missing data;
        for(var i=0; i<array.length; i++){

            // 1. add the human-readable type informations
            var type = RCData.definitions[array[i]["typeId"]];

            if(type){
                array[i]["typeTitle"]       = type.title.pt;
                array[i]["typeDescription"] =  type.description.pt;
            }
            else{
                array[i]["typeTitle"]       = array[i]["typeOther"] || "(no type)";
                array[i]["typeDescription"] =  "";
            }

            // 2. all initiatives are visible by default
            // if(array[i]["name"].toLowerCase()==="tamera" || array[i]["name"].toLowerCase()==="biovilla"){
            //     array[i]["visible"] = true;
            // }
            // else{
            //     array[i]["visible"] = false;
            // }
            array[i]["visible"] = true;
            

            // 3. create the geoJson object for this initiative
            array[i]["geoJson"] = {
                type: "Feature",
                properties: {
                        id: array[i]["id"],
                        name: array[i]["name"],
                        typeId: array[i]["typeId"],
                        typeTitle: array[i]["typeTitle"],
                        typeDescription: array[i]["typeDescription"],
                        typeOther: array[i]["typeOther"],
                        slug: array[i]["slug"],
                        description: array[i]["description"],
                        logo: array[i]["logo"],
                        coordinates: array[i]["coordinates"]
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [array[i]["coordinates"][1], array[i]["coordinates"][0]]
                }
            };
        }

        return array;
    }

});

var initiativesC = new InitiativesC();
initiativesC.reset(RCData.initiatives, { parse: true });


RCData.iconSize = [32, 37];
RCData.popupAnchor = [0, -18];
var iconsC = {
    other: L.icon({
        iconUrl: "/static/_images/mapicons/outro.png",
        iconSize: RCData.iconSize,
        popupAnchor: RCData.popupAnchor
    }),
    type_permaculture: L.icon({
        iconUrl: "/static/_images/mapicons/permacultura.png",
        iconSize: RCData.iconSize,
        popupAnchor: RCData.popupAnchor
    }),
    type_transition: L.icon({
        iconUrl: "/static/_images/mapicons/transicao.png",
        iconSize: RCData.iconSize,
        popupAnchor: RCData.popupAnchor
    }),
    type_community: L.icon({
        iconUrl: "/static/_images/mapicons/terracomunidade.png",
        iconSize: RCData.iconSize,
        popupAnchor: RCData.popupAnchor
    }),
    type_culture: L.icon({
        iconUrl: "/static/_images/mapicons/culturaeducacao.png",
        iconSize: RCData.iconSize,
        popupAnchor: RCData.popupAnchor
    }),
    type_health: L.icon({
        iconUrl: "/static/_images/mapicons/saudebemestar.png",
        iconSize: RCData.iconSize,
        popupAnchor: RCData.popupAnchor
    }),
    type_economy: L.icon({
        iconUrl: "/static/_images/mapicons/economiafinancas.png",
        iconSize: RCData.iconSize,
        popupAnchor: RCData.popupAnchor
    }),
    type_construction: L.icon({
        iconUrl: "/static/_images/mapicons/espacoconstruido.png",
        iconSize: RCData.iconSize,
        popupAnchor: RCData.popupAnchor
    }),
    type_tools: L.icon({
        iconUrl: "/static/_images/mapicons/eng-ecologica.png",
        iconSize: RCData.iconSize,
        popupAnchor: RCData.popupAnchor
    }),
    type_soil_nature: L.icon({
        iconUrl: "/static/_images/mapicons/gestaoterranatureza.png",
        iconSize: RCData.iconSize,
        popupAnchor: RCData.popupAnchor
    }),



};

//mapM.set("markersLayer", L.geoJson(geoJson, {}));
//debugger;
//mapM.get("leafletMap").addLayer(mapM.get("markersLayer"));

