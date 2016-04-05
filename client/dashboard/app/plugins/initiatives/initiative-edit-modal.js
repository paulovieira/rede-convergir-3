require("./initiative-edit-modal.css");

var _ = require("underscore");
var Backbone = require("backbone");
var Mn = require("backbone.marionette");
//var $ = require("jquery");
var Utils = require("../../common/utils")
var Behaviors = require("../../common/behaviors");
//var Radio = require("backbone.radio");
var Fecha = require("fecha");
var Entities = require("../../common/entities");
var Q = require("q");
var L = require("leaflet");
var Utils = require("../../common/utils");

var InitiativeEditModalStatus = Mn.State.extend({

    defaultState: {
        moderationStatus: undefined
    },

    viewEvents: {
        "change:moderationStatus": function(moderationStatus){
            //debugger;
            this.set("moderationStatus", moderationStatus);
        }
    },


});

var InitiativeEditModal = Mn.LayoutView.extend({

    initialize: function(options) {
        Utils.logStack();
    },

    behaviors: [
        {
            behaviorClass: Behaviors.Modal,
        },

        // state syncronization setup
        {
            behaviorClass: Behaviors.SyncState,
            stateClass: InitiativeEditModalStatus,
            syncEvent: "before:render"
        }
    ],

    template: require('./initiative-edit-modal.html'),

    // include in the template context the definitions object decorated with an extra "checked" property
    templateHelpers: function(){

        // make a cheap clone of the definitions (to be used in a nunjucks loops);
        // note that each definition property is an array of objects
        var definitions = JSON.parse(JSON.stringify(Entities.definitions));

        // if the model has the domain, add a corresponding "checked" attribute 
        // (makes the template logic much simpler)
        _.each(definitions.domain, function(obj){
 
            obj.checked = _.contains(this.options.templateContext.domains, obj.id) ? true : false;
        }, this);

        // same for the initiativeStatusId
        _.each(definitions.initiativeStatus, function(obj){

            obj.checked = this.options.templateContext.initiativeStatusId === obj.id ? true : false;
        }, this);

        // same for the moderationStatusId
        _.each(definitions.moderationStatus, function(obj){

            obj.checked = this.options.templateContext.moderationStatusId === obj.id ? true : false;
        }, this);

        // same for the scopeId
        _.each(definitions.scope, function(obj){

            obj.checked = this.options.templateContext.scopeId === obj.id ? true : false;
        }, this);

        // same for target
        _.each(definitions.target, function(obj){

            obj.checked = _.contains(this.options.templateContext.target, obj.id) ? true : false;
        }, this);

        // same for the typeId
        _.each(definitions.type, function(obj){

            obj.checked = this.options.templateContext.typeId === obj.id ? true : false;
        }, this);

        // same for the visitorsId
        _.each(definitions.visitors, function(obj){

            obj.checked = this.options.templateContext.visitorsId === obj.id ? true : false;
        }, this);


        // repeat the process for the startDate field 
        var startDate = new Date(this.options.templateContext.startDate);
        var startDateMonth = startDate.getMonth();
        var startDateYear = startDate.getFullYear();

        // in this case we have to generate an array of objects representing the months
        // we reuse the internatiolization data that was previously configured in Fecha (see 
        // the config file)
        definitions.months = _.map(Fecha.i18n.monthNames, function(monthName, i){

            return  { 
                id: i,
                title: monthName,
                checked: startDateMonth === i ? true :  false
            };
        });

        // same for influence (we manually build the array)
        definitions.influence = [
            {id: "0-10",            title: "0 &ndash; 10" },
            {id: "10-25",           title: "10 &ndash; 25" },
            {id: "25-100",          title: "25 &ndash; 100" },
            {id: "100-500",         title: "100 &ndash; 500" },
            {id: "500-5000",        title: "500 &ndash; 5000" },
            {id: "5000-10000",      title: "5000 &ndash; 10000" },
            {id: "10000-999999999", title: "10000 &ndash; 999999999" }
        ];

        _.each(definitions.influence, function(obj){

            // important: use double equals to execute string to number coercion
            obj.checked = this.options.templateContext.influence[0]  == obj.id.split("-")[0] ? true : false;
        }, this);


        // the contents of this object will be included in the template context (the model)
        return _.extend(this.options.templateContext, {
            definitions: definitions,
            startDateYear: startDateYear
        });
        // return {
        //     definitions: definitions,
        //     startDateYear: startDateYear
        // };
    },

    className: "mn-initiative-edit-modal",

    ui: {
        "closeModalBtn": "button.js-close-modal",
        "formInitiativeTypes":     "fieldset#initiatives-type-form      input[type=radio]",
        "formInitiativeDomains":   "fieldset#initiatives-domains-form   input[type=checkbox]",
        "formInitiativeVisitors":  "fieldset#initiatives-visitors-form  input[type=radio]",
        "formInitiativeScope":     "fieldset#initiatives-scope-form     input[type=radio]",
        "formInitiativeTarget":    "fieldset#initiatives-target-form    input[type=checkbox]",
        "formInitiativeInfluence": "fieldset#initiatives-influence-form input[type=radio]",
        "formInitiativeStatus":    "fieldset#initiatives-status-form    input[type=radio]",
        "formInitiativeModerationStatus": "fieldset#initiatives-moderation-status-form input[type=radio]",
        

        "tooltips": 'span[data-toggle="tooltip"]',
        "btnSave": "button.js-modal-save"
    },


    events: {
        "click @ui.btnSave": function(e){

            // disable the button and add the animation 
            var $saveSpan = this.$("button.js-modal-save > span");
            $saveSpan.append('<i style="margin-left: 6px;" class="fa fa-cog fa-spin"></i>');
            $saveSpan.attr("disabled");

            //debugger;
            var data = Backbone.Syphon.serialize(this);

            // convert domains and target form object to array
            data.domains = _.chain(data.domains)
                            .pick(function(val){ return !!val })
                            .keys()
                            .value();

            data.target = _.chain(data.target)
                            .pick(function(val){ return !!val })
                            .keys()
                            .value();
            
            // influence
            data.influence = data.influence.split("-");

            // start date
            var startDate = new Date(data.startDateYear, data.startDateMonth, 1).toISOString();
            delete data.startDateMonth;
            delete data.startDateYear;

            data.coordinates = _.values(this.marker.getLatLng());
debugger;
            data.logo = this.options.templateContext.logo;
            data.docUrl = this.options.templateContext.docUrl || "";
            //data.countryCode = this.options.templateContext.countryCode;
            //data.emailTemplate = this.options.templateContext.emailTemplate;
            
            var initiativeM = Entities.initiativesC.get(this.options.templateContext.id);
            if(!initiativeM){
                throw new Error("there is no model with id " + this.options.templateContext.id + " in the initiatives collection");
            }

            var self = this;
            Q(initiativeM.save(data, {wait: true}))
                .then(function(response){

                    var msg = 'A iniciativa "' + data.name + '" foi actualizada';
                    //self.triggerMethod("hide:modal");
                    self.$('[data-dismiss="modal"]').trigger("click");
                    Utils.notify("success", msg);
                    
                })
                .catch(function(err){

                    var msg = 'A iniciativa "' + data.name + '" não foi actualizada';
                    msg += '<br><br> (ERRO: "' + Utils.getErrorMessage(err) + '")';
                    self.triggerMethod("hide:modal");
                    Utils.notify("danger", msg);

                })
                .done();
            

            
        },

        "change @ui.formInitiativeModerationStatus": function(e){
            //debugger;

            // trigger a change in the state
            var moderationStatusId = Backbone.Syphon.serialize(this).moderationStatusId;
            this.trigger("change:moderationStatus", moderationStatusId);
        },
    },

    stateEvents: {

        "change:moderationStatus": function(state, currentModerationStatus, options){
            //debugger;
            if(currentModerationStatus==="moderation_status_002_approved" ||
                currentModerationStatus==="moderation_status_003_rejected"){
                console.log("show email message")
            }

                
        }
    },

    onAttach: function() {

//debugger;
        // formstone checkbox plugin
        this.ui.formInitiativeTypes.checkbox();
        this.ui.formInitiativeDomains.checkbox();
        this.ui.formInitiativeVisitors.checkbox();
        this.ui.formInitiativeScope.checkbox();
        this.ui.formInitiativeTarget.checkbox();
        this.ui.formInitiativeInfluence.checkbox();
        this.ui.formInitiativeStatus.checkbox();
        this.ui.formInitiativeModerationStatus.checkbox();
        
        // active tooltips (bootstrap js plugin)
        this.ui.tooltips.tooltip({
            trigger: "hover",  // avoid show the tooltip on focus
            delay: 400,
            placement: "right"
        });




  
    },

    regions: {
        //"initiativesList": "div.mn-r-initiatives-list"
    },

    // this event is triggered by the behaviour after the internal
    // shown.bs.modal (fired when the modal has been made visible to the user);
    // this is a safe place to initialize the leaflet map (otherwise we would
    // have to call map.invalidateSize() )
    onShownBsModal: function(){
        
        // map + base layers

        var streetsLayer = L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg', {});
        
        var satelliteLayer = L.featureGroup([
            L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg"),
            L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/roads_and_labels/{z}/{x}/{y}.png'),
        ]);

        var center = this.options.templateContext.coordinates;
        var map = L.map('leaflet-map', {
            center: center,
            zoom: 9,
            layers: [streetsLayer],
            scrollWheelZoom: false
        });


        // layers control
        var layersControl = L.control.layers(
            {
                "satélite&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;": satelliteLayer,
                "estradas": streetsLayer,
            }, 
            undefined, 
            { collapsed: false, position: "topleft" }
        );

        map.addControl(layersControl);

        // pretty marker with font awesome icon

        var createMarker = function(){

            var marker = this.marker = 
            new L.Marker(undefined, {
                draggable: true,
                icon: L.AwesomeMarkers.icon({
                    icon: "home",
                    iconColor: "white",
                    extraClasses: "icon-marker-lg",
                    prefix: "fa",
                    markerColor: "darkgreen",
                    popupAnchor: [1, -41],
                })
            });

            marker.on("popupclose", function(e){

                e.target.unbindPopup(e);
            });

            return marker;
        };

        createMarker.call(this)
                    .setLatLng(center)
                    .bindPopup("Clique na lupa ou arraste o marcador")
                    .addTo(map)
                    .openPopup();


        // geocoder control
        var geocoderControl = L.Control.geocoder({
            collapsed: false,
            placeholder: "Pesquisar morada",
            errorMessage: "Morada não encontrada. Por favor arraste manualmente o marcador <br> para a localização da iniciativa (pode fazer zoom in / zoom out).",
            geocoder: L.Control.Geocoder.bing('AoArA0sD6eBGZyt5PluxhuN7N7X1vloSEIhzaKVkBBGL37akEVbrr0wn17hoYAMy'),
        });

        var self = this;
        geocoderControl.markGeocode = function(result) {
debugger;
            this._map.fitBounds(result.bbox, {
                maxZoom: 15
            });

            this._map.eachLayer(function(layer){
                
                if(layer instanceof L.Marker){
                    this._map.removeLayer(layer);
                }
            }, this);

            createMarker.call(self)
                        .setLatLng(result.center)
                        .bindPopup(result.html || result.name)
                        .addTo(this._map)
                        .openPopup();

            return this;
        }

        map.addControl(geocoderControl);
    },

    onBeforeDestroy: function(){

        this.marker = undefined;
    }


});

module.exports = InitiativeEditModal;

if (NODE_ENV === "dev") {
    window.InitiativeEditModal = InitiativeEditModal;
}
