
var Cartografia = new Mn.Application();

Cartografia.addRegions({
    mapOneRegion: "#mn-r-map-1",
    modalOneRegion: "#mn-r-modal-contents-1"
});

Cartografia.on("start", function(){

    var map0IV = new MapIV({
        model: map0M
    });

    this.mapOneRegion.show(map0IV);
});


L.Browser.retina = false;
L.mapbox.accessToken = 'dummyAccessToken';

Cartografia.getMapModel = function(mapIndex){

    if(mapIndex===0){
        return map0M;
    }
    else if(mapIndex===1){
        return map1M;
    }
    else{
        throw new Error("wrong map index");
    }
};

Cartografia.hasUTFGrid = function(tileJson){

    //return !!tileJson.interactivity && !!$.trim(tileJson.interactivity.template_teaser);
    return !!tileJson.template;
};

var cartografiaChannel = Backbone.Radio.channel('cartografia');

cartografiaChannel.reply("selectLayer", function(mapIndex, layerId){

    mapIndex = 0;
    var mapM = Cartografia.getMapModel(mapIndex);

    // try to find the layerM in either collection
    var layerM = mapM.get("ciracLayersC").get(layerId) || 
                mapM.get("exclusiveLayersC").get(layerId) ||
                mapM.get("overlappingLayersC").get(layerId);

    if(layerM){
        layerM.select();
    }
    else{
        throw new Error("Unknown layerId: ", layerId);
    }
    
});

cartografiaChannel.reply("deselectLayer", function(mapIndex, layerId){
//debugger;
    mapIndex = 0;
    var mapM = Cartografia.getMapModel(mapIndex);
    var layerM = mapM.get("overlappingLayersC").get(layerId);

    if(layerM){
        layerM.deselect();
    }
    else{
        throw new Error("Unknown layerId: ", layerId);
    }

});

