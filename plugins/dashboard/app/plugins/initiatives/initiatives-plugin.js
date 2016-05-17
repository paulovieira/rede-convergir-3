var Mn = require("backbone.marionette");


var InitiativesMain = require("./initiatives-main");
var InitiativesList = require("./initiatives-list");
var LoadingView = require("../../common/loading-view/loading-view");
var InitiativeEditModal = require("./initiative-edit-modal");

var initiativesPlugin = new Mn.Plugin({
    name: "initiatives",
    dev: NODE_ENV==="dev",
    dependencies: [],
    views: [
        {
            viewName: "initiatives-main",
            viewClass: InitiativesMain
        },
        {
            viewName: "initiatives-list",
            viewClass: InitiativesList
        },
        {
            viewName: "loading-view",
            viewClass: LoadingView
        },
        {
            viewName: "initiative-edit-modal",
            viewClass: InitiativeEditModal
        },
    ]
});

module.exports = initiativesPlugin;

if(NODE_ENV==="dev"){
    window.initiativesPlugin = initiativesPlugin;
}
