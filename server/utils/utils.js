var Path = require("path");
var Config = require("config");
var Mandrill = require("mandrill-api/mandrill").Mandrill;
var _ = require("underscore");
var _s = require('underscore.string');
var Purdy = require("purdy");
var Shell = require("shelljs");

var internals = {};

internals.mandrillClient = new Mandrill(Config.get("email.mandrill.apiKey"), process.env.NODE_ENV==="dev");

internals.emailTemplates = {
    awaitingApproval: require("./email-templates/awaiting-approval"),
    approved:         require("./email-templates/approved")
};

internals.sgrColors = {
    "reset": "\x1b[0m",
    "black": "\x1b[30m",
    "red": "\x1b[31m",
    "green": "\x1b[32m",
    "yellow": "\x1b[33m",
    "blue": "\x1b[34m",
    "magenta": "\x1b[35m",
    "cyan": "\x1b[36m",
    "white": "\x1b[37m",

    bold: {
        "black": "\x1b[30;1m",
        "red": "\x1b[31;1m",
        "green": "\x1b[32;1m",
        "yellow": "\x1b[33;1m",
        "blue": "\x1b[34;1m",
        "magenta": "\x1b[35;1m",
        "cyan": "\x1b[36;1m",
        "white": "\x1b[37;1m",
    }
};

internals.purdyOptions = {
    path: true
};


exports.sendEmail = function sendEmail(templateName, context, callback){
    
    if(!internals.emailTemplates[templateName] || !internals.emailTemplates[templateName][context.lang]){
        //return callback(Boom.badImplementation("email template is missing for lang: " + context.lang));
        console.log("Email template not found: ", templateName);
        return;
    }
    var template = internals.emailTemplates[templateName][context.lang];
    var message = template(context);
    message.html = _s.trim(message.html);

    //console.log("email message (REMOVE COMMENTED CODE)\n", message);

    // note that we don't care about the response from mandrill, so we don't call the 
    // given callback (in fact the callback is not even given)
    internals.mandrillClient.messages.send(
        {
            message: message,
            async: false,
            ip_pool: null,
            send_at: null
        }, 
        function(result) {
            console.log("Mandrill plugin: email sent: \n", result);
            //callback(null, result);
        }, 
        function(err) {
            console.log("Mandrill plugin: email not sent: " + err.name + " - " + err.message);
            //callback(err);
        }
    );
    /**/
};

exports.logCallsite = function logCallsite(callsiteObj) {

    var colors = internals.sgrColors;

    // callsiteObj is an array of strings, prepared by Hoek (not the origin callsite obj, which has methods like .getLineNumber())
    var funcName = callsiteObj[3];
    var lineNumber = callsiteObj[1];
    var dirName = Path.dirname(callsiteObj[0]);
    var baseName = Path.basename(callsiteObj[0]);

    var output = colors.bold.cyan + (funcName || "anonymous") + "()" + colors.reset +
        " (" + dirName + "/" + colors.bold.cyan + baseName + colors.reset +
        ":" + colors.bold.green + lineNumber + colors.reset + ")";

    //server.log(["stack"], output);

    return output;
};

exports.log = function log(){

    if(_.isObject(arguments[0])){
        Purdy(arguments[0], internals.purdyOptions);
    }

    if(_.isString(arguments[0]) && arguments.length > 1){
        Purdy(arguments[0] + ":");
        Purdy(arguments[1], internals.purdyOptions);
    }
};

exports.shellExec = function(commands){

    var output;

    commands.forEach(function(command){

        console.log("[shelljs] Executing command: " + command);
        output = Shell.exec(command, {silent: true});

        if(output.code!==0){
            console.log("");
            var message = "The following command did not finish:\n" + command;
            throw new Error(message);
        }
    });
};

exports.changeCase = function changeCase(obj, methodName){

    var method = _s[methodName];
    if (!method) {
        throw new Error("The method '" + methodName + "'' doesn't exist in underscore.string");
    }

    // piggy-back on the .clone method from Hoek@2.16.3
    function clone(obj, seen) {

        if (typeof obj !== 'object' ||
            obj === null) {

            return obj;
        }

        seen = seen || { orig: [], copy: [] };

        var lookup = seen.orig.indexOf(obj);
        if (lookup !== -1) {
            return seen.copy[lookup];
        }

        var newObj;
        var cloneDeep = false;

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
                var proto = Object.getPrototypeOf(obj);
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

        seen.orig.push(obj);
        seen.copy.push(newObj);

        if (cloneDeep) {
            var keys = Object.getOwnPropertyNames(obj);
            for (var i = 0, il = keys.length; i < il; ++i) {
                var key = keys[i];
                var descriptor = Object.getOwnPropertyDescriptor(obj, key);
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
    var msg = "\n\n-----------------------  pg error  -----------------------\n";
    msg = msg + (err.toString      ? "\ndescription: " + err.toString()         : "");
    msg = msg + (err.detail        ? "\ndetail: " + err.detail                  : "");
    msg = msg + (err.code          ? "\ncode: " + err.code                      : "");
    msg = msg + (err.table         ? "\ntable: " + err.schema + "." + err.table : "");
    msg = msg + (err.column        ? "\ncolumn: " + err.column                  : "");
    msg = msg + (err.hint          ? "\nhint: " + err.hint                      : "");
    msg = msg + (err.where         ? "\nwhere: " + err.where                    : "");
    msg = msg + (err.internalQuery ? "\ninternalQuery: " + err.internalQuery    : "");
    msg += "\n--------------------------------------------------------\n\n";

    return msg;
};

exports.register = function(server, options, next){

    server.method({
        name: "utils.sendEmail", 
        method: exports.sendEmail
    });

    server.method({
        name: "utils.logCallsite",
        method: function(callsiteObj){

            var output = exports.logCallsite(callsiteObj);
            server.log(["stack"], output);
            return output;
        }
    });

    server.method({
        name: "utils.log", 
        method: exports.log
    });

    server.method({
        name: "utils.changeCase", 
        method: exports.changeCase
    });

    return next();
};

exports.register.attributes = {
    name: Path.parse(__dirname).name,
    dependencies: []
};



// for reference purpose only (these should be the important properties that we need); for more details see:
// 1) Mandrill API Docs -> Messages -> Send
//    https://mandrillapp.com/api/docs/messages.html
// 2) How to Use SMTP Headers to Customize Your Messages (more details about the API options)
//    https://mandrill.zendesk.com/hc/en-us/articles/205582117-How-to-Use-SMTP-Headers-to-Customize-Your-Messages

internals.mandrillParams = {
    // parameters to pass to the request
    message: {
        // the full HTML content to be sent
        html: "",

        // the message subject
        subject: "",
        
        // the sender email address
        from_email: "",
        
        // from name to be used (optional)
        from_name: "",
        
        // an array of objects with the recipient information; the properties should be:
        //   email: "the email address of the recipient",
        //   name: "the optional display name to use for the recipient",
        //   type: "the header type to use for the recipient ("to", "cc", "bcc"); defaults to "to"
        to: [{email: "", name: "", type: "" }, {email: "", name: "", type: "" }],
        
        // optional extra headers to add to the message (most headers are allowed)
        headers: {  
            "Reply-To": ""
        },
        
        // whether or not to automatically generate a text part for messages that are not given text (boolean)
        // see: http://stackoverflow.com/questions/20509234/mandrill-what-does-auto-text-do
        auto_text: true,
        
        // whether this message is important, and should be delivered ahead of non-important messages (boolean)
        important: false
    },
    async: false,
    ip_pool: null,
    send_at: null
};


