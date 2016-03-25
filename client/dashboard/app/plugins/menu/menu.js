
require("./menu.css");

var $ = require("jquery");
var _ = require("underscore");
var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");


var MenuState = Mn.State.extend({

    initialState: {
        menuItem: "maps"
    },

    componentEvents: {
        "click:item": "onClickItem"
    },

    onClickItem: function(item) {
        //debugger;
        this.set("menuItem", item);
    },

});


var Menu = Mn.LayoutView.extend({

    initialize: function(options){

    },

    // dummy class to narrow the scope the css classes to the view's element
    className: "js-menu",

    template: require('./menu.html'),

    ui: {
        item: "li",

    },

    events: {
        "click @ui.item": function(e){

            var id = $(e.target).prop("id");
            id = id.substring("js-menu-".length);
            this.trigger("click:item", id);
        }
    },

    stateClass: MenuState,
    stateEvents: {
        'change:menuItem': 'onChangeMenuItem'
    },

    onChangeMenuItem: function(state, value, options){
//debugger;
        if(!value){ return; }

        //debugger;
        var previous = state.previousAttributes();

        if(previous.menuItem){
            
            Radio.channel("plugins").request("stop", {
                plugin: previous.menuItem + "-plugin"
            });

            // see "Attribute Contains Selector":
            //   https://api.jquery.com/attribute-contains-selector/
            this.$("li[id*=" + previous.menuItem + "]").removeClass("menu-select");
        }

        console.log("start plugin " + value)
        // Radio.channel("plugins").request("start", {
        //     plugin: value + "-plugin",
        //     region: this.getRegion("content")
        // });

        this.$("li[id*=" + value + "]").addClass("menu-select");

    },

    onAttach: function(){
    },

    regions: {
        content: "div#mn-r-content"
    },

    onBeforeAttach: function(){
        //debugger;
        // the initial state will be set when this event fires;
        // the onChangeMenuItem method will be executed; the view's region are ready;
    }


});

if(NODE_ENV==="dev"){
//    window.Menu = Menu;
}

module.exports = Menu;
