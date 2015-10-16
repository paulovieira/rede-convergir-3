// tileJson definition for the cirac maps (vulnerability, etc)

Cirac.layers = [


{
  "id": "cirac-vul-bgri-fvi-n",
  "isCirac": true,
  "bounds": [
    -9.5691,
    36.8928,
    -6.1194,
    42.2244
  ],
  "center": [
    -8.2068,
    39.5676,
    9
  ],
  "minzoom": 8,
  "maxzoom": 9,
  "name": "Índice de vulnerabilidade a inundação por BGRI (moda)",
  "description": "Índice de vulnerabilidade a inundação por BGRI (moda) - mais detalhes",
  "legend": "<div class='my-legend'>\n<div class='legend-title'>Índice de vulnerabilidade a inundação por BGRI (moda)</div>\n<div class='legend-scale'>\n\n  <!--   BEGIN COLORS   |   BEGIN COLORS   |   BEGIN COLORS   -->\n  <ul class='legend-labels'>\n    <li><span style='background:#38A800;'></span>\n            Baixo: 3 – 5\n    </li>\n    <li><span style='background:#FFFF00;'></span>\n            Moderado: 6 – 7\n    </li>\n    <li><span style='background:#FF9500;'></span>\n            Elevado: 8 – 10\n    </li>\n    <li><span style='background:#FF0000;'></span>\n            Muito elevado: 11 – 12\n    </li>\n  </ul>\n  <!--   END COLORS   |   END COLORS   |   END COLORS   -->\n\n</div>\n\n<!--   BEGIN SOURCE   |   BEGIN SOURCE   |   BEGIN SOURCE   -->\n<div class='legend-source'>\n  Fonte: <a target='_blank' href='https://www.apseguradores.pt/site/cirac.aspx'>APS/CIRAC</a>\n</div>\n<!--   END SOURCE   |   END SOURCE   |   END SOURCE   -->\n\n</div>\n\n\n<style type='text/css'>\n  .my-legend .legend-title {\n    text-align: left;\n    margin-bottom: 5px;\n    font-weight: bold;\n    font-size: 90%;\n    }\n  .my-legend .legend-scale ul {\n    margin: 0;\n    margin-bottom: 5px;\n    padding: 0;\n    float: left;\n    list-style: none;\n    }\n  .my-legend .legend-scale ul li {\n    font-size: 80%;\n    list-style: none;\n    margin-left: 0;\n    line-height: 18px;\n    margin-bottom: 2px;\n    }\n  .my-legend ul.legend-labels li span {\n    display: block;\n    float: left;\n    height: 16px;\n    width: 30px;\n    margin-right: 5px;\n    margin-left: 0;\n    border: 1px solid #999;\n    }\n  .my-legend .legend-source {\n    font-size: 70%;\n    color: #999;\n    clear: both;\n    }\n  .my-legend a {\n    color: #777;\n    }\n</style>",
  "tiles": [
    Cirac.tilesHost + "/tiles/cirac-vul-bgri-fvi-n/{z}/{x}/{y}.png"
  ],
  "grids": [
    Cirac.tilesHost + "/tiles/cirac-vul-bgri-fvi-n/{z}/{x}/{y}.grid.json"
  ],
  "template": "{{#__location__}}{{/__location__}}{{#__teaser__}}<script>\nvar value = {{{value}}};\nvar output = value;\nif(value>=3 && value <=5){\n    output = \"<b>Índice de vulnerabilidade:</b> \" + value + \" (baixo)\";\n    output += \"<br><b>Descrição:</b> Áreas improváveis de ter inundações (E, PSI), e onde as comunidades são menos suscetíveis (SSI)\";\n}\nelse if(value>=6 && value <= 7){\n    output = \"<b>Índice de vulnerabilidade:</b> \" + value + \" (moderado)\";\n    output += \"<br><b>Descrição:</b> Áreas improváveis de sofrer danos durante ocorrências de inundações (E, PSI), e onde as comunidades tendem a ser menos suscetíveis (SSI).\";\n}\nelse if(value>=8 && value <=10){\n    output = \"<b>Índice de vulnerabilidade:</b> \" + value + \" (elevado)\";\n    output += \"<br><b>Descrição:</b> Áreas suscetíveis de sofrer danos durante ocorrências de inudações (E, PSI), e com comunidades suscetíveis (SSI).\";\n}\nelse if(value>=11 && value <=12){\n    output = \"<b>Índice de vulnerabilidade:</b> \" + value + \" (muito elevado)\";\n    output += \"<br><b>Descrição:</b> Áreas muito suscetíveis de sofrer danos durante ocorrências de inudações (E, PSI), e com comunidades suscetíveis (SSI).\"; \n}\nelse{\n    output += \"Indíce desconhecido\";\n}\nreturn output;\n</script>{{/__teaser__}}{{#__full__}}{{/__full__}}",
},



{
  "id": "cirac-vul-bgri-fvi-75",
  "isCirac": true,
  "bounds": [
    -9.5691,
    36.8928,
    -6.1194,
    42.2244
  ],
  "center": [
    -8.0969,
    39.4489,
    9
  ],

  "minzoom": 8,
  "maxzoom": 9,
  
  "name": "Índice de vulnerabilidade a inundação por BGRI (percentil 75)",
  "description": "Índice de vulnerabilidade a inundação por BGRI (percentil 75) - mais detalhes",

  "legend": "<div class='my-legend'>\n<div class='legend-title'>Índice de vulnerabilidade a inundação por BGRI (percentil 75)</div>\n<div class='legend-scale'>\n\n  <!--   BEGIN COLORS   |   BEGIN COLORS   |   BEGIN COLORS   -->\n  <ul class='legend-labels'>\n    <li><span style='background:#38A800;'></span>\n            Baixo: 3 – 5\n    </li>\n    <li><span style='background:#FFFF00;'></span>\n            Moderado: 6 – 7\n    </li>\n    <li><span style='background:#FF9500;'></span>\n            Elevado: 8 – 10\n    </li>\n    <li><span style='background:#FF0000;'></span>\n            Muito elevado: 11 – 12\n    </li>\n  </ul>\n  <!--   END COLORS   |   END COLORS   |   END COLORS   -->\n\n</div>\n\n<!--   BEGIN SOURCE   |   BEGIN SOURCE   |   BEGIN SOURCE   -->\n<div class='legend-source'>\n  Fonte: <a target='_blank' href='https://www.apseguradores.pt/site/cirac.aspx'>APS/CIRAC</a>\n</div>\n<!--   END SOURCE   |   END SOURCE   |   END SOURCE   -->\n\n</div>\n\n\n<style type='text/css'>\n  .my-legend .legend-title {\n    text-align: left;\n    margin-bottom: 5px;\n    font-weight: bold;\n    font-size: 90%;\n    }\n  .my-legend .legend-scale ul {\n    margin: 0;\n    margin-bottom: 5px;\n    padding: 0;\n    float: left;\n    list-style: none;\n    }\n  .my-legend .legend-scale ul li {\n    font-size: 80%;\n    list-style: none;\n    margin-left: 0;\n    line-height: 18px;\n    margin-bottom: 2px;\n    }\n  .my-legend ul.legend-labels li span {\n    display: block;\n    float: left;\n    height: 16px;\n    width: 30px;\n    margin-right: 5px;\n    margin-left: 0;\n    border: 1px solid #999;\n    }\n  .my-legend .legend-source {\n    font-size: 70%;\n    color: #999;\n    clear: both;\n    }\n  .my-legend a {\n    color: #777;\n    }\n</style>",

  "tiles": [
    Cirac.tilesHost + "/tiles/cirac-vul-bgri-fvi-75/{z}/{x}/{y}.png"
  ],
  "grids": [
    Cirac.tilesHost + "/tiles/cirac-vul-bgri-fvi-75/{z}/{x}/{y}.grid.json"
  ],
  "template": "{{#__location__}}{{/__location__}}{{#__teaser__}}<script>\nvar value = {{{value}}};\nvar output = value;\nif(value>=3 && value <=5){\n    output = \"<b>Índice de vulnerabilidade:</b> \" + value + \" (baixo)\";\n    output += \"<br><b>Descrição:</b> Áreas improváveis de ter inundações (E, PSI), e onde as comunidades são menos suscetíveis (SSI)\";\n}\nelse if(value>=6 && value <= 7){\n    output = \"<b>Índice de vulnerabilidade:</b> \" + value + \" (moderado)\";\n    output += \"<br><b>Descrição:</b> Áreas improváveis de sofrer danos durante ocorrências de inundações (E, PSI), e onde as comunidades tendem a ser menos suscetíveis (SSI).\";\n}\nelse if(value>=8 && value <=10){\n    output = \"<b>Índice de vulnerabilidade:</b> \" + value + \" (elevado)\";\n    output += \"<br><b>Descrição:</b> Áreas suscetíveis de sofrer danos durante ocorrências de inudações (E, PSI), e com comunidades suscetíveis (SSI).\";\n}\nelse if(value>=11 && value <=12){\n    output = \"<b>Índice de vulnerabilidade:</b> \" + value + \" (muito elevado)\";\n    output += \"<br><b>Descrição:</b> Áreas muito suscetíveis de sofrer danos durante ocorrências de inudações (E, PSI), e com comunidades suscetíveis (SSI).\"; \n}\nelse{\n    output += \"Indíce desconhecido\";\n}\nreturn output;\n</script>{{/__teaser__}}{{#__full__}}{{/__full__}}"
  },
];