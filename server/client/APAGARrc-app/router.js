
var Router = Backbone.BaseRouter.extend({

    onNavigate: function(routeData) {

        routeData.linked.handler(routeData);
    },

    routes: {

        "xyz": {
            handler: function(routeData){
                console.log("this is the handler for #xyz");
            }
        },

        "abc": {
            handler: function(routeData){
                console.log("this is the handler for #abc");
            }
        },

        "*any": {

            handler: function(routeData){

                this.setZoom(routeData.query.zoom);
                this.setCenter(routeData.query.lat, routeData.query.lng);
                this.setTypes(routeData.query.types);
                this.setDomains(routeData.query.domains);
                this.setBaseLayer(routeData.query.baseLayer);
                this.setInitiative(routeData.query.initiative);
            },

            setZoom: function(zoom){

                if(!zoom){ return; }

                zoom = Number(zoom);
                if(_.isFinite(zoom) && zoom >= 6 && zoom <= 13){
                    mapM.set("zoom", zoom);
                }
            },

            setCenter: function(lat, lng){

                if(!lat || !lng){ return; }

                lat = Number(lat);
                lng = Number(lng);
                if(_.isFinite(lat) && _.isFinite(lng)){
                    mapM.set("center", L.latLng(lat, lng));
                }
            },

            setTypes: function(types){

                if(!types){ return; }

                var model;
                // if the query string has more than one key "types", it will create an array
                var types = _.isString(types) ? [types] : types;
                _.each(types, function(typeId){

                    // call select() only if the id given in the query string corresponds to some type
                    model = typesC.get(typeId);
                    if(model){
                        model.select();
                    }
                });
            },

            setDomains: function(domains){

                if(!domains){ return; }

                var model;
                // if the query string has more than one key "domains", it will create an array
                var domains = _.isString(domains) ? [domains] : domains;
                _.each(domains, function(domainId){

                    model = domainsC.get(domainId);
                    if(model){
                        model.select();
                    }
                });
            },

            setBaseLayer: function(baseLayer){

                if(!baseLayer){ return; }

                var model = baseLayersC.get(baseLayer);
                if(model){
                    model.select();
                }
            },

            setInitiative: function(initiative){

                if(!initiative){ return; }

                var model = initiativesC.get(initiative);
                if(model){

                    // we have to select the initiative in a future loop of the event loop
                    // because at this time there is no leaflet map yet
                    var timerId = setInterval(function(){

                        if(mapM.attributes.leafletMap){
                            model.select();
                            clearInterval(timerId);
                        }

                    }, 50);

                    
                }
            },

        }
    }
});
