var Config = require("config");

module.exports = [{
    routes: {  
        prefix: Config.get("apiPrefix.v1")  
    },
    options: {

    }
}];
