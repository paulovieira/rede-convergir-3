// the NODE_ENV env variables should be defined before the node process is started; 
// if not defined we use the following defaults;
process.env.NODE_ENV = process.env.NODE_ENV || "production";

// the above env variables must be defined before the config module is first required
var Config = require("config");
var Hapi = require("hapi");
var Hoek = require("hoek");
var Utils = require("./common/utils");
var Plugins = require("./common/external-plugins");
var WebPlugin = require("./web");

internals = {};

internals.init = function(){

    // add custom filters and globals to the nunjucks template engine
    Utils.configureNunjucks();
    var defaultServerOptions = JSON.parse(JSON.stringify(Config.get("hapi.server")));

    var server = new Hapi.Server(defaultServerOptions);
	server.connection({
    	port: Config.get("port")
	});

    // 1) register the external plugins
    var externalPlugins = [];
    
    if(process.env.NODE_ENV!=="production"){
        externalPlugins.push(Plugins.good);
    }
    
	server.register(externalPlugins, function(err) {

	    Hoek.assert(!err, 'Failed registration of external plugins: ' + err);

        // 2) register the web plugin (routes, etc)
		server.register([WebPlugin], function(err){

	    	Hoek.assert(!err, 'Failed registration of internal plugins: ' + err);

            // 3) start the server and finish the initialization process
	    	server.start(function(err) {

		    	Hoek.assert(!err, 'Failed start server: ' + err);
		    	Utils.registerServer(server);

                console.log('Server started at: ' + server.info.uri);
		    });
		});    
	});
};

internals.init();
