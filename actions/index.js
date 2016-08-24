'use strict';

var Path = require("path");
var Fs = require("fs");
var Promise = require('bluebird');
var Seneca = require("seneca");


    // default options for seneca, taken from seneca's main module

    /*

{
  // Tag this Seneca instance, will be appended to instance identifier.
  tag: '-',

  // Standard length of identifiers for actions.
  idlen: 12,

  // Standard timeout for actions.
  timeout: 11111,

  // Register (true) default plugins. Set false to not register when
  // using custom versions.
  default_plugins: {
    basic: true,
    cluster: true,
    'mem-store': true,
    repl: true,
    transport: true,
    web: true
  },

  // Debug settings.
  debug: {
    // Throw (some) errors from seneca.act.
    fragile: false,

    // Fatal errors ... aren't fatal. Not for production!
    undead: false,

    // Print debug info to console
    print: {
      // Print options. Best used via --seneca.print.options.
      options: false
    },

    // Trace action caller and place in args.caller$.
    act_caller: false,

    // Shorten all identifiers to 2 characters.
    short_logs: false,

    // Record and log callpoints (calling code locations).
    callpoint: false
  },

  // Enforce strict behaviours. Relax when backwards compatibility needed.
  strict: {
    // Action result must be a plain object.
    result: true,

    // Delegate fixedargs override action args.
    fixedargs: true,

    // Adding a pattern overrides existing pattern only if matches exactly.
    add: false,

    // If no action is found and find is false, then no error returned along with empty object
    find: true,

    // Maximum number of times an action can call itself
    maxloop: 11
  },

  // Action cache. Makes inbound messages idempotent.
  actcache: {
    active: true,
    size: 11111
  },

  // Action executor tracing. See gate-executor module.
  trace: {
    act: false,
    stack: false,
    unknown: 'warn'
  },

  // Action statistics settings. See rolling-stats module.
  stats: {
    size: 1024,
    interval: 60000,
    running: false
  },

  // Wait time for plugins to close gracefully.
  deathdelay: 11111,

  // Default seneca-admin settings.
  // TODO: move to seneca-admin!
  admin: {
    local: false,
    prefix: '/admin'
  },

  // Plugin settings
  plugin: {},

  // Internal settings.
  internal: {
    // Close instance on these signals, if true.
    close_signals: {
      SIGHUP: true,
      SIGTERM: true,
      SIGINT: true,
      SIGBREAK: true
    },

    // seneca.add uses catchall (pattern='') prior
    catchall: false
  },

  // Log status at periodic intervals.
  status: {
    interval: 60000,

    // By default, does not run.
    running: false
  },

  // zig module settings for seneca.start() chaining.
  zig: {},

  pin: {
    // run pin function without waiting for pin event
    immediate: false
  },

  // backwards compatibility settings
  legacy: {

    // use old error codes, until version 3.x
    error_codes: true,

    // use parambulator for message validation, until version 3.x
    validate: true
  }
}
    */  

var options = {
    timeout: 999999,
    debug: {
        print: {
            options: false
            //callpoint: true 
        }
    }
};

// create an instance and promisify the .act() method
var senecaInstance = Seneca(options);
senecaInstance.actAsync = Promise.promisify(senecaInstance.act, {context: senecaInstance});

// load actions; use filter to exclude this own file and hidden files (created by ternjs)
Fs.readdirSync(__dirname)
    .filter( filename => filename === 'index.js' ? false : true )
    .filter( filename => filename.indexOf(".") === 0 ? false : true )
    .forEach( filename => senecaInstance.use(Path.join(__dirname, filename)) );

// store the instance in the main seneca object (to be used in other modules);
// when obtaining a reference to the instance in other modules (via require('...').instance)
// it is necessary that this module has already been executed
Seneca.instance = senecaInstance;
