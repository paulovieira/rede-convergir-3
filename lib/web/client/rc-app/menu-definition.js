// menu definition

Cirac.mapsMenu = [
    {
        groupName: "Mapas base",
        maps: [{
                mapId: "mapquest",
                radio: true,
                inputName: "base-layers"
            }, {
                mapId: "esri-world-imagery",
                radio: true,
                inputName: "base-layers"
            }, {
                mapId: "esri-world-shaded-relief",
                radio: true,
                inputName: "base-layers"
            }, {
                mapId: "esri-world-gray-canvas",
                radio: true,
                inputName: "base-layers"
            }, 
            {
                mapId: "mapquest-places",
                radio: false
            }
        ]
    },
    
    {
    "groupName": "Índice de vulnerabilidade a inundação",
    "maps": [
        {
            "mapId": "cirac-vul-bgri-fvi-n",
            radio: true,
            inputName: "cirac-layers"
        },
        {
            "mapId": "cirac-vul-bgri-fvi-75", 
            radio: true,
            inputName: "cirac-layers"
        }
        
    ]
    }
];


