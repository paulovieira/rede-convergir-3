var OptionsModalIV = Mn.ItemView.extend({

    template: "menu/templates/options-modal.html",

    ui: {
        "btnApplyFilters":   "button.js-modal-apply"
    },

    events: {
        "click @ui.btnApplyFilters": "showUpdatedList"
    },

    onAttach: function(){

        // initialize the iCheck plugin 
        this.$(".modal-body").iCheck({
            checkboxClass: 'icheckbox_minimal-grey',
            radioClass: 'iradio_minimal-grey',
            cursor: true,
            // increaseArea: '20%',
        });
    },

    showUpdatedList: function(){
        
        this.updateCollections();
        cartografiaChannel.request("showList");

        // manually close the modal using the bootstrap api
        this.$el.closest(".modal").modal("hide");
    },

    updateCollections: function(){

        var i, j, l, l2;

        var selectedTypes = RC.iCheckRead("checkbox", "filter-type");
        typesC.deselectAll();
        for(i=0, l=selectedTypes.length; i<l; i++){
            typesC.get(selectedTypes[i]).select();
        }

        var selectedDomains = RC.iCheckRead("checkbox", "filter-domain");
        domainsC.deselectAll();
        for(i=0, l=selectedDomains.length; i<l; i++){
            domainsC.get(selectedDomains[i]).select();
        }

        var selectedBaseLayerId = RC.iCheckRead("radio", "base-layers");
        if(selectedBaseLayerId){
            baseLayersC.get(selectedBaseLayerId).select();    
        }
        
        initiativesC.updateVisibility("_updateInFilters");
    },
});


var LoadingIV = Mn.ItemView.extend({
    template: "menu/templates/loading.html"
});

var MenuListIV = Mn.ItemView.extend({

    template: "menu/templates/menu-list.html",

    initialize: function(){

        cartografiaChannel.reply("addClassSelected", function(slug){

            this.addClassSelected(slug);
        }, this);

        cartografiaChannel.reply("removeClassSelected", function(slug){

            this.removeClassSelected(slug);
        }, this);

    },

    ui: {
        "btnTypesDescription": "a.js-modal-types-description",
        "btnFlyTo": "a.js-fly-to",
        "itemContainer": "div.initiative-container",
    },

    events: {
        "click @ui.btnTypesDescription": "showTypesDescription",
        "click @ui.btnFlyTo": "selectInitiative",
        "mouseenter @ui.itemContainer": "showLabelAndScale",
        "mouseleave @ui.itemContainer": "hideLabelAndResetScale",
    },

    onAttach: function(){

        // if there is a selected initiative when the menu is created, add the corresponding
        // visual state (css class + scroll)
        var selected = initiativesC.selected;
        if(!selected){
            return;
        }

        cartografiaChannel.request("scrollTo", selected.get("slug"), 0);
    },

    showTypesDescription: function(){

        $("#types-more-info").modal();
    },

    addClassSelected: function(slug){

        var $initiative = this.$el.find("div[data-slug='" + slug + "']");
        if($initiative.length === 0){
            return;
        }

        $initiative.addClass("initiative-selected");
    },

    removeClassSelected: function(slug){
        
        var $initiative = this.$el.find("div[data-slug='" + slug + "']");
        if($initiative.length === 0){
            return;
        }

        $initiative.removeClass("initiative-selected");
    },

    selectInitiative: function(e){

        e.preventDefault();
        var slug = $(e.currentTarget).data("slug");
        initiativesC.get(slug).select();
    },

    showLabelAndScale: function(e){
        
        var slug = $(e.currentTarget).data("slug");
        //console.log("showLabelAndScale @ " + Date.now() + ": " + slug)
        mapM.showLabelAndScale(slug);
    },

    hideLabelAndResetScale: function(e){
        //debugger;
        var slug = $(e.currentTarget).data("slug");
        //console.log("hideLabelAndResetScale @ " + Date.now() + ": " + slug)
        mapM.hideLabelAndResetScale(slug);
    }
});


