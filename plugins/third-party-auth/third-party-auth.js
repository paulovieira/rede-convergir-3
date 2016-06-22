var Path = require("path");
var Hoek = require("hoek");
var Hoek = require("bell");
var Config = require("nconf");
var UUID = require("node-uuid");
var Utils = require("../../util/utils");

var internals = {};

exports.register = function(server, options, next){

    server.auth.strategy('facebook', 'bell', {
        provider: 'facebook',
        isSecure: false,
        password: Config.get('hapi:ironPassword'),
        clientId: Config.get('facebookApp:id'),
        clientSecret: Config.get('facebookApp:secret')
    });

    // server.auth.strategy('bell-session', 'cookie', {
    //     isSecure: false,
    //     password: Config.get('hapi:ironPassword'),
    //     cookie: 'sid-bell',
    //     requestDecoratorName: 'cookieAuthBell'
    // });


    server.route({
        method: ['GET', 'POST'],
        path: '/login/facebook',
        config: {
            handler: function(request, reply){
                console.log("now: ", Date.now());
                // todo: what if we have already authenticated, with via facebook or via normal login?

                if(!request.auth.isAuthenticated){
                    return reply.redirect('/login');
                }
                Utils.logObj("request.auth", request.auth);

                var uuid = UUID.v4();

                // todo: place the raw data in some property, and define a session object with 
                // the same structure, independently of how the authentication was done
                var session = request.auth.credentials;
                var sessionCache = server.plugins['hapi-auth-session']['sessionCache'];

                ///remove if
                if(!sessionCache){
                    throw new Error('xxx');
                }

                sessionCache.set(

                    // key/id - "'the unique item identifier (within the policy segment)'
                    uuid,

                    //  value to be stored
                    session,

                    // ttl - 'set to 0 to use the caching rules from the Policy initial configuration' ("expiresIn")
                    0,

                    function(err) {
                        debugger;

                        if (err) {
                            console.log(err.message);
                            return reply(err);
                        }

                        // second, set the cookie data; 
                        // it will be simply an object with the uuid of the session
                        var cookieData = {
                            uuid: uuid
                        };
                        request.cookieAuth.set(cookieData);
                        
                        console.log("cookie data: ", cookieData)
                        return reply.redirect('/dashboard');
                    }
                );

            },
            auth: {
                strategy: 'facebook',
                //mode: 'required'
            }
        }

    });

    // TODO: add the logout route


    return next();


};

exports.register.attributes = {
    name: Path.parse(__dirname).name,  // use the name of the directory
    dependencies: ["bell", "hapi-auth-cookie"]
};
