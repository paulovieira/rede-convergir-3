var Mn = require("backbone.marionette");

var ProfilePlugin = Mn.Plugin.extend({
    name: "profile",
    dependencies: [],
    views: [
        {
            viewClass: require("./profile-main"),
            viewName: "profile-main"
        },
    ]
});

module.exports = ProfilePlugin;