var MenuBodyLV = Mn.LayoutView.extend({

    initialize: function(){

        cartografiaChannel.reply("scrollTo", function(slug, duration){

            this.scrollTo(slug, duration);
        }, this);

        cartografiaChannel.reply("showList", function(options){

            this.showList(options);
        }, this);


        this.setVisibleBounds = _.bind(this.setVisibleBounds, this);
        $(window).on("resize", this.setVisibleBounds);
    },

    template: "menu/templates/menu-body.html",

    attributes: {
        style: "height: 100%;  position: relative; padding-top: 5px; overflow-y: auto;"
    },

    regions: {
        listRegion: "div#mn-r-list"
    },

    ui: {
        "inputSearch": "input#search-initiative[type='text']",
        "btnOptions": "button#options-filters",
        // "btnCancelOptions": "button#options-cancel-filters",
        // "btnApplyFilters": "button#options-apply-filters",
        "btnExportMap": "a.js-modal-export"
    },

    events: {
        "click @ui.btnExportMap": "showExportMapModal",

        "keyup @ui.inputSearch": _.debounce(function(e){ 

            // TODO: improve the handling of more keys 
            // https://css-tricks.com/snippets/javascript/javascript-keycodes/
            var key = e.which;
            if((key >= 48 && key <= 90) || key===8 || key===13 || key===46){
                //this.showUpdatedList();
                RC.searchText = this.ui.inputSearch.val();
                initiativesC.updateVisibility("_updateInFilters");
                this.showList();
            }
            
        }, 800),

        //"click @ui.btnOptions": "toggleFiltersForm",
        //"click @ui.btnCancelOptions": "toggleFiltersForm",
        //"click @ui.btnApplyFilters": "showUpdatedList"
    },

    behaviors: {

        ShowOptionsModal: {
            behaviorClass: window.Behaviors.ShowModal,
            uiKey: "btnOptions",  // will listen for clicks on @ui.btnOptions
            viewClass: OptionsModalIV, // and will show this view
            getModel: function(){
                return new Backbone.Model({
                    "baseLayers": baseLayersC.toJSON(),
                    "types": typesC.toJSON(),
                    "domains": domainsC.toJSON()
                });
            },
            sizeClass: ""
        },
    },


    // update the collection from the current active checkboxes/radios in the menu
    // (as well as the search text)
    /*
    updateCollections: function(){
        var i, j, l, l2;

        var selectedTypes = RC.iCheckRead("checkbox", "filter-type");
        typesC.deselectAll();
        for(i=0, l=selectedTypes.length; i<l; i++){
            typesC.get(selectedTypes[i]).select();
        }

        var selectedDomains = RC.iCheckRead("checkbox", "filter-domain");
        domainsC.deselectAll();
        for(i=0, l=selectedDomains.length; i<l; i++){
            domainsC.get(selectedDomains[i]).select();
        }

        var selectedBaseLayerId = RC.iCheckRead("radio", "base-layers");
        baseLayersC.get(selectedBaseLayerId).select();

        RC.searchText = this.ui.inputSearch.val();
    },
*/
    onBeforeDestroy: function(){

        $(window).off("resize", this.setVisibleBounds);
    },

    onAttach: function(){

        // TODO: don't set the focus if we are on a mobile broser (to avoid showing the virtual keyboard)
        this.$("input#search-initiative").val(RC.searchText).trigger("focus");

        this.setVisibleBounds();

        initiativesC.updateVisibility();
        mapM.updateMarkers2();
        this.showList({delay: "short"});
        if(initiativesC.selected){

            // deselect and select again to make sure the popup is shown open
            var alreadySelected = initiativesC.selected;
            initiativesC.deselect();
            initiativesC.select(alreadySelected);
        }
    },

    setVisibleBounds: function(){

        var menuPadding = 5;
        var navBorder = 4;

        // width of the main container for the menu
        var menuWidth = this.$el.closest(".leaflet-control").width() + menuPadding,
            navbarHeight = $(".navbar").height() + navBorder,

            mapHeight = this.$el.closest(".leaflet-container").height(),
            mapWidth  = this.$el.closest(".leaflet-container").width();
        
        RC.visibleBounds = L.bounds(L.point(menuWidth, navbarHeight), L.point(mapWidth, mapHeight));
    },

    showExportMapModal: function(){

        var leafletMap = mapM.get("leafletMap");

        var types = "";
        _.each(typesC.selected, function(obj){
            types = types + "&types=" + obj.attributes.id
        });

        var domains = "";
        _.each(domainsC.selected, function(obj){
            domains = domains + "&domains=" + obj.attributes.id
        });

        var host = window.location.protocol + "//" + window.location.hostname;

        // if port is 80, location.port is the empty string
        if(window.location.port!==""){
            host = host + ":" + window.location.port;
        }

        var html = Marionette.Renderer.render("menu/templates/export-map.html", {
            zoom: leafletMap.getZoom(),
            lat: leafletMap.getCenter().lat.toFixed(3),
            lng: leafletMap.getCenter().lng.toFixed(3),
            baseLayer: baseLayersC.selected.get("id"),
            types: types,
            domains: domains,
            host: host
        });

        $("#export-map-body").html(html);
        $("#export-map").modal();
    },


    scrollTo: function(slug, duration){

        var $initiative = this.$('div[data-slug="' + slug + '"]');
        if($initiative.length === 0){
            return;
        }

        this.$el.scrollTo($initiative, {
            duration: (duration || duration === 0) ? duration : 500,
            interrupt: true,
            offset: -20
        });
    },

    showList: function(options){

        options = options || {};

        var numberSpelling = {
            "pt": {
                "1": "uma iniciativa encontrada",
                "2": "duas iniciativas encontradas"
            }
        };

        var numFiltered = initiativesC.where({inFilters: true}).length;
        var numVisible = initiativesC.where({inFilters: true, inVisibleBounds: true}).length;
        //var numFilteredMsg = numberSpelling["pt"][numFiltered.toString()] || numFiltered + " iniciativas encontradas";

        function iniciativa(n){
            return n===1 ? "iniciativa" : "iniciativas";
        }

        function visivel(n){
            return n===1 ? "visível" : "visíveis";
        }

        var numFilteredMsg = numFiltered + " " + iniciativa(numFiltered) + " encontradas";
        if(numVisible < numFiltered){
            numFilteredMsg += ", " + numVisible + " " + visivel(numVisible) + " (faça zoom out para ver mais)";
            // numFilteredMsg = numberSpelling["pt"][numFiltered.toString()] || numFiltered + " iniciativas encontradas";            
        }
        else{
            if(numVisible===initiativesC.length){
                numFilteredMsg += " (toda a rede)";                
            }

        }

        var model = new Backbone.Model({
            initiatives: initiativesC.toJSON(),
            numFiltered: numFiltered,
            numFilteredMsg: numFilteredMsg
        });

        var menuListIV = new MenuListIV({
            model: model
        });

        this.showLoading();
        if(options.delay==="short"){
            options.delay = parseInt(200 + Math.random()*200);
        }
        else if(options.delay==="long" || options.delay===undefined){
            options.delay = parseInt(250 + Math.random()*1000);    
        }
        else{
            options.delay = 0;
        }

        var self = this;
        setTimeout(function(){

            mapM.updateMarkers2();
            self.listRegion.show(menuListIV);
            RC.updateUrl();

        }, options.delay);
        
    },

    showLoading: function(delay){

        var loadingIV = new LoadingIV();
        this.listRegion.show(loadingIV);
    },
/*
    filter: function(opt){

        initiativesC.each(function(model){
            model.set("visible", false);
        });

        // active options for filter 1: search box
        var searchText = RC.searchText = this.ui.inputSearch.val();

        // active options for  filter 2: type

        // NOTE: instead of the native checkbox/radio we are using the icheck plugin;
        // the checkbox/radio is selected iff the parent div has the class "checked"

        var activeTypes = [];
        this.$(".js-filter-type")
            .each(function(i, el) {

                var $el = $(el);

                // if($el.prop("checked")){
                //     activeTypes.push($el.data("typeId"));
                // }

                var typeId = $el.data("typeId");
                if($el.parent(".checked").length){
                    activeTypes.push(typeId);
                    typesC.get(typeId).select();
                }
                else{
                    typesC.get(typeId).deselect();
                }
            });

        // active options for  filter 3: domains
        var activeDomains = [];
        this.$(".js-filter-domain")
            .each(function(i, el) {

                var $el = $(el);

                // if($el.prop("checked")){
                //     activeDomains.push($el.data("domainId"));
                // }

                var domainId = $el.data("domainId");
                if($el.parent(".checked").length){
                    activeDomains.push(domainId);
                    domainsC.get(domainId).select();
                }
                else{
                    domainsC.get(domainId).deselect();
                }
            });

        // active option for the base map; 
//debugger;
        //var baseMapId = this.$("input[type='radio'][name='base-maps']:checked").val();
        var baseMapId = this.$("input[type='radio'][name='base-layer']")
                        .parent(".checked")
                        .children("input")
                        .val();


        // var leafletMap = mapM.attributes.leafletMap;
        
        // var topLeftLatLng     = leafletMap.containerPointToLatLng([RC.menuWidth, 0]);
        // var bottomRightLatLng = leafletMap.containerPointToLatLng([RC.mapWidth, RC.mapHeight]);
        // var bounds            = L.latLngBounds(topLeftLatLng, bottomRightLatLng);

        var numFiltered = 0;
        _.chain(RCData.initiatives)

            // filter 1 - text
            .filter(function(obj){

                return $.trim(obj.name).toLowerCase().indexOf(searchText) >= 0;
            })
            // filter 2 - type
            .filter(function(obj){
                
                if(activeTypes.length===0){
                    return true;
                }

                // if the "Other" option is active, it must be handled separately
                if(_.contains(activeTypes, "type_other") && obj.typeOther){
                    return true;
                }

                return _.contains(activeTypes, obj.typeId);
            })
            // filter 3 - domain
            .filter(function(obj){

                if(activeDomains.length===0){
                    return true;
                }

                for(var i=0; i<obj.domains.length; i++){
                    if(_.contains(activeDomains, obj.domains[i])){
                        return true;
                    }
                }

                return false;
            })
            .each(function(obj){

                initiativesC.get(obj.slug).set("visible", true);
                numFiltered++;
            })
            .value();

        this.model.set("numFiltered", numFiltered);

        var opt = opt || {};
        if(opt.toggleFiltersForm){
            this.toggleFiltersForm();    
        }
        
        // show the loading view to simulate some processing time
        // (give the feel that something happened)
        var randomDelay = opt.delay || parseInt(250 + Math.random()*1000);
        this.showLoading(randomDelay);

        var self = this;
        Q.delay(randomDelay).done(function(){

            cartografiaChannel.request("updateMarkers", {
                fitBounds: true
            });

            self.showList();

            baseLayersC.get(baseMapId).select();
        });


    },
*/
    selectInitiative: function(e){

        e.preventDefault();
        var slug = $(e.currentTarget).data("slug");
        initiativesC.get(slug).select();
    },

});

