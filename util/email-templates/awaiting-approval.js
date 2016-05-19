var Path = require('path')
var Fs = require('fs');
var Config = require('nconf');
var _ = require('underscore')

// mustache.js-style templating:
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};

var internals = {};

internals.subjectString = Fs.readFileSync(Path.join(__dirname, 'awaiting-approval-pt-subject.txt'), 'utf8');
internals.textString = Fs.readFileSync(Path.join(__dirname, 'awaiting-approval-pt-text.txt'), 'utf8');
internals.htmlString = Fs.readFileSync(Path.join(__dirname, 'awaiting-approval-pt-html.txt'), 'utf8');

internals.subject = _.template(internals.subjectString.trim());
internals.text = _.template(internals.textString.trim());
internals.html = _.template(internals.htmlString.trim());

internals.template = {};

internals.template['pt'] = function(ctx){

    ctx = ctx || {};
    ctx.publicUri = Config.get('publicUri');

    var emailObj = {

        subject: internals.subject(ctx),
        text: internals.text(ctx),
        html: internals.html(ctx),

        from: Config.get('email:infoAddress'),
        fromname: Config.get('email:infoName'),

        // in development mode, moderatorAddress should be a personal address (just for testing purposes)
        to: [ctx.email],
        toname: [ctx.name],

        cc: [Config.get('email:moderatorAddress')],
        ccname: [Config.get('email:moderatorName')],

        'replyto': Config.get('email:moderatorAddress')
    };

    return emailObj;
};

module.exports = internals.template;
