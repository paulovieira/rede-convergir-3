
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

    flyTo: function(targetCenter, targetZoom, options){

        var defaultOptions = {
            duration: 1.2,
            easeLinearity: 0.1
        };

        this.attributes.leafletMap.flyTo(targetCenter, targetZoom || 11, _.extend(defaultOptions, options));
    },

    openPopup: function(slug){

        var model = initiativesC.get(slug);
        if(!model){
            return;
        }

        var _layers = this.attributes.markersLayer._layers;
        for(var key in _layers){

            if(_layers[key].feature.properties.slug===slug){
                _layers[key].openPopup();
            }
        }

    },

    showLabelAndScale: function(slug){
//debugger;
        if(RC.mapIsMoving){
            return;
        }

        var marker, _layers = this.attributes.markersLayer._layers;

        for(var key in _layers){

            if(!marker && _layers[key].feature.properties.slug===slug){
                marker = _layers[key];
            }
        }

        var _zIndex = marker._zIndex;
        if(_zIndex < RC.markersMaxZindex){
            RC.markersMaxZindex++;
            marker._zIndex = RC.markersMaxZindex;
        }

        marker._icon.style["zIndex"] = RC.markersMaxZindex;
        marker._icon.style["transition"] = "transform 0.2s";
        marker._icon.style["transform-origin"] = "center bottom";
        marker._icon.style["transform"] = marker._icon.style["transform"] + " scale(1.1)";

        marker.showLabel();
        marker.label._container.style["zIndex"] = RC.markersMaxZindex;

    },

    hideLabelAndResetScale: function(slug){

        var marker, _layers = this.attributes.markersLayer._layers;

        for(var key in _layers){

            if(!marker && _layers[key].feature.properties.slug===slug){
                marker = _layers[key];
            }
        }

        marker.hideLabel();
        marker._icon.style["transition"] = "";
        var i = marker._icon.style["transform"].indexOf("scale(1.1)");
        if(i>=0){
            // restore the original values
            
            // transform-origin comes from .leaflet-zoom-animated, but it seems
            // we don't have to restore it
            //marker._icon.style["transform-origin"] = "0 0";  
            marker._icon.style["transform"] = marker._icon.style["transform"].substring(0, i);
        }

    }

});

var mapM = new MapM({
    center: [39.5676, -8.7068],
    initialZoom: 7,
    maxZoom: 22,
    minZoom: 6,
    menuOpen: false,  // we will toggle the menu when the map view is created

    tileLayersC: new ExclusiveLayersC(),
    markersLayer: L.geoJson(null)
});

RC.popupTemplate = _.template("<h5><a href='<%= url %>' target='_blank' title='Ver a ficha completa desta iniciativa (abre numa nova tab)'><b><%= name %></b></a>  <a href='<%= url %>' target='_blank' title='Clique para ver a página da iniciativa (abre numa nova tab)'><i style='' class='fa fa-external-link'></i></a> </h5>");


