var LayerM = Backbone.Model.extend({
    initialize: function() {

        // apply the backbone.select mixin (must also be done in the respective collection)
        Backbone.Select.Me.applyTo(this);

        this.on("change:opacity", this.changeOpacity);
        this.on("change:zindex", this.changeZIndex);
    },

    changeOpacity: function(model, newOpacity) {

        this.get("tileLayer").setOpacity(newOpacity / 100);
    },

    changeZIndex: function(model, newZIndex) {

        this.get("tileLayer").setZIndex(newZIndex);
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
        if(layerM.get("zindex")){
        //if (layerM.get("tileJson").isExclusive) {
            layerM.get("tileLayer").setZIndex(layerM.get("zindex"));
        }
        // else if(!layerM.get("tileJson").isCirac){
        //     debugger;
        //     //layerM.get("tileLayer").setZIndex(20);   
        // }


        // 2. add the grid layer (UTF tiles) + the respective grid control

        if (layerM.has("gridLayer")) {
            leafletMap.addLayer(layerM.get("gridLayer"));
            leafletMap.addControl(layerM.get("gridControl"));
        }


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

        // 2. remove the grid layer (UTF tiles) + the respective grid control
        if (layerM.has("gridLayer")) {
            leafletMap.removeLayer(layerM.get("gridLayer"));
            leafletMap.removeControl(layerM.get("gridControl"));
        }


        // 3. remove the legend (if defined in the project in tilemill)

        var legend = layerM.get("tileJson").legend;
        if (legend) {
            leafletMap.legendControl.removeLegend(legend);
        }


        // update the "active" property in the mapsMenu array
        var mapsMenu = layerM.collection.parent.get("mapsMenu");
        _.each(mapsMenu, function(groupObj) {
            _.each(groupObj.maps, function(mapObj) {

                if (mapObj.mapId === layerM.get("id")) {
                    mapObj.active = false;
                }

            }, this);
        }, this);
    },

    updateMenuEntry: function(layerM, status) {

        var mapsMenu = layerM.collection.parent.get("mapsMenu");
        _.each(mapsMenu, function(groupObj) {
            _.each(groupObj.maps, function(mapObj) {

                if (mapObj.mapId === layerM.get("id")) {
                    mapObj.active = status;
                }

            }, this);
        }, this);

    },

    // update the layers in the underlying leaflet map (tileLayer, gridlayer, etc)
    addLayer: function(layerM) {
        //debugger;

        var tileLayer = layerM.get("tileLayer");

        // if it is a regular map, the tileLayer property will be an instance of L.TileLayer...
        if (tileLayer && tileLayer instanceof L.TileLayer) {

            this.addTileLayer(layerM);
            this.updateMenuEntry(layerM, true)
        }
        // if it is a sequential map, it will be a Backbone collection
        else if (tileLayer instanceof Backbone.Collection) {

            // this is a sequential map
            layerM.addSequentialControl();
            this.updateMenuEntry(layerM, true)
        } else {
            throw new Error("invalid Tilelayer");
        }
    },

    removeLayer: function(layerM) {
        //debugger;

        var tileLayer = layerM.get("tileLayer");

        if (tileLayer && tileLayer instanceof L.TileLayer) {

            this.removeTileLayer(layerM);
            this.updateMenuEntry(layerM, false)
        } else if (tileLayer instanceof Backbone.Collection) {

            layerM.removeSequentialControl();
            this.updateMenuEntry(layerM, false)
        } else {
            throw new Error("invalid Tilelayer");
        }
    }



});

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



var MapM = Backbone.Model.extend({
    initialize: function() {}
});

var map0M = new MapM({
    mapIndex: 0,
    active: false,
    menuOpen: false,
    //ciracLayersC: new CiracLayersC(),
    ciracLayersC: new ExclusiveLayersC(),
    exclusiveLayersC: new ExclusiveLayersC(),
    overlappingLayersC: new OverlappingLayersC(),
    center: {
        lat: 39.5676,
        lng: -8.7068
    },
    initialZoom: 8,
    maxZoom: 9,
    minZoom: 8
});
map0M.get("ciracLayersC").parent = map0M;
map0M.get("exclusiveLayersC").parent = map0M;
map0M.get("overlappingLayersC").parent = map0M;




// add the hardcoded tileJson objects in Cirac.exclusiveLayers to the main Cirac.layers array (before the ones that come from the server)
_.each(Cirac.exclusiveLayers, function(tileJson) {
//debugger;
    Cirac.layers.unshift(tileJson);
});

// deep clone the mapsMenu array for each leaflet map
map0M.set("mapsMenu", JSON.parse(JSON.stringify(Cirac.mapsMenu)));


// populate the layers collection in map0M (using the mapIds in the mapMenu)

_.each(map0M.get("mapsMenu"), function(groupObj) {

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
            map0M.get("exclusiveLayersC").push(layerM);
        } 
        else if(tileJson.isCirac) {
            map0M.get("ciracLayersC").push(layerM);
        }
        else {
            map0M.get("overlappingLayersC").push(layerM);
        }

    });
});
