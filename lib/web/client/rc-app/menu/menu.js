/*
var ModalMoreInfoIV = Mn.ItemView.extend({
    template: "menu/templates/modal-map-info.html",

    ui: {
        "closeBtn":  "button.js-modal-cancel",
    },

    behaviors: {
        CloseModal: {
            behaviorClass: window.Behaviors.CloseModal,  // will listen for clicks on @ui.modalCloseBtn
        },
    },

});

var ModalMapOptionsIV = Mn.ItemView.extend({
    template: "menu/templates/modal-map-options.html",

    ui: {
        "closeBtn":  "button.js-modal-cancel",
        "updateBtn": "button.js-modal-update"
    },

    events: {
        "click @ui.updateBtn": "updateMap"
    },

    behaviors: {
        CloseModal: {
            behaviorClass: window.Behaviors.CloseModal,  // will listen for clicks on @ui.modalCloseBtn
        },
    },

    updateMap: function(){

        var opacity = parseInt(this.$("#opacity").val(), 10);
        if(_.isNumber(opacity) && opacity >= 0 && opacity <= 100){
            this.model.set("opacity", opacity);
        }

        var zindex = parseInt(this.$("#zindex").val(), 10);
        if(_.isNumber(zindex) && zindex !== this.model.get("zindex")){
            this.model.set("zindex", zindex);
        }
        //debugger;
        // var bringToFront = this.$(".js-bring-to-front").is(":checked");
        // if(bringToFront){
        //     this.model.trigger("bringToFront");
        // }

        $("#modal-1").modal("hide");
        this.destroy();
    }


});
*/

var MenuBodyIV = Mn.ItemView.extend({

    template: "menu/templates/menu-body.html",

    initialize: function(){

        cartografiaChannel.reply("scrollTo", function(slug){

            this.scrollTo(slug);
        }, this);
    },

    attributes: {
        style: "height: 100%; overflow-y: auto;"
    },

    ui: {
        "btnTypesDescription": "a.js-modal-types-description",
        "btnFlyTo": "a.js-fly-to",
        "itemContainer": "div.initiative-container"
    },

    events: {
        "click @ui.btnTypesDescription": "showTypesDescription",
        "click @ui.btnFlyTo": "flyTo",
        "mouseenter @ui.itemContainer": "showLabelAndScale",
        "mouseleave @ui.itemContainer": "hideLabelAndResetScale"
    },

    showTypesDescription: function(){

        $("#types-more-info").modal();
    },

    scrollTo: function(slug){

        var $initiative = this.$('div[data-slug="' + slug + '"]');
        if($initiative.length === 0){
            return;
        }

        this.$el.scrollTo($initiative, {
            duration: 900,
            interrupt: true
        });
    },

    flyTo: function(e){

        e.preventDefault();
        var slug = $(e.currentTarget).data("slug");

        mapM.hideLabelAndResetScale(slug);
        mapM.openPopup(slug);
        
        var updateZIndex = function(){
            var marker, _zIndex;    
            for(key in mapM.attributes.markersLayer._layers){
                marker = mapM.attributes.markersLayer._layers[key];
                if(marker.feature.properties.slug === slug){
                    _zIndex = marker._zIndex;
                    if(_zIndex < RC.markersMaxZindex){
                        RC.markersMaxZindex++;
                        marker._zIndex = RC.markersMaxZindex;
                    }

                    marker._icon.style["zIndex"] = "" + RC.markersMaxZindex;
                }
            }
        };

        // this a bit hacky; we have to do it because the flyTo animation seems to be
        // resetting he zindex of the marker while it lasts;
        // we are taking into account that the duration for the 
        // flyTo animation is 1200ms; note that bind a callback to the 'moveend'
        // with .once will not work because that event is fired at the beggining of the
        // animation
        // TODO: report this bug in github
        setTimeout(updateZIndex, 1300);
        setTimeout(updateZIndex, 1400);
        setTimeout(updateZIndex, 1500);

        var zoom = mapM.attributes.leafletMap.getZoom();
        mapM.flyTo(initiativesC.get(slug).get("coordinates"), zoom >= 10 ? zoom : 9);


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
/*
var MenuBodyIVOLD = Mn.ItemView.extend({
    template: "menu/templates/menu-body-old.html",
    ui: {
        "chkBox": "input.js-select-layer[type='checkbox']",
        "radio": "input.js-select-layer[type='radio']",
        "infoBtn": "a.js-map-more-info",
        "optionsBtn": "a.js-map-options"
    },
    events: {
        "change @ui.radio": "inputClicked",
        "change @ui.chkBox": "inputClicked",
        "click @ui.infoBtn": "showInfoModal",
        "click @ui.optionsBtn": "showOptionsModal"
    },

    behaviors: {

        ShowOptionsModal: {
            behaviorClass: window.Behaviors.ShowModal,
            uiKey: "optionsBtn",  // will listen for the ocurrence of the given eventType on @ui.editModalBtn
            eventType: "click",  // "click" is the default eventyType, but we can use others to trigger the modal
            viewClass: ModalMapOptionsIV,  // will show this view in the modal region, passing the current model or collection 
            //mapId: 

        },

        ShowInfoModal: {
            behaviorClass: window.Behaviors.ShowModal,
            uiKey: "infoBtn",  // will listen for the ocurrence of the given eventType on @ui.editModalBtn
            eventType: "click",  // "click" is the default eventyType, but we can use others to trigger the modal
            viewClass: ModalMoreInfoIV,  // will show this view in the modal region, passing the current model or collection 
            //mapId: 

        },

    },

    inputClicked: function(e){

        var $input = $(e.target);        
        var mapId = $input.data("mapId");
        var mapIndex = this.model.get("mapIndex");

        if($input.is(":checked")){
            cartografiaChannel.request("selectLayer", mapId);
        }
        else{
            cartografiaChannel.request("deselectLayer", mapIndex, mapId);
        }

    },

    onAttach: function(){
        //debugger;
        this.$('#tree-menu').treed({
            openedClass:'glyphicon-chevron-right', 
            closedClass:'glyphicon-chevron-down'
        });

        // show the tree open at start 
        this.$(".js-map-group").trigger("click");
    }
});
*/

/*
 this view will be always present; when we "open" and "close" the menu, this is what really happens:
  - add/remove the "height: 95%" to style
  - show a new instance of the menuBody view in the region / close the region
 */


var MenuLV = ControlLV.extend({

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
        "click @ui.fullscreenBtn": "fullscreenBtnClicked"
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

        var menuBodyIV = new MenuBodyIV({
            collection: initiativesC
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
