
var RC = new Mn.Application();

RC.addRegions({
    mapRegion: "#mn-r-map",
//    modalRegion: "#mn-r-modal"
});

RC.markersMaxZindex = -999999999999;
RC.mapIsMoving = false;
RC.searchText = "";

// will be set to >=1 after the map is displayed for the first time (because when on the first time we don't want to call the fitBounds method on the leaflet map; we want instead to show the zoom/center given in the query string)
RC.initialDisplayFlag = -1;


// mapping between the slug and the internal leaflet id
RC.getMarker = {};

RC.on("start", function(){

    var mapIV = new MapIV({
        model: mapM
    });

    window.mapIV = mapIV;

    this.mapRegion.show(mapIV);
});

RC.markerIsVisibleInMap = function(geoJson){
    
    return true;

    var leafletMap = mapM.attributes.leafletMap;
    var latLng = L.latLng(geoJson.geometry.coordinates[1], geoJson.geometry.coordinates[0]);

    // TODO: what is the difference between "layer point" and "container point"?
    var point = leafletMap.latLngToLayerPoint(latLng);
    //var xy2 = leafletMap.latLngToContainerPoint(latLng);
    
    if(point.x > RC.menuWidth && point.x < RC.mapWidth){
        return true;
    }

    return false;
};

var cartografiaChannel = Backbone.Radio.channel('cartografia');



// cartografiaChannel.reply("addMarkers", function(geoJsonData){
// xxx
//     this.addMarkers(initiativesC.pluck("geoJson"));
// //debugger;
//     // try to find the layerM in either collection
//     var layerM = mapM.get("baseLayersC").get(layerId);

//     if(layerM){
//         layerM.select();
//     }
//     else{
//         throw new Error("Unknown layerId: ", layerId);
//     }
    
// });


cartografiaChannel.reply("selectLayer", function(layerId){
//debugger;

    var layerM = mapM.get("baseLayersC").get(layerId);

    if(layerM){
        layerM.select();
    }
    else{
        throw new Error("Unknown layerId: ", layerId);
    }
    
});

cartografiaChannel.reply("deselectLayer", function(layerId){
//debugger;

    var layerM = mapM.get("baseLayersC").get(layerId);

    if(layerM){
        layerM.deselect();
    }
    else{
        throw new Error("Unknown layerId: ", layerId);
    }

});

(function(){
    
    // var categories = ["domain", "event_type", "scope", "status", "target", "type", "visitors"];
    // RCData.definitions = {};
    // for(var i=0; i<categories.length; i++){
    //     RCData.definitions[categories[i]] = _.chain(RCData.definitionsAll)
    //                     .filter(function(obj, key){

    //                         return obj.id.indexOf(categories[i]) === 0 ? true : false;
    //                     })
    //                     .indexBy("id")
    //                     .value();        
    // }


    RCData.baseLayers = [
        // {
        //     id: "osm",
        //     description: {
        //         pt: "Open Street Map",
        //     },
        //     baseLayer: L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png")
        // },

        {
            id: "mapquest",
            title: {
                pt: "Estradas",
            },
            description: {
                pt: "Estradas",
            },
            baseLayer: L.tileLayer("http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg")
        },

        {
            id: "esri_satellite",
            title: {
                pt: "Satélite",
            },
            description: {
                pt: "Satélite",
            },
            baseLayer: L.featureGroup([

                L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg"),

                L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/roads_and_labels/{z}/{x}/{y}.png'),
            ])
        },

        {
            id: "stamen",
            title: {
                pt: "Aguarela",
            },
            description: {
                pt: "Aguarela",
            },
            baseLayer: L.featureGroup([

                L.tileLayer("http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg", {
                    subdomains: "abcd"
                }),

                L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/roads_and_labels/{z}/{x}/{y}.png'),

            ])
        }

/*
        below are some alternative base layers with names of places

        L.tileLayer("http://{s}.base.maps.cit.api.here.com/maptile/2.1/labeltile/newest/normal.day/10/490/392/256/png?app_id=Y8m9dK2brESDPGJPdrvs&app_code=dq2MYIvjAotR8tHvY8Q_Dg&lg=eng", {
                    subdomains: "1234",
                    zIndex: 10
                })

        L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png', {
            subdomains: '1234',
        }),
*/
    ];

}());