_.extend(mapM.get("markersLayer").options, { 
    pointToLayer: function (feature, latlng){ 

        var  marker = L.marker(feature.properties.coordinates, {
            icon: iconsC[feature.properties.typeId] || iconsC["other"],
            //riseOnHover: true
        });

        marker.bindLabel(feature.properties.name);

        marker.on("add", function(e){

            if(e.target._zIndex > RC.markersMaxZindex){
                RC.markersMaxZindex = e.target._zIndex;
            }
        });

        marker.on("mouseover", function(e){

            if(RC.mapIsMoving){
                return;
            }

            var marker = e.target;
            var _zIndex = marker._zIndex;
            if(_zIndex < RC.markersMaxZindex){
                RC.markersMaxZindex++;
                marker._zIndex = RC.markersMaxZindex;
            }

            marker._icon.style["zIndex"] = RC.markersMaxZindex;
            marker._icon.style["transition"] = "transform 0.2s";
            marker._icon.style["transform-origin"] = "center bottom";
            marker._icon.style["transform"] = marker._icon.style["transform"] + " scale(1.1)";

            // increase the zindex of the label
            marker.label._container.style["zIndex"] = RC.markersMaxZindex;
        });

        marker.on("mouseout", function(e){

            var marker = e.target;
            
            marker._icon.style["transition"] = "";
            var i = marker._icon.style["transform"].indexOf("scale(1.1)");
            if(i>=0){
                // restore the original values
                
                // transform-origin comes from .leaflet-zoom-animated, but it seems
                // we don't have to restore it
                //marker._icon.style["transform-origin"] = "0 0";  
                marker._icon.style["transform"] = marker._icon.style["transform"].substring(0, i);
            }
        });

        marker.on("click", function(e){
//debugger;
            var marker = e.target;
            var slug = marker.feature.properties.slug

            initiativesC.get(slug).select();
/*


            marker.hideLabel();
            marker._icon.style["transition"] = "";

            var i = marker._icon.style["transform"].indexOf("scale(1.1)");
            if(i>=0){
                // restore the original values
                
                // transform-origin comes from .leaflet-zoom-animated, but it seems
                // we don't have to restore it
                //marker._icon.style["transform-origin"] = "0 0";  
                marker._icon.style["transform"] = marker._icon.style["transform"].substring(0, i);
            }

            var zoom = mapM.attributes.leafletMap._zoom;
            mapM.flyTo(e.latlng, zoom >= 10 ? zoom : 9);
*/
            cartografiaChannel.request("scrollTo", slug);
            cartografiaChannel.request("addClassSelected", slug);
        });

        marker.on("click_old", function(e){

            var marker = e.target;

            marker.hideLabel();
            marker._icon.style["transition"] = "";

            var i = marker._icon.style["transform"].indexOf("scale(1.1)");
            if(i>=0){
                // restore the original values
                
                // transform-origin comes from .leaflet-zoom-animated, but it seems
                // we don't have to restore it
                //marker._icon.style["transform-origin"] = "0 0";  
                marker._icon.style["transform"] = marker._icon.style["transform"].substring(0, i);
            }

            var zoom = mapM.attributes.leafletMap._zoom;
            mapM.flyTo(e.latlng, zoom >= 10 ? zoom : 9);

            var slug = marker.feature.properties.slug;
            cartografiaChannel.request("scrollTo", slug);
        });

        var popupContents = RC.popupTemplate({
            url: "/iniciativas/" + feature.properties.slug,
            name: feature.properties.name
        });

        marker.bindPopup(popupContents);

        marker.on("popupclose", function(e){

            // the currently selected model, if any, will be deselected 
            initiativesC.deselect();
            
        });

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
        //tileLayer: L.tileLayer("http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg")
        tileLayer: L.tileLayer("http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg", {
            subdomains: "abcd"
        })
        
        //tileLayer: L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png")
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

    initialize: function() {

        // apply the backbone.select mixin (must also be done in the respective collection)
        Backbone.Select.Me.applyTo(this);
    },

    idAttribute: "slug"
});

var InitiativesC = Backbone.Collection.extend({

    initialize: function(models) {

        // apply the backbone.select mixin (must also be done in the respective model)
        Backbone.Select.One.applyTo(this, models);

        // listen for the events triggered by the select plugin
        this.on("select:one", this.selectInitiative);

        this.on("deselect:one", this.deselectInitiative);
    },

    model: InitiativeM,

    selectInitiative: function(model){
        //debugger;
        var slug = model.get("slug");

        mapM.hideLabelAndResetScale(slug);
        
        // xxx we have to remove this to open the popup
        console.log("we have to remove this to open the popup whent he marker is clicked (looks like the popup is toggled)");
        console.log("TODO: in the current version online, how are we handling the zindex when the marker is clicked? does the zindex change suring the flyTo animation?");
        mapM.openPopup(slug);
        
        var updateZIndex = function(){
            var marker, _zIndex;    
            for(key in mapM.attributes.markersLayer._layers){
                marker = mapM.attributes.markersLayer._layers[key];
                if(marker.feature.properties.slug === slug){
                    _zIndex = marker._zIndex;
                    if(_zIndex < RC.markersMaxZindex){
                        RC.markersMaxZindex++;
                        marker._zIndex = RC.markersMaxZindex;
                    }

                    marker._icon.style["zIndex"] = "" + RC.markersMaxZindex;
                }
            }
        };

        // this a bit hacky; we have to do it because the flyTo animation seems to be
        // resetting he zindex of the marker while it lasts;
        // we are taking into account that the duration for the 
        // flyTo animation is 1200ms; note that bind a callback to the 'moveend'
        // with .once will not work because that event is fired at the beggining of the
        // animation
        // TODO: report this bug in github

        // setTimeout(updateZIndex, 1300);
        // setTimeout(updateZIndex, 1400);
        setTimeout(updateZIndex, 1500);

        var zoom = mapM.attributes.leafletMap.getZoom();
        mapM.flyTo(initiativesC.get(slug).get("coordinates"), zoom >= 10 ? zoom : 9);

        // add css class
        cartografiaChannel.request("addClassSelected", slug);
    },

    deselectInitiative: function(model){
//debugger;
        var slug = model.get("slug");

        // remove css class
        cartografiaChannel.request("removeClassSelected", slug);
    },

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
            array[i]["visible"] = true;


            // if(array[i]["name"].toLowerCase()==="tamera" || array[i]["name"].toLowerCase()==="biovilla" || array[i]["name"].toLowerCase()==="biovilla2"){
            //     array[i]["visible"] = true;

            // }
            // else{
            //     array[i]["visible"] = false;
            // }
            
// console.log(array[i]["name"]);
// console.log(array[i]["circleMarker"]);


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
                    coordinates: array[i]["coordinates"],
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

console.log("TODO: when the marker is mouseovered, we should change the zindex (the option raiseonhover is not enough, because we want th merker to be above even after the mouseout)")


console.log("TODO: when the initiative is clicked in the list, the respective marker should be also above the others")

// artifically add a new project
// _.each(RCData.initiatives, function(obj){
//     var obj2;
//     if(obj.name.toLowerCase()==="biovilla"){

//         obj2 = _.clone(obj);
//         obj2.name = "biovilla2";
//         obj2.slug = "biovilla2";
//         obj2.circleMarker = true;
//         RCData.initiatives.push(obj2);
//     }
// });

var initiativesC = new InitiativesC();
initiativesC.reset(RCData.initiatives, { parse: true });


RCData.iconSize = [32, 37];
RCData.iconAnchor = [16, 37];
RCData.popupAnchor = [0, -34];
RCData.labelAnchor = [10, -22];

var iconsC = {
    other: L.icon({
        iconUrl: "/static/_images/mapicons/outro.png",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_permaculture: L.icon({
        iconUrl: "/static/_images/mapicons/permacultura.png",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_transition: L.icon({
        iconUrl: "/static/_images/mapicons/transicao.png",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_community: L.icon({
        iconUrl: "/static/_images/mapicons/terracomunidade.png",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_culture: L.icon({
        iconUrl: "/static/_images/mapicons/culturaeducacao.png",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_health: L.icon({
        iconUrl: "/static/_images/mapicons/saudebemestar.png",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_economy: L.icon({
        iconUrl: "/static/_images/mapicons/economiafinancas.png",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_construction: L.icon({
        iconUrl: "/static/_images/mapicons/espacoconstruido.png",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_tools: L.icon({
        iconUrl: "/static/_images/mapicons/eng-ecologica.png",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_soil_nature: L.icon({
        iconUrl: "/static/_images/mapicons/gestaoterranatureza.png",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),



};

//mapM.set("markersLayer", L.geoJson(geoJson, {}));
//debugger;
//mapM.get("leafletMap").addLayer(mapM.get("markersLayer"));

