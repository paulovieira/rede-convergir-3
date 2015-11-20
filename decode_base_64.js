var Fs = require("fs");

var base64 = Fs.readFileSync("datauri", "utf8");
 var regex = /^data:.+\/(.+);base64,(.*)$/;

 var matches = base64.match(regex);
 var ext = matches[1];
// var data = matches[2];
// var buffer = new Buffer(data, 'base64');
// Fs.writeFileSync('output.' + ext, buffer);
