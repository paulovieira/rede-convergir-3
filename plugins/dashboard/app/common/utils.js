var $ = require("jquery");

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
                        return s.indexOf("/plugins/dashboard/app/common/utils")===-1;
                    })
                    .filter(function(s){
                        
                        // we can explicitely disable the remaining filtering using the "filtered" argument
                        if(filtered===false){
                            return true;
                        }
                        
                        return s.indexOf("/plugins/dashboard/app")!==-1;
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


// Bootstrap Notify plugin - http://bootstrap-notify.remabledesigns.com/

// example usage: utils.notify("danger", msg, 20000);
var notify = function(type, msg, delay){

    type = type || "success";
    delay = delay || (type === "danger" ? 10000 : 1500);
    //var iconClass = (type === "danger" ? "fa fa-remove" : "fa fa-check-square-o");

    $.notify({
        //icon: iconClass,
        message: msg,
    },{
        type: type,
        delay: delay,
        z_index: 1060,
        mouse_over: "pause"
    });
};

var getErrorMessage = function(err){

    var errMsg = err.responseJSON ? err.responseJSON.message : 
                 err.message      ? err.message : 
                 err.responseText ? err.responseText :
                 "unknown error";

    return errMsg;
}

exports.logStack = logStack;
exports.notify = notify;
exports.getErrorMessage = getErrorMessage;
