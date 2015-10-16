// tileJson definition for the base maps

Cirac.exclusiveLayers = [

{
    id: "hydda-base",
    name: "Mapa base (Open Street Map)",
    description: "",
    minzoom: 5,
    maxzoom: 13,
    legend: "",
    tilejson: "2.0.0",
    attribution: "",
    tiles: [
        "http://a.tile.openstreetmap.se/hydda/base/{z}/{x}/{y}.png"
    ],
    isExclusive: true,
    zIndex: -1
},


{
    id: "open-topo-map",
    name: "Mapa topográfico (OSM)",
    description: "",
    descriptionx: "Mapa topográfico renderizado com dados do Open Street Map e do projecto SRTM. Mais informações: <a href='http://wiki.openstreetmap.org/wiki/OpenTopoMap' target='_blank'>Wiki do Open Street Map</a>",
    minzoom: 5,
    maxzoom: 13,
    legend: "",
    tilejson: "2.0.0",
    attribution: "",
    tiles: [
        "http://a.tile.opentopomap.org/{z}/{x}/{y}.png"
    ],
    isExclusive: true,
    zIndex: -1
},



{
    id: "esri-world-shaded-relief",
    name: "Modelo digital de terreno (ESRI)",
    description: "",
    minzoom: 5,
    maxzoom: 13,
    legend: "",
    tilejson: "2.0.0",
    attribution: "",
    tiles: [
        "http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}.jpg"
    ],
    isExclusive: true,
    zIndex: -1
},

{
    id: "esri-world-gray-canvas",
    name: "Mapa dos rios (ESRI)",
    description: "",
    minzoom: 5,
    maxzoom: 13,
    legend: "",
    tilejson: "2.0.0",
    attribution: "",
    tiles: [
        "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}.jpg"
    ],
    isExclusive: true,
    zIndex: -1
},

{
    id: "mapquest",
    name: "Mapa geral (MapQuest)",
    description: "",
    minzoom: 5,
    maxzoom: 13,
    legend: "",
    tilejson: "2.0.0",
    attribution: "",
    tiles: [
        "http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg"
    ],
    isExclusive: true,
    zIndex: -1
},

{
    id: "esri-world-street-map",
    name: "Mapa geral (ESRI)",
    description: "",
    minzoom: 5,
    maxzoom: 13,
    legend: "",
    tilejson: "2.0.0",
    attribution: "",
    tiles: [
        "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.jpg"
    ],
    isExclusive: true,
    zIndex: -1
},




{
    id: "esri-world-imagery",
    name: "Mapa de satélite (ESRI)",
    description: "",
    minzoom: 5,
    maxzoom: 13,
    legend: "",
    tilejson: "2.0.0",
    attribution: "",
    tiles: [
        "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg"
    ],
    isExclusive: true,
    zIndex: -1
},

{
    id: "here-satellite-day",
    name: "Mapa de satélite (Here)",
    description: "",
    minzoom: 5,
    maxzoom: 13,
    legend: "",
    tilejson: "2.0.0",
    attribution: "",
    format: "png",
    tiles: [
        "http://1.aerial.maps.cit.api.here.com/maptile/2.1/maptile/newest/satellite.day/{z}/{x}/{y}/256/png8?app_id=Y8m9dK2brESDPGJPdrvs&app_code=dq2MYIvjAotR8tHvY8Q_Dg"
    ],
    isExclusive: true,
    zIndex: -1
},

{
    id: "mapquest-places",
    name: "Nomes das localidades (MapQuest)",
    description: "",
    minzoom: 5,
    maxzoom: 13,
    legend: "",
    tilejson: "2.0.0",
    attribution: "",
    tiles: [
        "http://otile1.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png"
    ],
    isExclusive: false,
    zIndex: 19
},
]
