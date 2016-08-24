'use strict';

const Config = require('nconf');
const Boom = require('boom');

const internals = {};

internals.validUser = Config.get('dashboard:user');
internals.validPassword = Config.get('dashboard:password');

// the path of the page that has the form for the login data
internals.loginPath = '/login';

internals['10 seconds'] = 10*1000;
internals['1 minute'] = 60*1000;
internals['1 day'] = 24*60*60*1000;
internals['30 days'] = 30*24*60*60*1000;
internals['1 year'] = 365*24*60*60*1000;

module.exports = {

    // options for the cache policy
    policy: {
        cache: 'pg-cache',
        segment: 'sessions',
        expiresIn: internals['30 days']
        //expiresIn: internals['10 seconds']
    },

    // options for the auth strategy
    strategy: {
        name: 'session-cache',

        // options for the auth scheme (hapi-auth-cookie)
        cookieOptions: {
            password: Config.get('hapi:ironPassword'),
            isSecure: false,

            // erase the cookie if the session has expired or some other error has happened
            clearInvalid: true,

            // if auth mode is 'try' and if the validation fails (no cookie, for instance), will send a 
            // 302 response using reply.redirect(); the url should be given in the route configuration, 
            // at 'plugins.["hapi-auth-cookie"].redirectTo'; 
            // if 'redirectTo' is missing, it has no effect (that is, hapi will reply normally, as if the // route had auth === false);

            // note: if strategy mode is 'optional', it works the same way (but it seems to be a bug in hapi-auth-cookie)
            redirectOnTry: true,

            // note: do not set redirectTo, otherwise we end up with a 302 infinite loop; 
            // use instead the route level configuration plugins.["hapi-auth-cookie"].redirectTo
            //redirectTo: '/login',
            //appendNext: true,

            // use a long ttl for the cookie; it will be actually cleared when the session data from
            // the cache has expired, so the option that really matter is policy.expiresIn

            // the clearing of the cookie happens in the 'validateFunc' (from hapi-auth-session) 
            // for 2 reasons: 
            //  a) we are calling calling the callback to validateFunc with false as the 2nd arg
            //    (because the data in the cache has expired)
            //  b) the clearInvalid option is true
            ttl: internals['1 year']
            //ttl: internals['10 seconds']
        }
    },


    // url to send the login data (usually username+password); a POST route
    // will be created with this url; the page containing a form to fill 
    // the login data must be implemented somewhere outside of this plugin;
    // the logic to validate the data must be implemented in 'validateLoginData'
    loginDataPath: "/login-data",

    // url to redirect to if the authentication is successful (response from the POST request
    // to loginDataPath containing the login data); note that if the authentication is not
    // successful, the response will be ... ???
    loginRedirectTo: "/dashboard",

    // url to logout the user (will trigger the actions on the server the correspond to a 
    // logout - clear cookie, clear the session in the cache); 
    // the response will redirect to the url given in logoutRedirectTo
    logoutPath: "/logout",
    logoutRedirectTo: "/",


    validateLoginData: function(request, next){
debugger;
        let reason = '';
        const user     = request.payload.user;
        const password = request.payload.password;

        //    Possible reasons for a failed authentication
        //     - "missing username or password" (won't even connect to the DB)
        //     - "username does not exist"
        //     - "wrong password" (username exists but password doesn't match)

        if (!user || !password) {
            reason = 'missing';
        }
        else if (user.toLowerCase() !== internals.validUser.toLowerCase()){
            reason = 'unknown-user';
        }
        else if (password.toLowerCase() !== internals.validPassword.toLowerCase()){
            reason = 'wrong-password';
        }

        if (reason){
            // we will use error.message as the url to redirect to
            const err = Boom.unauthorized(reason);
            err.redirectTo = internals.loginPath + '?auth-fail-reason=' + reason;

            return next(Boom.unauthorized(internals.loginPath + '?auth-fail-reason=' + reason));
        }

        // if we arrive here, the username and password match;

        // define the session object (to be stored in the internal cache used by the
        // hapi-auth-session plugin)
        const session = {
            user: user
        };

        return next(undefined, session);
    }

};
