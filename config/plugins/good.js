'use strict';

const Path = require('path');
const Config = require('nconf');
const GoodConsole = require('good-console');
const GoodSqueeze = require('good-squeeze');

const internals = {};

// rotates the file when its size exceeds the given size (format: xK or xM)
//internals.maxSize = '5K';
internals.maxSize = '1M';
internals.logDir = Path.join(Config.get('rootDir'), 'logs');
internals.opsInterval = Config.get('env') === 'dev' ? 1 : 180;  // in seconds

/*
ops - System and process performance - CPU, memory, disk, and other metrics.
response - Information about incoming requests and the response. This maps to either the "response" or "tail" event emitted from hapi servers.
log - logging information not bound to a specific request such as system errors, background processing, configuration errors, etc. Maps to the "log" event emitted from hapi servers.
error - request responses that have a status code of 500. This maps to the "request-error" hapi event.
request - Request logging information. This maps to the hapi 'request' event that is emitted via request.log().
*/

module.exports = {
    ops: {
        interval: internals.opsInterval * 1000
    }
};


internals.reporters = {};
 
// add good reporters, unless they are explicitely turned off

if (Config.get('env') === 'dev'){

    // general log to the console
    internals.reporters['console'] = [
        new GoodSqueeze.Squeeze({ log: '*', response: '*', request: '*', error: '*' }),
        new GoodConsole(),
        process.stdout
    ];

    // general log file (pretty much all goes here!)
    internals.reporters['general-file'] = [
        new GoodSqueeze.Squeeze({ log: '*', response: '*', request: '*' }),
        new GoodSqueeze.SafeJson(),
        {
            module: 'rotating-file-stream',
            args: ['general.log', { size: internals.maxSize, path: internals.logDir }]  
        }
    ];

    // filter for errors (both internal and from the application)
    // some events already logged in the 'general' file are repeated here
    internals.reporters['errors-file'] = [
        new GoodSqueeze.Squeeze({ log: 'error', error: '*' }),
        new GoodSqueeze.SafeJson(),
        {
            module: 'rotating-file-stream',
            args: ['errors.log', { size: internals.maxSize, path: internals.logDir }]
        }
    ];

    // log machine load 
    internals.reporters['ops-file'] = [
        new GoodSqueeze.Squeeze({ ops: '*' }),
        new GoodSqueeze.SafeJson(),
        {
            module: 'rotating-file-stream',
            args: [ 'ops.log', { size: internals.maxSize, path: internals.logDir } ]  
        }
    ];

}

// equal to the dev environment, except for the console reporter; however
// it can be added explicitely with the 'reporter-console' command line option
else if (Config.get('env') === 'production'){

    if ( String(Config.get('reporter-console')) === 'true'){
        // general log to the console
        internals.reporters['console'] = [
            new GoodSqueeze.Squeeze({ log: '*', response: '*', request: '*', error: '*' }),
            new GoodConsole(),
            process.stdout
        ];
    }

    // general log file (pretty much all goes here!)
    internals.reporters['general-file'] = [
        new GoodSqueeze.Squeeze({ log: '*', response: '*', request: '*' }),
        new GoodSqueeze.SafeJson(),
        {
            module: 'rotating-file-stream',
            args: ['general.log', { size: internals.maxSize, path: internals.logDir }]  
        }
    ];

    // filter for errors (both internal and from the application)
    // some events already logged in the 'general' file are repeated here
    internals.reporters['errors-file'] = [
        new GoodSqueeze.Squeeze({ log: 'error', error: '*' }),
        new GoodSqueeze.SafeJson(),
        {
            module: 'rotating-file-stream',
            args: ['errors.log', { size: internals.maxSize, path: internals.logDir }]
        }
    ];

    // log machine load 
    internals.reporters['ops-file'] = [
        new GoodSqueeze.Squeeze({ ops: '*' }),
        new GoodSqueeze.SafeJson(),
        {
            module: 'rotating-file-stream',
            args: [ 'ops.log', { size: internals.maxSize, path: internals.logDir } ]  
        }
    ];

}


module.exports.reporters = internals.reporters;
