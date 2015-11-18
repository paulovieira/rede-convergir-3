
var LayerM = Backbone.Model.extend({
    initialize: function() {

        // apply the backbone.select mixin (must also be done in the respective collection)
        Backbone.Select.Me.applyTo(this);
    },

});

var BaseLayersC = Backbone.Collection.extend({
    model: LayerM,
    initialize: function(models) {

        // apply the backbone.select mixin (must also be done in the respective model)
        Backbone.Select.One.applyTo(this, models);

        // listen for the events triggered by the select plugin
        this.on("select:one", this.addLayer);
        this.on("deselect:one", this.removeLayer);
    },

    // update the layers in the underlying leaflet map (tileLayer, gridlayer, etc)
    addLayer: function(layerM) {

        var leafletMap, layer = layerM.get("baseLayer");

        if (layer) {

            leafletMap = mapM.get("leafletMap");

            // if the leaflet map already has this layer, there's nothing to add
            if (!leafletMap || leafletMap.hasLayer(layer)) {
                return;
            }

            // add the tile layer and syncronize the "selected" attribute with the respective property in the model 
            leafletMap.addLayer(layer);
            layerM.set("selected", true);
        }
    },

    removeLayer: function(layerM) {

        var leafletMap, layer = layerM.get("baseLayer");

        if (layer) {

            leafletMap = mapM.get("leafletMap");

            // if the leaflet map does not have the layer, there's nothing to remove
            if (!leafletMap || !leafletMap.hasLayer(layer)) {
                return;
            }

            leafletMap.removeLayer(layer);
            layerM.set("selected", false);
        } 
    },


});


var SelectableM = Backbone.Model.extend({
    initialize: function() {

        // apply the backbone.select mixin (must also be done in the respective collection)
        Backbone.Select.Me.applyTo(this);
    },

});

var SelectableC = Backbone.Collection.extend({
    model: SelectableM,
    initialize: function(models) {

        // apply the backbone.select mixin (must also be done in the respective model)
        Backbone.Select.Many.applyTo(this, models);

        // listen for the events triggered by the select plugin
        // this.on("select:one", this.addLayer);
        // this.on("deselect:one", this.removeLayer);
        this.on("select:some", this.updateAttr)
        this.on("select:all", this.updateAttr)
        this.on("select:none", this.updateAttr)
    },

    updateAttr: function(diff){

        for(var i=0; i<diff.selected.length; i++){
            diff.selected[i].set("selected", true);
        }

        for(i=0; i<diff.deselected.length; i++){
            diff.deselected[i].set("selected", false);
        }
    }
});

var typesC = new SelectableC();
typesC.reset(
    _.filter(RCData.definitionsAll, function(obj, key){
        return obj.id.indexOf("type") === 0 ? true : false;
    })
);

// initial selection of types (from the query string)
_.each(RCData.initial.types, function(typeId){

    typesC.get(typeId).select();
});


var domainsC = new SelectableC();
domainsC.reset(
    _.filter(RCData.definitionsAll, function(obj, key){
        return obj.id.indexOf("domain") === 0 ? true : false;
    })
);

// initial selection of domains (from the query string)
_.each(RCData.initial.domains, function(typeId){

    domainsC.get(typeId).select();
});





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

        var _layers = this.attributes.markersLayer._layers;
        var marker = _layers[RC.getMarker[slug]];

        if(!marker){
            return;
        }

        if(!marker.isPopupOpen()){
            marker.openPopup();    
        }

    },

    showLabelAndScale: function(slug){

        if(RC.mapIsMoving){
            return;
        }

        var _layers = this.attributes.markersLayer._layers;
        var marker = _layers[RC.getMarker[slug]];

        if(!marker){
            return;
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

        var _layers = this.attributes.markersLayer._layers;
        var marker = _layers[RC.getMarker[slug]];

        if(!marker){
            return;
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
    center: [RCData.initial.centerLat, RCData.initial.centerLng],
    initialZoom: RCData.initial.zoom,
    maxZoom: 13,
    minZoom: 6,
    menuOpen: false,  // we will toggle the menu when the map view is created

    baseLayersC: new BaseLayersC(),
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

            var m = e.target

            if(m._zIndex > RC.markersMaxZindex){
                RC.markersMaxZindex = m._zIndex;
            }

            RC.getMarker[m.feature.properties.slug] = m["_leaflet_id"];
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

            cartografiaChannel.request("scrollTo", slug);
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

            var marker = e.target;
            var slug = marker.feature.properties.slug;

            initiativesC.deselect(initiativesC.get(slug));
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

// raw data for the base layers (will be vivified as instances of the Layer model);
// the "baseLayer" attribute is either an instance of L.tileLayer or an instance of
// L.featureGroup, where the group has 2 or more instances of L.tileLayer



mapM.get("baseLayersC").add(RCData.baseLayers);




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
        model.set("selected", model.selected);
        var slug = model.get("slug");

        mapM.hideLabelAndResetScale(slug);
        
        // open the marker's popup; the call to this method is delayed because leaflet will automatically open the popup when the marker
        //  is clicked, and calling marker.openPopup explicitely seems to be closing it (it acts more like togglePopup())
        setTimeout(function(){
            mapM.openPopup(slug);
        }, 10); 

        // add css class
        cartografiaChannel.request("addClassSelected", slug);

        // flyTo animation
        var zoom = mapM.attributes.leafletMap.getZoom();
        mapM.flyTo(initiativesC.get(slug).get("coordinates"), zoom >= 10 ? zoom : 9);

        var _layers = mapM.attributes.markersLayer._layers;
        var marker = _layers[RC.getMarker[slug]];

        if(!marker){
            return;
        }

        var updateZIndex = function(){

            var _zIndex = marker._zIndex;
            //console.log("zindex", _zIndex)
            if(_zIndex < RC.markersMaxZindex){
                RC.markersMaxZindex++;
                marker._zIndex = RC.markersMaxZindex;
            }

            marker._icon.style["zIndex"] = "" + RC.markersMaxZindex;
        };

        // this a bit hacky; we have to do it because the flyTo animation seems to be
        // resetting he zindex of the marker while it lasts;
        // we are taking into account that the duration for the 
        // flyTo animation is 1200ms; note that bind a callback to the 'moveend'
        // with .once will not work because that event is fired at the beggining of the
        // animation
        // TODO: report this bug in github

        setTimeout(updateZIndex, 1210);
        setTimeout(updateZIndex, 1220);
        setTimeout(updateZIndex, 1230);
        setTimeout(updateZIndex, 1240);
    },

    deselectInitiative: function(model){

        model.set("selected", model.selected);
        var slug = model.get("slug");

        // remove css class
        cartografiaChannel.request("removeClassSelected", slug);
    },

    parse: function(array){
        
        // array is the raw data coming from the server; here we add the missing data;
        for(var i=0; i<array.length; i++){

            // 1. add the human-readable type informations
            var type = RCData.definitions.type[array[i]["typeId"]];

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

