var Config = require("nconf");

var internals = {};

internals.template = {};

internals.template["pt"] = function(ctx){

    ctx = ctx || {};
    ctx.publicUri = Config.get("publicUri");

    return {

        subject: `A iniciativa ${ ctx.name } foi adicionada à Rede Convergir`,

        text: `
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
