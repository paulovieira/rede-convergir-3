var Stacktrace, logStack;

// TODO: make sure that in production the stacktrace module is not bundled
if(NODE_ENV==="dev"){

    Stacktrace = require("stacktrace");

    var callback = function(stackframes) {
        //debugger;
        var stringifiedStack = stackframes
            .map(function(sf) { 
                return "    " + sf.toString(); 
            })
            .filter(function(s){
                return true;
                return s.indexOf("/client/dashboard/app")!==-1 && 
                    s.indexOf("/client/dashboard/app/common/utils")===-1;
            })
            .join('\n'); 

        console.log("-------------------------------\ncallstack @ " + Date.now() + "\n" + stringifiedStack + "\n-------------------------------\n\n"); 
    };

    var errback = function(err) { 
        //debugger;
        console.log(err.message); 
    };


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
                        
                        if(filtered===false){
                            return true;    
                        }
                        
                        return s.indexOf("/client/dashboard/app")!==-1 && 
                            s.indexOf("/client/dashboard/app/common/utils")===-1;
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
    logStack = function(){ console.log("noop") };
}

exports.logStack = logStack;
