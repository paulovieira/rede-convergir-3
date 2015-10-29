var Fs = require("fs");
var Wreck = require('wreck');
var _ = require('underscore');

var internals = {};

internals.correctDomain = function(payload){

    var domains = payload.domains;
    var domainsOther = [];

    for(var i=0; i<domains.length; i++){
        
        if(domains[i] === "Agricultura"){
            domains[i] = "domain_agriculture";
        }
        else if(domains[i] === "Pecuária"){
            domains[i] = "domain_husbandry";
        }
        else if(domains[i] === "Bio-Construção"){
            domains[i] = "domain_bioconstruction";
        }
        else if(domains[i] === "Eco-Tecnologia"){
            domains[i] = "domain_ecotechnology";
        }
        else if(domains[i] === "Arte"){
            domains[i] = "domain_art";
        }
        else if(domains[i] === "Educação"){
            domains[i] = "domain_education";
        }
        else if(domains[i] === "Saúde"){
            domains[i] = "domain_health";
        }
        else if(domains[i] === "Espiritualidade"){
            domains[i] = "domain_spirituality";
        }
        else if(domains[i] === "Economia alternativa"){
            domains[i] = "domain_economy";
        }
        else if(domains[i] === "Partilha de terra ou equipamentos"){
            domains[i] = "domain_sharing";
        }
        else if(domains[i] === "Ferramentas Sociais"){
            domains[i] = "domain_tools";
        }
        else{
            // this domain is not a pre-defined
            domainsOther.push(payload.domains[i]);
            payload.domains[i] = undefined;
        }
    }

    payload.domains = _.compact(payload.domains);

    // if the array is empty we get the empty string
    payload.domainsOther = domainsOther.join("; ");


};

// temporary helper (used only for the migration)
internals.correctTarget = function(payload){

    var target = payload.target;
    var targetOther = [];

    for(var i=0; i<target.length; i++){
        
        if(target[i] === "Crianças"){
            target[i] = "target_children";
        }
        else if(target[i] === "Adolescentes"){
            target[i] = "target_teenagers";
        }
        else if(target[i] === "Adultos"){
            target[i] = "target_adults";
        }
        else if(target[i] === "Idosos"){
            target[i] = "target_seniors";
        }
        else if(target[i] === "Famílias"){
            target[i] = "target_families";
        }
        else if(target[i] === "Pessoas com deficiência"){
            target[i] = "target_handicapped";
        }
        else if(target[i] === "Crianças com necessidades educativas especiais"){
            target[i] = "target_special_need_children";
        }
        else if(target[i] === "Geral"){
            target[i] = "target_general";
        }
        else{
            // this domain is not a pre-defined
            targetOther.push(payload.target[i]);
            payload.target[i] = undefined;
        }
    }

    payload.target = _.compact(payload.target);

    // if the array is empty we get the empty string
    payload.targetOther = targetOther.join("; ");

};

Fs.readFile("./db_151022.json", function(err, data){
    if(err){
        throw err;
    }

    data = JSON.parse(data);

    for(var i = 0; i < data.length; i++){

        internals.correctDomain(data[i]);
        internals.correctTarget(data[i]);
    }

    Fs.writeFile("./db_151022_new.json", JSON.stringify(data, null, 4), "utf8", function(err){
        if(err){
            throw err;
        }

        console.log("all done")
    })

});

