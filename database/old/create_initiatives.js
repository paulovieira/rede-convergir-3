var Fs = require("fs");
var Wreck = require('wreck');


Fs.readFile("./db_151125.json", function(err, data){
    if(err){
        throw err;
    }

    data = JSON.parse(data);
    console.log("number of initiatives: ", data.length);

    var offset = 0;
    //var batchSize = 1;
    var batchSize = data.length;

    
    var initiative;
    for(var i = offset; i < offset + batchSize; i++){

        initiative = data[i];
        if(!initiative){
            return;
        }

        initiative.logo = {
            filename: initiative.logo,
            min: 100,
            max: 130,
            exclusive: false
        };

        var options = {
            payload: JSON.stringify(initiative)
        };

        Wreck.post('http://127.0.0.1:6001/api/v1/initiatives', options, function (err, res, payload) {

            if(err){
                throw err;
            }

            if(res.statusCode!==201){
                console.log(payload.toString());
            }
            //console.log("res: \n", res);
            //console.log("");
            //console.log("payload: \n", payload.toString());
        });    
    }

});

