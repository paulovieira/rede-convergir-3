var Config = require("nconf");

var internals = {};

internals.template = {};

internals.template["pt"] = function(ctx){

    ctx = ctx || {};
    ctx.publicUri = Config.get("publicUri");

    return {

        subject: `Nova iniciativa submetida na Rede Convergir: ${ ctx.name }`,

        text: `
Caro(a) ${ ctx.contactName }
<br>
<br>
Obrigado pela submissão da iniciativa <b>${ ctx.name }</b>. A iniciativa encontra-se agora pendente para moderação. Em breve irá receber uma resposta por parte dos moderadores.
<br>
<br>
Cumprimentos,
<br>
<br>
A equipa da Rede Convergir
<br>
<br>
<img src="${ ctx.publicUri }/public/images/convergir_logo_5.png">
        `,

        from: Config.get("email:infoAddress"),
        fromname: Config.get("email:infoName"),

        // in development mode, moderatorAddress should be a personal address (just for testing purposes)
        to: [ctx.email],
        toname: [ctx.name],

        cc: [Config.get("email:moderatorAddress")],
        ccname: [Config.get("email:moderatorName")],

        "replyto": Config.get("email:moderatorAddress")
    };
};

module.exports = internals.template;
