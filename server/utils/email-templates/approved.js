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

        subject: `A iniciativa ${ ctx.name } foi adicionada à Rede Convergir: `,

        html: `
Caro(a) ${ ctx.contactName }
<br>
<br>
A iniciativa ${ ctx.name } foi adicionada à RedeConvergir. Para visualizar a vossa informação basta visitar o seguinte endereço: 
<br>
${ ctx.publicUri }/iniciativas/${ ctx.slug }
<br>
<br>
Em breve será possível a vossa contribuição para o calendário de eventos, cujo o objectivo é reunir e divulgar as actividades das iniciativas que fazem parte da Rede Convergir. 
<br>
<br>
Estamos ao vosso dispor para mais informações e desejamos muito boa sorte para a vossa iniciativa.
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
