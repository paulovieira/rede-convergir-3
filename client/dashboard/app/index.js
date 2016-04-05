require("./_config/config");


var $ = require("jquery");
var Backbone = require("backbone");
var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");
var menuPlugin = require("./plugins/menu/menu-plugin.js");


//var EventsPlugin = require("./plugins/events/events-plugin.js");
//var ProfilePlugin = require("./plugins/profile/profile-plugin.js");
/*
Mn.register([
    menuPlugin,
    initiativesPlugin,
    activityPlugin,

//    new EventsPlugin(),
    //new ProfilePlugin(),
]);

*/
//debugger;



/**/
menuPlugin.start({
    region: new Mn.Region({ el: $("div.container") }),
});


// it's better to call history.start only at the end to make sure that the  
// initial hash (if present in the url bar) will actually be processed;
// if there is some async processing involved, that should be taken into account

Backbone.history.start({});






/*
var Child = Mn.ItemView.extend({

    initialize: function(){
        this.$el.attr('data-mn-cid', this.cid);
    },

    template: require("./_temp/child.html"),

    ui: {
        saveButtonChild: "button.mn-btn-save"
    },

    events: {
        "click @ui.saveButtonChild": function(e){
            debugger;
            if(Mn.getClosestCid(e.target)!==this.cid){ return; }
            //if(!currentTargetIsInView.call(this, e)){ return };

            console.log("i'm in the child view!")
        }
    },

});

var Parent = Mn.LayoutView.extend({
    initialize: function(){
        this.$el.attr('data-mn-cid', this.cid);
    },

    template: require("./_temp/parent.html"),

    ui: {
        saveButtonParent: " button.mn-btn-save",
        someRegion: "div.some-region"
    },

    events: {
        "click @ui.saveButtonParent": function(e){
            debugger;
            //if(!currentTargetIsInView.call(this, e)){ return };
            if(Mn.getClosestCid(e.target)!==this.cid){ return; }

            console.log("i'm in the parent view!")
        }
    },

    onBeforeAttach: function(){
        this.getRegion("someRegion").show(new Child);
    },

    regions: {
        someRegion: '@ui.someRegion'
    }

});


var mainRegion = new Mn.Region({ el: $("<div id='mn-r-main'>").prependTo("div.container") })
mainRegion.show(new Parent);
*/






