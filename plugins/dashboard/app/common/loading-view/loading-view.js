//require("./loading-view.css");

var Mn = require("backbone.marionette");

var LoadingView = Mn.LayoutView.extend({

    initialize: function(options){
    },

    template: require('./loading-view.html'),
});

if(NODE_ENV==="dev"){
    window.LoadingView = LoadingView;
}

module.exports = LoadingView;
