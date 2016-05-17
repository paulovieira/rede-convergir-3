var Mn = require("backbone.marionette");
var _ = require("underscore");
var Radio = require("backbone.radio");

Mn.Plugin = Mn.Object.extend({

    constructor: function(options){

        //debugger;
        var keys = ['name', 
            'dependencies', 
            'views', 
            'routes', 
            'region', 
            'onBeforeRegister', 
            'onRegister', 
            'dev'];

        this.mergeOptions(options, keys);
        this._addChannel();

        // copy the routes option to this._routes
/*
        this._routes = {};
        this.routes = this.routes || [];
        var i=0, l=this.routes.length, obj;
        for(; i<l; i++){
            //debugger;
            obj = this.routes[i];

            if(!_.isFunction(obj.handler.onNavigate)){
                throw new Error('a route handler must have a "onNavigate" method');
            }

            this._routes[obj.path] = {};
            this._routes[obj.path].onNavigate = _.bind(obj.handler.onNavigate, this);
        }
*/
        // copy the views option to this._views
        this._views = {};
        this.views = this.views || [];
        var i=0, l=this.views.length, obj;

        if(l===0){
            throw new Error('the plugin "' + this.name + '" does not have any views');
        }

        this._defaultViewName = this.views[0].viewName;
        for(; i<l; i++){
            //debugger;
            obj = this.views[i];
            this._views[obj.viewName] = obj.viewClass;
        }

        //this.region = undefined;
        this.isRunning = false;
        Mn.Object.call(this, options);
    },


    _addChannel: function(){
        //debugger;
        this.channel = Radio.channel(this.name);

        if(this.dev){
            Radio.tuneIn(this.name);    
        }

        this.channel.reply("start", this.start, this);
        this.channel.reply("stop", this.stop, this);
        this.channel.reply("showView", this.showView, this);
        this.channel.reply("navigate", this.navigate, this);
    },

    start: function(options){
        //debugger;

        if(this.isRunning){ return; }

        var region = options.region || this.region;
        var view = options.view || this._defaultViewName; 
        
        var defaultView = this.showView({
            region: region, 
            view: view, 
            viewOptions: _.extend({}, options.viewOptions),
            //stateOptions: _.extend({}, options.stateOptions)
        });                

        //this.region = options.region;
        //debugger;
        //this.defaultRegion = defaultView.getRegion("default");

        defaultView.once('destroy', this.stop, this);

        this.isRunning = true;
        return this.defaultView;
    },

    stop: function(){
        //debugger;
        this.isRunning = false;
        //this.defaultRegion = undefined;

        // TODO: when the plugin is stopped, it's channel should be stopped too (?)
        //this.region = undefined;
    },

    showView: function(options){

        //debugger;
        var View = this._views[options.view];
        if(!View){
            throw new Error('The view "' + options.view + '" does not exist in the plugin "' + this.name + '"');
        }

        if(View !== Backbone.View && !(View.prototype instanceof Backbone.View)){
            throw new Error("viewClass must be an instance of Backbone.View");
        }

        var v = new View(options.viewOptions || {});
        v.$el.attr({'data-mn-cid': v.cid, 'data-mn-view-name': options.view});
        
        var region = options.region || this.region;
        if(!(region instanceof Mn.Region)){
            throw new Error('region must be an instance of Mn.Region');
        }

        // the view instance has access to the underlying plugin's channel
        //debugger;
        v.channel = this.channel;
        v.plugin = this;
/*
        var stateClass = v.getOption("stateClass");
        if (stateClass) {

            options.stateOptions = options.stateOptions || {};
            v.state = new stateClass({
                component: v,
                initialState: _.extend({}, stateClass.prototype.initialState, options.stateOptions.initialState)
            });

            // make the view listen to the events triggered by the state
            if (v.stateEvents) {
                Mn.State.syncEntityEvents(v, v.state, v.stateEvents, options.stateOptions.syncEvent || "before:attach");
            } 

            // make the state listen to the events triggered by the view
            if(v.state.viewEvents){
                Mn.State.syncEntityEvents(v.state, v, v.state.viewEvents);    
            }

            // make the state listen to the events triggered by the view's channel
            // (which is the plugin's channel)
            if(v.state.channelEvents){
                Mn.State.syncEntityEvents(v.state, v.channel, v.state.channelEvents);    
            }

            // note: all these event handlers will all be erased when the view is destroyed
        }
*/
        // when a view is instantiated via the request "showView", the plugin's channel is attached
        // to the view; when the view is detroyed we remove that reference
        // TODO: use the delete operator instead?
        v.once('destroy', function(){
            //debugger;
            this.channel = undefined;
            this.plugin = undefined;
        }, v);

        region.show(v);
        //v.$el.addClass("mn-view-name-" + options.view);
        //this.isRunning = true;
        return v;
    },

    navigate: function(navigateOptions){
        //debugger;
        if(!this.router){
            throw new Error('plugin "' + this.name + '" does not have a router');
        }

        var fragment = navigateOptions.fragment;
        var options = navigateOptions.options || {};
        this.router.navigate(fragment, options);
    },

});
/*
// object holding with all the registered plugins
Mn._plugins = {};


Mn.register = function(plugins){
    //debugger;
    if(!_.isArray(plugins)){
        plugins = [plugins];
    }

    _.each(plugins, function(plugin){

        plugin.triggerMethod('before:register');
        
        // TODO: plugin names must be unique
        Mn._plugins[plugin.name] = plugin;

        // create the plugin's router
        //debugger;

        // if(_.keys(plugin._routes).length){
        //     plugin.router = new Mn.Router({ routes: plugin._routes});
        // }

        plugin.triggerMethod('register');


    });

};

*/