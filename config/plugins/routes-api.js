var Config = require('nconf');

module.exports = [{
    routes: {  
        prefix: Config.get("apiPrefix:v1")  
    },
    options: {

    }
}];
