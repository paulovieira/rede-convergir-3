require("./_config/config");

var $ = require("jquery");
var Mn = require("backbone.marionette");
var Radio = require("backbone.radio");


var MenuPlugin = require("./plugins/menu/menu-plugin.js");

console.log("uuuiii")

Mn.register([
    // {
    //  plugin: require("./plugins/plugin-a/plugin-a.js"),
    //  name: 'xyz'
    // }
    new MenuPlugin(),

]);

Radio.channel("plugins").request("start", {
    plugin: "menu-plugin",
    region: new Mn.Region({ el: $("<div id='mn-r-main'>").prependTo("body") }),

    // we can override the following state options: initialState and syncEvent
    // stateOptions: {
    //     initialState: {
    //         menuItem: "sources"
    //     },
    //     syncEvent: "before:attach"
    // }

});
