
var OptionsModalIV = Mn.ItemView.extend({
    x:9,
    template: "menu/templates/options-modal.html",

    ui: {
        "btnApplyFilters":   "button.js-modal-apply"
    },

    events: {
        "click @ui.btnApplyFilters": "showUpdatedList"
    },
    dummy: "abcdr",
    onAttach: function(){

        // initialize the iCheck plugin 
        this.$(".modal-body").iCheck({
            checkboxClass: 'icheckbox_minimal-grey',
            radioClass: 'iradio_minimal-grey',
            cursor: true,
            // increaseArea: '20%',
        });
    },

    onDestroy: function(){

        cartografiaChannel.request("searchFocus");
    },

    showUpdatedList: function(){
        
        this.updateCollections();
        cartografiaChannel.request("showList");
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

        cartografiaChannel.reply("searchFocus", function(options){

            this.ui.inputSearch.val(RC.searchText).trigger("focus");
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
    },

    events: {
        "keyup @ui.inputSearch": _.debounce(function(e){ 

            // TODO: improve the handling of more keys 
            // https://css-tricks.com/snippets/javascript/javascript-keycodes/
            var key = e.which;
            if((key >= 48 && key <= 90) || key===8 || key===13 || key===46){
                RC.searchText = this.ui.inputSearch.val();
                initiativesC.updateVisibility("_updateInFilters");
                this.showList();
            }
            
        }, 800),

    },

    behaviors: {

        ShowOptionsModal: {
            behaviorClass: window.Behaviors.ShowModal,
            uiKey: "btnOptions",  // will listen for clicks on @ui.btnOptions
            viewClass: OptionsModalIV, // and will show this view in the main modal region
            getModel: function(){
                return new Backbone.Model({
                    "baseLayers": baseLayersC.toJSON(),
                    "types": typesC.toJSON(),
                    "domains": domainsC.toJSON(),
                    "location": window.location
                });
            },
            sizeClass: ""
        },
    },


    onBeforeDestroy: function(){

        $(window).off("resize", this.setVisibleBounds);
    },

    onAttach: function(){

        // TODO: don't set the focus if we are on a mobile broser (to avoid showing the virtual keyboard)
        //this.$("input#search-initiative").val(RC.searchText).trigger("focus");
        cartografiaChannel.request("searchFocus");

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
    /*
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
*/

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

        var x;
        var numberSpelling = {
            "pt": {
                "1": "uma iniciativa encontrada",
                "2": "duas iniciativas encontradas"
            }
        };

        var numFiltered = initiativesC.where({inFilters: true}).length;
        var numVisible = initiativesC.where({inFilters: true, inVisibleBounds: true}).length;

        function iniciativa(n){
            return n===1 ? "iniciativa" : "iniciativas";
        }

        function visivel(n){
            return n===1 ? "visível" : "visíveis";
        }

        var numFilteredMsg = numFiltered + " " + iniciativa(numFiltered) + " encontradas";
        if(numVisible < numFiltered){
            numFilteredMsg += ", " + numVisible + " " + visivel(numVisible) + " (faça zoom out para ver mais)";

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

        var menuBodyIV = new MenuBodyLV();
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
