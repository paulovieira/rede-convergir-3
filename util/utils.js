'use strict';

var Path = require('path');
//var Config = require('nconf');
var _ = require('underscore');
var _s = require('underscore.string');
var Purdy = require('purdy');
var Shell = require('shelljs');

var internals = {};
internals.server = {};

internals.sgrColors = {

    'reset': '\x1b[0m',

    'black': '\x1b[30m',
    'red': '\x1b[31m',
    'green': '\x1b[32m',
    'yellow': '\x1b[33m',
    'blue': '\x1b[34m',
    'magenta': '\x1b[35m',
    'cyan': '\x1b[36m',
    'white': '\x1b[37m',

    bold: {
        'black': '\x1b[30;1m',
        'red': '\x1b[31;1m',
        'green': '\x1b[32;1m',
        'yellow': '\x1b[33;1m',
        'blue': '\x1b[34;1m',
        'magenta': '\x1b[35;1m',
        'cyan': '\x1b[36;1m',
        'white': '\x1b[37;1m',
    }
};

internals.purdyOptions = {
    path: true,  // prints result with a path (To be used with Hoek.reach())
    depth: 4  // how many times to recurse while formatting the object
};

exports.registerServer = function(server){

    internals.server = server;
};

exports.sendEmail = require('./send-email');

exports.logCallsite = function logCallsite(callsiteObj) {

    var colors = internals.sgrColors;

    // callsiteObj is an array of strings, prepared by Hoek (not the origin callsite obj, which has methods like .getLineNumber())
    var funcName = callsiteObj[3];
    var lineNumber = callsiteObj[1];
    var dirName = Path.dirname(callsiteObj[0]);
    var baseName = Path.basename(callsiteObj[0]);

    var output = colors.bold.cyan + (funcName || 'anonymous') + '()' + colors.reset +
        ' (' + dirName + '/' + colors.bold.cyan + baseName + colors.reset +
        ':' + colors.bold.green + lineNumber + colors.reset + ')';

    internals.server.log(['stack'], output);
};

exports.logObj = function logObj(){

    var colors = internals.sgrColors;

    if(_.isObject(arguments[0])){
        Purdy(arguments[0], internals.purdyOptions);
    }
    else if(_.isString(arguments[0]) && arguments.length > 1){
        console.log(colors.bold.cyan + '---' + colors.reset);
        console.log(colors.bold.cyan + arguments[0] + colors.reset);
        Purdy(arguments[1], internals.purdyOptions);
        console.log(colors.bold.cyan + '---' + colors.reset + '\n');
    }
};

// todo: use execFile
exports.shellExec = function(commands){

    var output;

    commands.forEach(function(command){

        console.log('[shelljs] Executing command: ' + command);
        output = Shell.exec(command, {silent: true});

        if(output.code!==0){
            console.log('');
            var message = 'The following command did not finish:\n' + command;
            throw new Error(message);
        }
    });
};


// piggy-back on the .clone method from Hoek@4; we just change the
// keys of new (cloned) object by calling a function from underscore.string
// (which should be "underscored")

exports.changeCase = function changeCase(obj, methodName){

    var method = _s[methodName];
    if (!method) {
        throw new Error('The method "' + methodName + '" doesn\'t exist in underscore.string');
    }

    // the .clone method from Hoek@4
    function clone(obj, seen) {

        if (typeof obj !== 'object' ||
            obj === null) {

            return obj;
        }

        seen = seen || new Map();

        const lookup = seen.get(obj);
        if (lookup) {
            return lookup;
        }

        let newObj;
        let cloneDeep = false;

        if (!Array.isArray(obj)) {
            if (Buffer.isBuffer(obj)) {
                newObj = new Buffer(obj);
            }
            else if (obj instanceof Date) {
                newObj = new Date(obj.getTime());
            }
            else if (obj instanceof RegExp) {
                newObj = new RegExp(obj);
            }
            else {
                const proto = Object.getPrototypeOf(obj);
                if (proto &&
                    proto.isImmutable) {

                    newObj = obj;
                }
                else {
                    newObj = Object.create(proto);
                    cloneDeep = true;
                }
            }
        }
        else {
            newObj = [];
            cloneDeep = true;
        }

        seen.set(obj, newObj);

        if (cloneDeep) {
            const keys = Object.getOwnPropertyNames(obj);
            for (let i = 0; i < keys.length; ++i) {
                const key = keys[i];
                const descriptor = Object.getOwnPropertyDescriptor(obj, key);
                if (descriptor &&
                    (descriptor.get ||
                     descriptor.set)) {

                    Object.defineProperty(newObj, method(key), descriptor);
                }
                else {
                    newObj[method(key)] = clone(obj[key], seen);
                }
            }
        }

        return newObj;
    }

    return clone(obj);
};


exports.getErrMsg = function getErrMsg(err){

    if(err.msg){
        return err.msg;
    }

    // if this is an error generated by pg, the following properties should be
    // present in the err object and contain useful information
    var msg = '\n\n-----------------------  pg error  -----------------------\n';
    msg = msg + (err.toString      ? '\ndescription: ' + err.toString()         : '');
    msg = msg + (err.detail        ? '\ndetail: ' + err.detail                  : '');
    msg = msg + (err.code          ? '\ncode: ' + err.code                      : '');
    msg = msg + (err.table         ? '\ntable: ' + err.schema + '.' + err.table : '');
    msg = msg + (err.column        ? '\ncolumn: ' + err.column                  : '');
    msg = msg + (err.hint          ? '\nhint: ' + err.hint                      : '');
    msg = msg + (err.where         ? '\nwhere: ' + err.where                    : '');
    msg = msg + (err.internalQuery ? '\ninternalQuery: ' + err.internalQuery    : '');
    msg += '\n--------------------------------------------------------\n\n';

    return msg;
};

