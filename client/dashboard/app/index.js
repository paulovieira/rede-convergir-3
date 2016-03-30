require("./_config/config");

var $ = require("jquery");
var Backbone = require("backbone");
var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");
//var Q = require("q");

var menuPlugin = require("./plugins/menu/menu-plugin.js");
var initiativesPlugin = require("./plugins/initiatives/initiatives-plugin.js");
var activityPlugin = require("./plugins/activity/activity-plugin.js");

//var EventsPlugin = require("./plugins/events/events-plugin.js");
//var ProfilePlugin = require("./plugins/profile/profile-plugin.js");

Mn.register([
    menuPlugin,
    initiativesPlugin,
    activityPlugin,

//    new EventsPlugin(),
    //new ProfilePlugin(),
]);

//debugger;


//setTimeout(function(){

Radio.channel("menu").request("start", {
    region: new Mn.Region({ el: $("<div id='mn-r-main'>").prependTo("div.container") }),
});

//}, 4000)


// it's better to call history.start only at the end to make sure that the  
// initial hash (if present in the url bar) will actually be processed;
// if there is some async processing involved, that should be taken into account

Backbone.history.start({});