/*
 this view will be always present; when we "open" and "close" the menu, this is what really happens:
  - add/remove the "height: 95%" to style
  - show a new instance of the menuBody view in the region / close the region
 */


var MenuLV = ControlLV.extend({

    initialize: function(){
    },

    template: "menu/templates/menu.html",

    modelEvents: {
        "change:menuOpen":"toggleRegion"
    },

    ui: {
        menuBtn: "i.fa-bars",
        closeBtn: "i.fa-close"

    },

    events: {
        "click @ui.menuBtn": "updateModel",
        "click @ui.closeBtn": "updateModel"
    },

    regions: {
        bodyRegion: "div.mn-r-menu-body"
    },

    updateModel: function(){

        this.model.set("menuOpen", !this.model.get("menuOpen"));
    },

    toggleRegion: function(e){

        this.model.get("menuOpen")===true ? this.show() : this.reset();
    },

    show: function(){
        
        this.$el.addClass("leaflet-control-open");
        this.$el.children().first().addClass("menu-container-open");
        this.ui.closeBtn.toggleClass("invisible");

        // var model = new Backbone.Model({
        //     "baseLayers": baseLayersC.toJSON(),
        //     "types": typesC.toJSON(),
        //     "domains": domainsC.toJSON()
        // });

        var menuBodyIV = new MenuBodyLV({
//            model: model
        });
        this.bodyRegion.show(menuBodyIV);
//        this.bodyRegion.$el.css("padding-top", "5px");
    },

    reset: function(){

        this.bodyRegion.$el.css("padding-top", "");
        this.bodyRegion.reset();
        this.ui.closeBtn.toggleClass("invisible");

        // remove the height because after closing the menu sometimes the body region will still
        // be selected, giving a strange effect
        this.$el.removeClass("leaflet-control-open");
        this.$el.children().first().removeClass("menu-container-open");

    }
});
