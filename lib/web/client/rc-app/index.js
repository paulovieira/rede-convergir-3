
var RC = new Mn.Application();

RC.addRegions({
    mapRegion: "#mn-r-map",
//    modalRegion: "#mn-r-modal"
});

RC.markersMaxZindex = -999999999999;
RC.mapIsMoving = false;
RC.searchText = "";


// mapping between the slug and the internal leaflet id
RC.getMarker = {};

RC.on("start", function(){
debugger;
    window.router = new Router();
    Backbone.history.start({
    //  pushState: true
    });

    var mapIV = new MapIV({
        model: mapM
    });

    this.mapRegion.show(mapIV);
});

RC.updateUrl = function(){

    var center = mapM.get("center");
    var zoom = mapM.get("zoom");
    var baseLayer = baseLayersC.selected.get("id")

    var url = "?";
    url += "lat=" + center.lat.toFixed(3);
    url += "&lng=" + center.lng.toFixed(3);

    if(zoom!==RCData.initial.zoom){
        url += "&zoom=" + zoom;
    }
    if(baseLayer!==RCData.initial.baseLayer){
        url += "&baseLayer=" + baseLayer;
    }

    _.each(typesC.selected, function(typeM){

        url += "&types=" + typeM.get("id");
    });

    _.each(domainsC.selected, function(domainM){

        url += "&domains=" + domainM.get("id");
    });

    if(initiativesC.selected){
        url += "&initiative=" + initiativesC.selected.get("slug");
    }

    router.navigate(url, {replace: true});

};

// Cartografia.updateUrlDebounce = _.debounce(Cartografia.updateUrl, 500);

RC.iCheckRead = function(type, name){

    var selector = "input[type='" + type + "'][name='" + name + "']";

    var checkedValues = $(selector)
            .parent(".checked")
            .children("input")
            .map(function(){ 
                return $(this).val();
            })
            .get();

    if(type==="radio"){
        return checkedValues.length ? checkedValues[0] : undefined;
    }
    else if(type==="checkbox"){
        return checkedValues;
    }
    else{
        throw new Error("Invalid input type");
    }
}

/*
RC.markerIsVisibleInMap = function(geoJson){
    
    return true;

    var leafletMap = mapM.attributes.leafletMap;
    var latLng = L.latLng(geoJson.geometry.coordinates[1], geoJson.geometry.coordinates[0]);

    // TODO: what is the difference between "layer point" and "container point"?
    var point = leafletMap.latLngToLayerPoint(latLng);
    //var xy2 = leafletMap.latLngToContainerPoint(latLng);
    
    if(point.x > RC.menuWidth && point.x < RC.mapWidth){
        this.attributes.visible = true;
    }
    else{
        this.attributes.visible = false;
    }

    
};
*/
var cartografiaChannel = Backbone.Radio.channel('cartografia');


/*
cartografiaChannel.reply("selectLayer", function(layerId){
//debugger;

    var layerM = baseLayersC.get(layerId);

    if(!layerM){
        throw new Error("Unknown layerId: ", layerId);    
    }
    
    layerM.select();
});

cartografiaChannel.reply("deselectLayer", function(layerId){
//debugger;

    var layerM = baseLayersC.get(layerId);

    if(!layerM){
        throw new Error("Unknown layerId: ", layerId);    
    }

    layerM.deselect();
});
*/

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


