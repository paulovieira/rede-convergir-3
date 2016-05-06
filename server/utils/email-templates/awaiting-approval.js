var Config = require('nconf');

var internals = {};

internals.template = {};

internals.template["pt"] = function(ctx){

    ctx = ctx || {};

    ctx.infoAddress = Config.get("email:infoAddress");
    ctx.infoName    = Config.get("email:infoName");

    ctx.moderatorAddress = Config.get("email:moderatorAddress");
    ctx.moderatorName    = Config.get("email:moderatorName");

    ctx.publicUri = Config.get("publicUri");

    return {

        subject: `Nova iniciativa submetida na Rede Convergir: ${ ctx.name }`,

        html: `
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

        from_email: ctx.infoAddress,
        from_name: ctx.infoName,

        // in development mode, moderatorAddress should be a personal address (to test)
        to: [
            { type: "to", email: `${ctx.email}`, name: `${ctx.name}` },
            { type: "cc", email: ctx.moderatorAddress, name: ctx.moderatorName  }
        ],

        headers: {
            "Reply-To": ctx.moderatorAddress
        },
        auto_text: true
    };
};

module.exports = internals.template;
