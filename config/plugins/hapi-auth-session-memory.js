var Config = require('nconf');
var Boom = require("boom");

var internals = {};

internals.validUser = Config.get("dashboard:user");
internals.validPassword = Config.get("dashboard:password");

module.exports = [{

                options: {
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

                        // if we arrive here, the username and password match
                        var loginData = {
                            user: user
                        };

                        return next(undefined, loginData);
                    },

                    // strategy options - see hapi-auth-cookie and the options to server.auth.strategy
                    // in the main docs; if some option is not given, the defaults will be used
                    ironPassword: Config.get("hapi:ironPassword"),
                    isSecure: false,
                    clearInvalid: true,
                    appendNext: true,
                    redirectOnTry: true,
                    //ttl: internals["3 hours"],
                }
            }];
