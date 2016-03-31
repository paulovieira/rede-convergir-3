var Stacktrace, logStack;

// the stacktrace module is bundled only in dev mode (this works like the "#ifndef" preprocessor directives in C)
if(NODE_ENV==="dev"){

    Stacktrace = require("stacktrace");

    logStack = function(filtered){

        Stacktrace
            .get()
            .then(function(stackframes) {

                //debugger;
                var stringifiedStack = stackframes
                    .map(function(sf) { 

                        return "    " + sf.toString(); 
                    })
                    .filter(function(s){
                        // always remove this functino (logStack) from the trace
                        return s.indexOf("/client/dashboard/app/common/utils")===-1;
                    })
                    .filter(function(s){
                        
                        // we can explicitely disable the remaining filtering using the "filtered" argument
                        if(filtered===false){
                            return true;
                        }
                        
                        return s.indexOf("/client/dashboard/app")!==-1;
                    })
                    .join('\n'); 

                console.log("-------------------------------\ncallstack @ " + Date.now() + "\n" + stringifiedStack + "\n-------------------------------\n\n"); 
            })
            .catch(function(err) { 

                //debugger;
                console.log(err.message); 
            });    
    };
} else{
    logStack = function(){};
}

exports.logStack = logStack;
