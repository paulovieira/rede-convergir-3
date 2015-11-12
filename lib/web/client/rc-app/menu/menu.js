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
    },

    template: "menu/templates/menu-body.html",

    attributes: {
        style: "height: 100%; overflow-y: auto;"
    },

    regions: {
        listRegion: "div#mn-r-list"
    },

    ui: {
        "searchInput": "input#search-initiative",
        "btnOptions": "button#options-filters",
        "btnCancelOptions": "button#options-cancel-filters",
        "btnApplyFilters": "button#options-apply-filters"
    },

    events: {
        "keyup @ui.searchInput": _.debounce(function(e){ 
            // TODO: check the key (e.which)
            var key = e.which;
            //debugger;

            if((key >= 48 && key <= 90)||key===8||key===13){

                this.filter()     
            }
            
        }, 800),

        "click @ui.btnOptions": "toggleFiltersForm",
        "click @ui.btnCancelOptions": "toggleFiltersForm",
        "click @ui.btnApplyFilters": function(){

            this.filter({
                toggleFiltersForm: true
            });
        },

    },

    onAttach: function(){

        this.$("input#search-initiative").val(RC.searchText).trigger("focus");
    },

    onBeforeShow: function(){

        this.showList();
    },

    toggleFiltersForm: function(){

        this.$("div#options-filters-form").toggleClass("invisible");

        this.filtersIsOpen = !this.$("div#options-filters-form").hasClass("invisible");
        if(!this.filtersIsOpen){
            
            // when the filters box is closed, always move the focus to the search box
            // (this will remove the active state from the options button)
            this.$("input#search-initiative").val(RC.searchText).trigger("focus");
        }
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

    showList: function(){

        var menuListIV = new MenuListIV({
            collection: initiativesC
        });
        this.listRegion.show(menuListIV);
    },

    showLoading: function(delay){

        var loadingIV = new LoadingIV({
            model: new Backbone.Model({ delay: delay })
        });
        this.listRegion.show(loadingIV);
    },

    filter: function(opt){

        initiativesC.each(function(model){
            model.set("visible", false);
        });

        // active options for filter 1: search box
        var searchText = RC.searchText = this.ui.searchInput.val();

        // active options for  filter 2: type
        var activeTypes = [];
        this.$(".js-filter-type")
            .each(function(i, el) {
                var $el = $(el);
                if($el.prop("checked")){
                    activeTypes.push($el.data("typeId"));
                }
            });

        // active options for  filter 3: domains
        var activeDomains = [];
        this.$(".js-filter-domain")
            .each(function(i, el) {
                var $el = $(el);
                if($el.prop("checked")){
                    activeDomains.push($el.data("domainId"));
                }
            });

        // active option for the base map
        var baseMapId = this.$("input[type='radio'][name='base-maps']:checked").val();

        _.chain(RCData.initiatives)

            // filter 1 - text
            .filter(function(obj){

                return obj.name.toLowerCase().indexOf(searchText) >= 0;
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
            })
            .value();


        var opt = opt || {};
        if(opt.toggleFiltersForm){
            this.toggleFiltersForm();    
        }
        
        // show the loading view to simulate some processing time
        // (give the feel that something happened)
        var randomDelay = parseInt(250 + Math.random()*1000);
        this.showLoading(randomDelay);

        var self = this;
        Q.delay(randomDelay).done(function(){

            cartografiaChannel.request("updateMarkers", {
                fitBounds: true
            });

            self.showList();

            cartografiaChannel.request("selectLayer", baseMapId);
        });


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

        // cartografiaChannel.reply("updateMenuBody", function(){

        //     this.show();
        // }, this);
    },

    template: "menu/templates/menu.html",

    modelEvents: {
        "change:menuOpen":"toggleRegion"
    },

    ui: {
        menuBtn: "i.menu-icon",
        fullscreenBtn: "a.js-full-screen"
    },

    events: {
        "click @ui.menuBtn": "toggleMenuOpen",
        "click @ui.fullscreenBtn": "fullscreenBtnClicked",
        // "click label.checkbox": _.debounce(function(e){
        //     this.toggleCheckbox(e);
        // }, 10, true)
    },

    regions: {
        bodyRegion: "div.mn-r-menu-body"
    },

    fullscreenBtnClicked: function(){

        if($.fullscreen.isFullScreen()){
            cartografiaChannel.request("closeFullscreen", "#map-container");    
        }else{
            cartografiaChannel.request("openFullscreen", "#map-container");    
        }
        
    },

//     toggleCheckbox: function(e){

//         $checkbox = $(e.currentTarget).find(':checkbox');

//         // from paper kit checkbox plugin (ct-paper-checkbox.js)
//         //$checkbox.checkbox('toggle');

//         var x = $checkbox.prop("checked");
// debugger;
//         $checkbox.prop("checked", !$checkbox.prop("checked"));

//         var x = $checkbox.prop("checked");
// debugger;
//     },

    toggleMenuOpen: function(){

        var menuOpen = this.model.get("menuOpen");
        this.model.set("menuOpen", !menuOpen);
    },

    toggleRegion: function(e){

        if(this.model.get("menuOpen")===true){
            this.show();
        }
        else{
            this.reset();
        }
        
    },

    show: function(){
        
        this.$el.addClass("leaflet-control-open");
        this.$el.children().first().addClass("menu-container-open");

        var menuBodyIV = new MenuBodyLV({
            model: new Backbone.Model(RCData)
        });
        this.bodyRegion.show(menuBodyIV);
    },

    reset: function(){

        this.bodyRegion.reset();

        // remove the height because after closing the menu sometimes the body region will still
        // be selected, giving a strange effect
        this.$el.removeClass("leaflet-control-open");
        this.$el.children().first().removeClass("menu-container-open");
    }
});
