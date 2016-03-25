module.exports = function(env){

    env.addFilter('stringify', function(input){
        return JSON.stringify(input);
    });

    env.addGlobal("lang", "pt");
};
