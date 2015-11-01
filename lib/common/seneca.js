var Path = require("path");
var Fs = require("fs");
var Config = require("config");
var Promise = require('bluebird');
var Seneca = require("seneca");





// default options for seneca, taken from seneca's main module

/*
var DEFAULT_OPTIONS = {

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
    'mem-store': true,
    transport: true,
    web: true
  },

  // Settings for network REPL.
  repl: {
    port: 30303,
    host: null
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
    add: false
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
    }
  },

  // Log status at periodic intervals.
  status: {
    interval: 60000,

    // By default, does not run.
    running: false
  },

  // zig module settings for seneca.start() chaining.
  zig: {}
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

var senecaInstance = Seneca(options);

// Promisify the .act() method; 
senecaInstance.actAsync = Promise.promisify(senecaInstance.act, {context: senecaInstance});

var actionsDir = Path.join(Config.get("rootDir"), "actions");

var filenames = Fs.readdirSync(actionsDir)
                .filter(function(filename){

                    // remove hidden files (namely ".tern-port" files, created by ternjs)
                    return filename.indexOf(".")===0 ? false : true;
                });

filenames.forEach(function(name) {
    senecaInstance.use(Path.join(actionsDir, name));
});



module.exports = senecaInstance;
