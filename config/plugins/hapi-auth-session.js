var Config = require('nconf');
var Boom = require("boom");

var internals = {};

internals.validUser = Config.get("dashboard:user");
internals.validPassword = Config.get("dashboard:password");

internals['10 seconds'] = 10*1000;
internals['1 minute'] = 60*1000;
internals['1 day'] = 24*60*60*1000;
internals['30 days'] = 30*24*60*60*1000;
internals['1 year'] = 365*24*60*60*1000;

module.exports = {

    policy: {
        cache: 'pg-cache',
        segment: 'sessions',
        expiresIn: internals['1 year']
        //expiresIn: internals['10 seconds']
    },

    strategy: {
        name: 'session-cache',
        mode: false,
        cookieOptions: {
            password: Config.get('hapi:ironPassword'),
            isSecure: false,

            // erase the cookie if the session has expired or some other error has happened
            clearInvalid: true,

            // if auth mode is 'try' and if the validation fails (no cookie, for instance), will send a 
            // 302 response using reply.redirect(); the url should be given in the route configuration, in 
            // the option 'plugins.["hapi-auth-cookie"].redirectTo'; 
            // if 'redirectTo' is missing, it has no effect (that is, hapi will reply normally, as if the route 
            // had auth === false);

            // note: if auth mode is 'optional', it works the same way (but it seems to be a bug in hapi-auth-cookie)
            redirectOnTry: true,

            //appendNext: true,

            // use a long ttl for the cookie; it will be actually cleared when the session data from the cache has expired;
            // this happens in the 'validateFunc' (from hapi-auth-session) for 2 reasons: 
            // a) we calling calling the callback to validateFunc with false as the 2nd arg
            // b) the clearInvalid option is true
            ttl: internals['1 year']
            //ttl: internals['10 seconds']
        }
    },

    loginPath: "/login",
    logoutPath: "/logout",
    successRedirectTo: "/dashboard",
    validateLoginData: function(request, next){
debugger;
        var authFailed;
        var user = request.payload.user, password = request.payload.password;

        //    Possible reasons for a failed authentication
        //     - "missing username or password" (won't even connect to the DB)
        //     - "username does not exist" 
        //     - "wrong password" (username exists but password doesn't match)
        
        if (!user || !password) {
            authFailed = "missing";
        }
        else if(user.toLowerCase() !== internals.validUser.toLowerCase()){
            authFailed = "unknown-user";
        }
        else if(password.toLowerCase() !== internals.validPassword.toLowerCase()){
            authFailed = "wrong-password";
        }

        if(authFailed){
            return next(Boom.unauthorized("/login?auth-fail-reason=" + authFailed));
        }

        // if we arrive here, the username and password match;

        // define the session object (to be stored in the internal cache used by the 
        // hapi-auth-session plugin)
        var session = {
            user: user
        };

        return next(undefined, session);
    },

};
