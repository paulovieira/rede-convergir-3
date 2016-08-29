'use strict';

const Config = require('nconf');
const Boom = require('boom');

const internals = {};

internals.validUser = Config.get('dashboard:user');
internals.validPassword = Config.get('dashboard:password');

// the path of the page that has the form for the login data
internals.loginPath = '/login';

internals['10 seconds'] = 10 * 1000;
internals['1 minute'] = 60 * 1000;
internals['1 day'] = 24 * 60 * 60 * 1000;
internals['30 days'] = 30 * 24 * 60 * 60 * 1000;
internals['1 year'] = 365 * 24 * 60 * 60 * 1000;

module.exports = {

    // options for the cache policy
    policy: {
        cache: 'pg-cache',
        segment: 'cookies', // name of the table
        expiresIn: internals['30 days']
        //expiresIn: internals['10 seconds']
    },

    // options for the cookie scheme (implemented by hapi-auth-cookie)
    scheme: {

        password: Config.get('hapi:ironPassword'),

        isSecure: false,

        // erase the cookie if the cached data has expired (or some other error has happened)
        clearInvalid: true,

        // if auth mode is 'try' and if the validation fails (no cookie, for instance), will send a 
        // 302 response using reply.redirect(); the url should be given in the route configuration, 
        // at 'plugins.["hapi-auth-cookie"].redirectTo'; 
        // if 'redirectTo' is missing, it has no effect (that is, hapi will reply normally, as if the // route had auth === false);

        // note: if strategy mode is 'optional', it works the same way (but it seems to be a bug in hapi-auth-cookie)
        redirectOnTry: true,

        // important: do not set redirectTo here, use instead the route level configuration at
        // config.plugins.["hapi-auth-cookie"].redirectTo
        //redirectTo: '',

        //appendNext: true,

        // use a long ttl for the cookie; the cookie will actually be cleared when the 
        // client data in the cache has expired, so the option that actually matter is policy.expiresIn;
        // note that in this case (when the cached data has expired) the clearing of the cookie
        // happens in hapi-auth-cookie, at the callback given to 'validateFunc'; the cookie will
        // be cleared for for 2 reasons: 
        //  a) we are calling calling the callback with false in the 2nd arg ('isValid')
        //  b) the clearInvalid option is true
        ttl: internals['1 year'],

    },
    /*
    // options for the auth strategy
    xxstrategy: {
        name: 'session-cache',

        // options for the auth scheme (hapi-auth-cookie)
        cookieOptions: {

            password: Config.get('hapi:ironPassword'),

            isSecure: false,

            // erase the cookie if the cached data has expired (or some other error has happened)
            clearInvalid: true,

            // if auth mode is 'try' and if the validation fails (no cookie, for instance), will send a 
            // 302 response using reply.redirect(); the url should be given in the route configuration, 
            // at 'plugins.["hapi-auth-cookie"].redirectTo'; 
            // if 'redirectTo' is missing, it has no effect (that is, hapi will reply normally, as if the // route had auth === false);

            // note: if strategy mode is 'optional', it works the same way (but it seems to be a bug in hapi-auth-cookie)
            redirectOnTry: true,

            // important: do not set redirectTo, otherwise we end up with a 302 infinite loop; 
            // use instead the route level configuration plugins.["hapi-auth-cookie"].redirectTo
            //redirectTo: '/login',

            //appendNext: true,

            // use a long ttl for the cookie; the cookie will actually be cleared when the 
            // client data in the cache has expired, so the option that actually matter is policy.expiresIn;
            // note that in this case (when the cached data has expired) the clearing of the cookie
            // happens in hapi-auth-cookie, at the callback given to 'validateFunc'; the cookie will
            // be cleared for for 2 reasons: 
            //  a) we are calling calling the callback with false in the 2nd arg ('isValid')
            //  b) the clearInvalid option is true
            ttl: internals['1 year']
        }
    },
*/
    // url to send the login data (usually username+password); a POST route
    // will be created with this url; the page containing a form to fill 
    // the login data must be implemented somewhere outside of this plugin;
    // the logic to validate the data must be implemented in 'validateLoginData'
    loginDataPath: '/login-data',

    // url to redirect to if the authentication is successful (response from the POST request
    // to loginDataPath containing the login data); note that if the authentication is not
    // successful, the response will be ... ???
    loginRedirectTo: '/dashboard',

    // url to logout the user (will trigger the actions on the server the correspond to a 
    // logout - clear cookie, clear the session in the cache); 
    // the response will redirect to the url given in logoutRedirectTo
    logoutPath: '/logout',
    logoutRedirectTo: '/',


    validateLoginData: function (request, next){

        debugger;
        console.log("validateLoginData-1")
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
            console.log("validateLoginData-2")
            // if we call next with the 2nd argument defined, the plugin will call 
            // reply.redirect(err.redirectTo) instead of reply(err)
            const err = Boom.unauthorized(reason);
            const redirectTo = internals.loginPath + '?auth-fail-reason=' + reason;
            return next(err, redirectTo);
        }

        // if we arrive here, the username and password match;
        // define the object to be stored in the internal cache (catbox policy created by this plugin)
        const clientData = {
            user: user
        };

        console.log("validateLoginData-3");
        return next(null, null, clientData);
    }

};
