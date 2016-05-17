### plugin

In its simplest form, a plugin is a set a views that form a coherent unit and are bundled together. Those views might be subviews.

The plugin offers a simple API to show these views

plugin's name
plugin's views
plugin's routes
plugin's dependencies

plugin's defaultView
plugin's defaultRegion


#### plugin start

-we should give a region
-if a view (name) is not given, the first view defined in the plugin will be used

#### loading libraries

bootstrap has to be imported using the imports loader


#### routing and plugins

possible api:


path: "/initiatives"

Q(
    Radio.channel("menu").request("start", { 
        region: publicRegion 
    })
)
.then(function(menu){
    return Radio.channel("initiatives").request("start", { 
        region: menu.defaultView.getRegion(...) 
    })
})

(the plugin should be started only if it hasn't already; if it is already start, the promise should resolve immediatelly)


path: "/initiatives/:id"

Q(
    Radio.channel("menu").request("start", { 
        region: publicRegion 
    })
)
.then(function(menu){
    return Radio.channel("initiatives").request("start", { 
        region: menu.defaultView.getRegion(...) 
    })
})
.then(function(initiatives){
    return Radio.channel("xyz").request("start", { 
        region: initiatives.defaultView.getRegion(...) 
    })
})

