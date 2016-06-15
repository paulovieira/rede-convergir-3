"use strict";

var Sendgrid = require('sendgrid-promise');

var internals = {};

internals.emailTemplates = {
    awaitingApproval: require("./email-templates/awaiting-approval"),
    approved:         require("./email-templates/approved")
};

module.exports = function sendEmail(templateName, context){

console.log("templateName: ", templateName)
console.log("context: ", context)

    var templateExists = internals.emailTemplates[templateName] && internals.emailTemplates[templateName][context.lang];
    if(!templateExists){
        console.log("Email template not found: ", templateName);
        return;
    }

    var template = internals.emailTemplates[templateName][context.lang];
    var emailObj = template(context);

    emailObj.text = emailObj.text.trim();
    emailObj.html = emailObj.html.trim();

    //console.log("emailObj\n", emailObj);

    // TBD: handle the response from sendgrid (log if there was an error, etc)

    Sendgrid.sendAsync(emailObj)
        .then(function(response){

            console.log("Sendgrid: email was sent successfully\n", response);
        })
        .catch(function(err){

            throw err;
        });

};
