var Mn = require("backbone.marionette");
var _ = require("underscore");
var Radio = require("backbone.radio");

Mn.Plugin = Mn.Object.extend({

    constructor: function(options){

        this.options = options || {};
        this._addChannel();
        //this._updatePluginsChannel;
        this._rootViewName = undefined;
        this._region = undefined;
    },

    _views: {},

    addView: function(viewName, viewClass){
        //debugger;

        this._views[viewName] = viewClass;
        if(!this._rootViewName){
            this._rootViewName = viewName; 
        }

    },

    _addChannel: function(){
        //debugger;
        var channel = this.channel = Radio.channel(this.name);

        var showHandler = function(options){

            //debugger;
            var View;
            if(_.isString(options.view) && this._views[options.view]){
                View = this._views[options.view];
            }
            
            if(!View){
                throw new Error('The view "' + options.view + '" does not exist in the plugin "' + this.name + '"');
            }

            if(View !== Backbone.View && !(View.prototype instanceof Backbone.View)){
                throw new Error("viewClass must be an instance of Backbone.View");
            }

            var v = new View(options.viewOptions || {});

            if(!(options.region instanceof Mn.Region)){
                throw new Error('options.region must be an instance of Mn.Region');
            }

            // the view instance has access to the underlying plugin's channel
            //debugger;
            v.channel = channel;

            var stateClass = v.getOption("stateClass");
            if (stateClass) {
                options.stateOptions = options.stateOptions || {};
                v.state = new stateClass({
                    component: v,
                    initialState: _.extend({}, stateClass.prototype.initialState, options.stateOptions.initialState)
                });

                if (!v.stateEvents) {
                    console.warn('stateEvents is missing in view "' + options.view + '"');
                } 
                else {
                    Mn.State.syncEntityEvents(v, v.state, v.stateEvents, options.stateOptions.syncEvent || "before:attach");
                }
            }

            options.region.show(v);

            v.$el.addClass("mn-view-name-" + options.view);
        };

        this.channel.reply("show", showHandler, this);
    },

    start: function(options){
        //debugger;
        
        this.channel.request("show", {
            region: options.region, 
            view: this._rootViewName, 
            viewOptions: _.extend({}, options.viewOptions),
            stateOptions: _.extend({}, options.stateOptions)
        });

        this._region = options.region;
    },

    stop: function(){
        //debugger;

        this._region.reset();
        this._region = undefined;
    }

});

// object holding with all the registered plugins
Mn._plugins = {};


Mn.register = function(plugins){
    //debugger;
    if(!_.isArray(plugins)){
        plugins = [plugins];
    }

    var plugin;
    for(var i=0; i<plugins.length; i++){
        plugin = plugins[i];

        // TODO: plugin names must be unique
        Mn._plugins[plugin.name] = plugin;
        _.each(plugin.views, function(obj, index){
            //debugger;
            plugin.addView(obj.viewName, obj.viewClass);
            
        });

    }
};

Radio.channel("plugins").reply("start", function(options){
    //debugger;
    var plugin = Mn._plugins[options.plugin];

    if(!plugin){
        throw new Error('plugin "' + options.plugin + '" is not registered');
    }

    plugin.start(options);
});

Radio.channel("plugins").reply("stop", function(options){
    //debugger;
    var plugin = Mn._plugins[options.plugin];

    if(!plugin){
        throw new Error('plugin "' + options.plugin + '" is not registered');
    }

    plugin.stop(options);
});
