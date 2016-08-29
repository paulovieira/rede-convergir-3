var Path = require("path");
var Hoek = require("hoek");
var Hoek = require("bell");
var Config = require("nconf");
var UUID = require("node-uuid");
var Utils = require("../../util/utils");

var internals = {};

exports.register = function(server, options, next){

    server.auth.strategy('oauth-facebook', 'bell', {
        provider: 'facebook',
        isSecure: false,
        password: Config.get('hapi:ironPassword'),
        clientId: Config.get('facebookApp:id'),
        clientSecret: Config.get('facebookApp:secret')
    });

    // details for google here 
    // - https://auth0.com/docs/connections/social/google;
    // - https://github.com/hapijs/bell/blob/master/Providers.md#google
    
    // in the "authorized redirect uris" field we must have:
    // http://redeconvergir.dev/login/google

    server.auth.strategy('oauth-google', 'bell', {
        provider: 'google',
        isSecure: false,
        password: Config.get('hapi:ironPassword'),
        clientId: Config.get('googleApp:id'),
        clientSecret: Config.get('googleApp:secret')
    });





    // there will be 2 GET requests made to /login/facebook 
    // the 1st request results from the user clicking on the anchor tag that exists in the the 
    // main /login page;
    // however the request will not actually arrive to the handler - the bell plugin will somehow 
    // intercept it, contact the facebook api, verify if the user has logged into facebook already 
    // (in other tab) and only then a 2nd request GET /login/facebook will be made; in this 2nd
    // request the handler will be executed and the authentication data should be available at 
    // request.auth

    // in the first time this process happens, the user must give an explicit authorization to
    // facebook, so there will be an intermediary page (from facebook) where the user must accept; // after that authorization the 2nd GET /login/facebook is done

    // after the first time, the 2nd GET /login/facebook is done directly, without any
    // interruption from facebook pages (it's as if our app would be part of facebook);
    // in other words, if the user has made a login to facebook, then it also "has made" a login
    // to our app

    // the comments above assume the user already logged into facebook in some other tab;
    // if not, the user is redirected to the main facebook login page; after the login, they will
    // be redirected to /dashboard

    // after 2nd GET /login/facebook, if the authentication was successful, we create a new
    // session object, store it in the cache and set a cookie in the browser with the data
    // { "uuid": ...}; that is, we do exactly the same as if the authentication had been
    // done directly via regular form data; 

    // conclusion: for the rest of the application it doesn't matter how the user has authenticated;
    // as long as there is a cookie with { "uuid": ...}, and that cookie passes the validation login
    // defined in the validateFunc function (from hapi-auth-session), then it *must* be an
    // authenticated user; we know that because if it passes the validateFunc login, it means
    // there is a session object in the cache with that uuid; and if there's such an object in the
    // cache, it means the user has completed the authentication process before (either via facebook
    // or by providing the username/password pair directly in the form available in the /login page);

    // these two ways of doing the authentication are equivalent, in the sense that the end result is
    // that there will be a session object in the cache and the server will send a cookie to the user
    // with the uuid of that session object;

    // other way to think about this: the "source of truth" for authentication matters is always 
    // the session object in that cache - 
    // if we have such an object in the cache, it means the some user has authenticated; we don't care 
    // how that object ended up in the cache; we should simply trust that if that object is there,
    // then it means someone has authenticated;
    // if, in addition to that, some client sends a cookie with a uuid that matches a session object 
    // existing in the cache, then the person behind that client must be the authenticated user;

    // so, if a client wants to prove that it is authenticated when making a request, it must do 3 things:
    // a) it must send a cookie with the key 'sid'
    // b) the cookie data must be an object of the form { uuid: ...}
    // c) there must exist a session object in the cache having that same uuid

    // if some of these 3 conditions fails, then the authentication fails:
    // a) if there is no cookie, it is not authenticated (obviously)
    // b) if the cookie data doesn't have a uuid property, it is not authenticated
    // c) if the uuid property exists in the cookie data but not in the cache, it is not authenticated
    // (this happens when the session expires)




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
                var sessionCache = server.plugins['hapi-auth-cookie-cache']['cookieCache'];

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
                strategy: 'oauth-facebook',
                //mode: 'required'
            }
        }

    });


    server.route({
        method: ['GET', 'POST'],
        path: '/login/google',
        config: {
            handler: function(request, reply){
                console.log("now: ", Date.now());
                // todo: what if we have already authenticated, with via google or via normal login?

                if(!request.auth.isAuthenticated){
                    return reply.redirect('/login');
                }
                Utils.logObj("request.auth", request.auth);

                var uuid = UUID.v4();

                // todo: place the raw data in some property, and define a session object with 
                // the same structure, independently of how the authentication was done
                var session = request.auth.credentials;
                var sessionCache = server.plugins['hapi-auth-cookie-cache']['cookieCache'];

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
                strategy: 'oauth-google',
                //mode: 'required'
            }
        }

    });


    return next();

};

exports.register.attributes = {
    name: Path.parse(__dirname).name,  // use the name of the directory
    dependencies: ["bell", "hapi-auth-cookie-cache"]
};
