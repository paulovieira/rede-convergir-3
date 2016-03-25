var Mn = require("backbone.marionette");
var x = 1;
var MenuPlugin = Mn.Plugin.extend({
    name: "menu-plugin",
    dependencies: [],
    views: [
        {
            viewClass: require("./menu"),
            viewName: "menu"
        },

    ]
});

module.exports = MenuPlugin;

