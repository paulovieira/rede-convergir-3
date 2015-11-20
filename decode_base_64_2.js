var DataUri = require('strong-data-uri');
var Fs = require("fs");

var base64 = Fs.readFileSync("test_base64", "utf8");
var buffer = DataUri.decode(base64);

Fs.writeFileSync('output3', buffer);
