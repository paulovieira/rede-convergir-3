var Mn = require("backbone.marionette");

var EventsPlugin = Mn.Plugin.extend({
    name: "events",
    dependencies: [],
    views: [
        {
            viewClass: require("./events-main"),
            viewName: "events-main"
        },
    ]
});

module.exports = EventsPlugin;