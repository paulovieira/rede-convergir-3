var Fs = require("fs");
var Xlsx = require("xlsx");
var Hoek = require('hoek');

var file = 'CATALISE_RC_mapa_V8';
var workbook = Xlsx.readFile(file + '.xls');

var worksheet = workbook.Sheets[workbook.SheetNames[0]];

var keyTransform = {
	"projectName": "projectname",
	"network": "rededeorigem",
	"url": "projecturl",
	"studyCase": "casodeestudo",
	"lat": "lat",
	"lng": "lng"
};

var outputData = Hoek.transform(Xlsx.utils.sheet_to_json(worksheet), keyTransform);

Fs.writeFileSync(file.toLowerCase() + ".json", JSON.stringify(outputData, null, 4));
//debugger;



