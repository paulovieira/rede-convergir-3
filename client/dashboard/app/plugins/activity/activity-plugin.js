var Mn = require("backbone.marionette");

var ActivityMain = require("./activity-main");
var LoadingView = require("../../common/loading-view/loading-view");

var activityPlugin = new Mn.Plugin({
    name: "activity",
    dependencies: [],
    views: [
        {
            viewName: "activity-main",
            viewClass: ActivityMain,
        },
        {
            viewName: "loading-view",
            viewClass: LoadingView
        },
    ]
});

module.exports = activityPlugin;