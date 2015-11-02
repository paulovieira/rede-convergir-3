var Wreck = require('wreck');

var fetch = function(){
    console.log("fetch");

        //Wreck.get('http://rcdemo3.paulovieira.net/api/v1/initiatives', {}, function (err, res, payload) {
        //Wreck.get('http://127.0.0.1:6001/api/v1/initiatives', {}, function (err, res, payload) {
        Wreck.get('http://127.0.0.1:6001/api/v1/initiatives-test', {}, function (err, res, payload) {

            if(err){
                throw err;
            }

            if(res.statusCode!==200){
                throw new Error("error");
            }
            //console.log("res: \n", res);
            //console.log("");
            payload = JSON.parse(payload);
            console.log("number of resources: ", payload.length);
        });    

}
setInterval(fetch, 50);
