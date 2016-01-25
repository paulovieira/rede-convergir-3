RCData.initial = {
    zoom: 7,
    center: L.latLng(39.5676, -8.7068),
    baseLayer: "stamen",
    types: [],
    domains: [],
};

RC.popupTemplate = _.template("<h5><a href='<%= url %>' target='_blank' title='Ver a ficha completa desta iniciativa (abre numa nova tab)'><b><%= name %></b></a>  <a href='<%= url %>' target='_blank' title='Clique para ver a página da iniciativa (abre numa nova tab)'><i style='' class='fa fa-external-link'></i></a> </h5>");


RCData.iconSize = [32, 37];
RCData.iconAnchor = [16, 37];
RCData.popupAnchor = [0, -34];
RCData.labelAnchor = [10, -22];

var iconsC = {
    type_001_permaculture: L.icon({
        //iconUrl: "/static/_images/mapicons/permacultura.png",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAYAAAAjt+tHAAAElklEQVRYhbWXT2zTVhzHP89287+lCVDaAmkAqRMttKFI0wBF0ya4TKJom6Yhpp125T5p0u6gicM02GHXaUMcJlAPaFJuDazbUCFtKYhDN4q6rhRGS+omIU2ed6idJXGobeh+0k+2n9/7fT9+/r1n/4RhGACcOHFCAxTAZx41NtfKgARKgEyn02UAYRiGJe4DAqb7TABlk8SlCVACiqaX0ul0WRw/ftwSDwFt5jHA/zMDRSAP5MxjyXrKgCnekRzOjG2ycJ1lR1JHzFMJlGunPpQczozt3dtLOBQhGAxtqnChkGc1r8NwZiw7kjqI+RpqEy8A0BreQjAY3lRxgHCoDUWo1qWVZ4rG+ru2nFCo7ZVFlpafYBgGQggMwyAW7ai7XxO7qmklWjXbayhd2/zCn6zoSwghONz7GZoaYGbxqlMsxSKpM4E3gMdPH7GiL3Hy6CX6ek6hFxb57f635PM6W9u7HcfbATzOQC73D+8c+pK+nlMARIIdCBTCoXZXsWwAqtLiCaAiyxxIfFS9Xi0+5daD7+jcvsdVrNeeAYBQIAaAXljk0rUhVLWF7Vt7XI3dFIB88RnSKJOZ+gpN9dHXm3I91gagiObTNv/4Ac+ezyMrZaRRQREqQllfPN9cHaj2U5UWFhb/pHtH76sBPNPv2TrNzc0hpeTtwS/oT3yANCoAzC5keLgwSnzHURKdKYTQuPfwKqOT5yiUnhCNRr0DNNrKygpSSs6+nyUc2FZ3b2DfaTpjA3RE+6ptR/rPIoTCjbvn0TSN1tbWDeM7fm4rlQqD+z6xiVtWK27Z/vhJDu45Q7lcdgrvDPDixQtaQ12OgWptS2Q30dYEa2trrw9gGAaa6vcEAFCprCGldOznuBUrioqUFc8A1linrd2+DJX6Jr8/wPLqrGfx5dVZ/P6ALZ5Nr7FBVfx17msJMjlz2ZO4lGUmZy7jawna4rkA8NV5rL0TgLHpi64Bfr71OQCx9k5bPEcARfhsvjXazejkOfTCoi1AY9vY9EWm/rhCV8feprEazfaCNDVg69S9o5fnuadcujZU3Q0NJKMT52iPJBjYdxpFaNyYusDEzA9sj8XZFotvNEk2gOp6URU7AMCBN95l/vEDbk5fIDN1HhBg/n6NTX8NQqAIhV1d/WyL7najLS2Aco1TLBSIhNubjoh3DRDvGmh6z43pq8vWaVVT479yqQig53Ooqp9I2PlD4k18CT2fsy6LpqbUasTz60VDumlhcvjAe+zq2u9KbO7v+4zfvd70nlmY5KmpC6R5kTM7HKS+NDNXyvWbQmjEu/s3FH80P8343etkR1LHzCYrvxpLsyIg3RSn1X/45HBm/M3BD+npbp4Hs/OT/D7xE9mR1GHqc+vlxalDeW4da8u3O28lPyaxM1kn/vCvLL9mr5AdSR2qneIGgObl+UZmggWAiOmh5HBm4uihMyR2Dpnit/nlzo9kR1KDprhuetESepk5ArwEIpIcztw5NvQpADdvf289uY4HcdcATSDaTIhxwHrnOuvJ5VrcE0ADRMh0a3MvsT71eS/ingFqIKyktJaqtcRKXsQB/gUld8DdTjypewAAAABJRU5ErkJggg==",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_002_transition: L.icon({
        //iconUrl: "/static/_images/mapicons/transicao.png",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAYAAAAjt+tHAAAFUklEQVRYhbWXTWwUZRjHfzP7Nfu93ZZ2W9pYDJSm2CKiBqypsSwauaAciImKBxNjejAejAePBC+Gm8qBiDF6QGMkhoQIaTEkUIiSgiZaPoJQGhK6K91lZ9vt7Ox8eOjMum13truk/pMnM/Pu+87//zzv884+j2CaJgC7d+92AyLgta5u1hYaYAAqYIyOjmoAgmmaNrkXkCzzWgLENSI3LAEqoFimjo6OakIymbTJA0DEukr8PxFQgAIgW1fV9lKyyFvHBkcurTHxEiTHj+y0bg1Aqwx9YGxw5FKkuxt3IIBbktaUWFMUtEKBMUYuJceP9GNtQ2XiSUBD5JqqMpfLoZdKIAgIgBQKEQiHV8xd9k47z0Q7222rm9w0TbLpND1+gR9f6uHX17bwXm8Lc9ksxYWFqmsq3l3mtBPNMdsNXSefzdqsCKJIKBZD1zQEw+DcvgGaJQ8A21vD3MopnE3J+Pz+1XwQaxLbmMvlCBsqxwa7+GJnJwGtSDadRi0Webo1VCa38eG2TkrFIunpabKpFMVCYXUVtaAuLHBoRzdvbG7lnb4E5/YN4DE0FvJ5nmgOrpi/qyuG/O5zjO3t55WOILkHD9BKpUcTYOg6hq4z3Bkrj/U3Bzn64iYMXae3KVB1XdjrYldXjBN7+uhzmGOj6sfGNE0Kssx8Lkfc56Y1sDTMb/W28cu9HIll44+CqhEo5POU8jIfb+/i9tvPEPWu1Hn4+Q30xZ29W9AMDozeYDJbOweqRsDQdd7f2sEnO7sdFzZLnhUJaOPUVIYPzv/NrZyCLxDANAwMXUd0ueoTIAgCcd+jhfduXuH03QzDnTGGO+H3f+a4nZslq0G8vb0+AQCHr97j9Z51bIg09kl+LCzx2Qsbl4zdyBYYOH4FQ9frExAIh8nMzzNwfIIdbRGebQvzeFTiyZYgkltkS3zl8auFzU0BOkI+5uvdAtHlIt7ejlYsclEuci41g1YqsTEq8d3LvQ2RA/x8N8OUrNAcqjMCAKIo4vX7MQyDgiwz1BHhxJ4+x8SrBt00OfjbNIcuT+OVJFzulXQ1i45SsYg8O8ubm1v5cngTPldjBdKnE/c4eHmaYDRKIBKpOqemAE1V2dEW5utkDy5BcJw3kc7TEfQB0B70lsfjkhuPz0cwGnVcW9Mll8fDQEuwJjnAyTsZHigljv51n6JulMcnMwXEKmGvW4BeKvHN9RTfXk+hW9VzNVy4n+PWwwVa/V5ePTXJpRmZU1MZvro2g8frdVy3qgApFML0+TkwdhP3FxcQPj/PscmZpSJNk4v3ZUJeF0PrI5yezjJ08hp7z9xEdXmRgrWPbM34CIJAtKWl/CzPzvLR+B2GOqJsii0WHEf/nEHVTfrjQTwuYfEIJxI1SasJMGrOshCKxcimUjz1/RX2b1xHpqjx0+1ZhtZHmSmo7D9zHbPGVi2DYQvQKgxNURzrQtHloimRoFgo8ENaA9MkGI0iiC52nZ1GntdoamtzZNQUpXxrm5v/2iUFQLNKKEcRoog/FCo/q4rCJD4MsUhTIoHgcGLsstyCYnEaQjKZ9AIhIEaNxiTS3Y0Ujzt6Vwklk0Gemqr6m9WYpIGHwJwdAYXFdgmraahszUSAMUbGgVVF2OTJ8SOD1pCdX8tbMwUw6mlOyzX82ODIRK1IVJBvZ2luOTenq7Tn9rWyfbtaTUQF+TbLS3ufKwVUb89rwRImsZgnIUvEH5UiKsi3WuRzlik2kRNWFeAgImRHAqj0fI4GyOsWUEVExBIxAdh7PsdictVN3pCAZSICltn/NCqLoS80Qt6wgAoRdlLaR9U+Ymoj5AD/Aq0ST8LXuhJeAAAAAElFTkSuQmCC",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_003_soil_nature: L.icon({
        //iconUrl: "/static/_images/mapicons/gestaoterranatureza.png",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAYAAAAjt+tHAAAEz0lEQVRYhbWXT2gTWRzHPzNJk2ma1DSbxtX+sbq9uFq06Lau1tsUBBHqRaUKCgXBg1Lw4KE9FvSiBPQiKBTxUDx4EdtDguBhXVNW4lp3V6xo1lqtrVvbNOZfp5k9dGaaaJpMNP7g8WZ+783v+5n3fo+Zn6CqKgCdnZ1WQARsWm+lvKYAGSANZAKBgAIgqKqqi9sASWs2DUAsk3hGA0gDSa2lA4GAIsiyrIs7gGqtl/g+K5AE4kBU69P6W0qauK83GPy9zMI55pflX7XLDKAIsiw7NXFPbzA41uRy4bBakazlXYCkohBXFCILC/hluQWYBaLZiScBpsQ/RKPEU6kv/GvdbuwVFXmf+Symnmeinu16M/Xm8VSK5qEh2lXVaFVtbbyfmyv4XFZsQ1P3FMz22ViMWCKB1WJBWVoC4IfDh3PmbHnwgFGrlYmZGQRBAMBbXY1ks60WViwqDPBfNEoskWCD388OReGnmzfzzos9fAhWK9tevmTb5CRVe/cyPT9fLHzxo/YplWLT4CC1x48D4D16FNHh4N3Fi6w7e9aY9+7SJdoXF437n+/fJ6StxDcBCIJgiOvmOXiQT+Fwjq+uv7+oWD4rugWqqhIfG/vCb29sJCQIhASBJy0tVLW2fh+ACouFvzs6SE9O5vgfeb2IgsCPNTUknj7l1alTOeNzIyOmAIpugdvpZGZ+nnB9Pev7+3Ht3k3Vzp0A1Hu9AEgVFSSePQNg+vp15oaH+Xj7dnkAZubnqWprY2so9MXY65kZHHY7ycVFvLIMgK+nB19PD6mJCR43Nn47AJBXvF1V+aezk1QkQl13N3V9fTnj9oYGM6G//ov38e5dNgcCK/d37lBz4EDJcUx97yOnT+fcvz53jsWpqRzf9LVrJYuDiRWocTp5f+UKsdFRGgYGmPL7mRsepl37k9Kt9sQJQoJA89AQAC+6u8sD4KqsJJFK8Wl0lOf79pHJZPLOE8TlxXxx5Ijha9BOSSEztQUOSWLT4CC/LC3hO3kSgPHPPkbPu7pwbN/O9kiEdlXFIorGR+mbAVLpNNF79wDYePUqrW/eMHvrFn+sWQNASBBouHCBlnAY+4YNpCYmWFplpb4KwG6z8eHGDePeVleH59AhlqJRw+fq6DCu/9q1C4to7n/W1CynJAEQ3rjR8HmPHVsBbG7GtWcPAFOXL7P49i1r3e7yAQCs93hIRyKEBIG358/j6uigfmAAgM3BIHMjIzzZsoV/z5zBKUlYLZaSAIpumNViobG2lurKSt709THm8+HYuhWAx01NjO/fjzo+zrqaGjwulxntjA6gZDWSilLwKbfTSYPXi0UUed7VZfjrvV58bjcVBf4ps2IbmiIr5VISIK4oRSEAarUT8M7nKzpXF4+vxE1qmhlBlmUb4ATcFChMmlwuPFoyFrPZZJLIwkLeMa0wmQbmgJiZ0kwE6A0GfzMDoYv7ZXmP5tLzK29pZqY4Nf7he4PBR4UgssR3kJtbqxenRcpzvdfhHL3BYDgfRJZ4q/Z2+j5nA+QvzwuZBiaxnCdODeLPbIgs8W2aeExrSV1oNSsKsAqEU18JIPvNY5QgbhogD0S1BvEI0Pc8xnJymRYvCeAzCIfW9MIvzfLSx0sRLxkgC0JPSv2o6kcsXYo4wP+gOfkwLg/YUAAAAABJRU5ErkJggg==",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_004_construction: L.icon({
        //iconUrl: "/static/_images/mapicons/espacoconstruido.png",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAYAAAAjt+tHAAADtUlEQVRYhbWXwWscVRjAf7PszC5JqCJFM1FDBA9WsVbbCtUgNU6O3vwDRN3iIRRKRQr14kV7KN48aEDBQ0EED3rcofVgjNCk4smaiqZBGFhsaEx2M/sy+56HfW+c3cxOdrK7HzzesDPzfr/3zbe781lKKQDm5+eLQAFw9FxkuBEBEhCArFarEYCllDJwByjr4WiBwpDgUgsIINRDVKvVyPI8z8DHgCN6LjOaDIRAA/hXz8LssqzhD/sVf3nI4I7wFr0z+lACUTL1Y37FX3ZnjlIecyiV7aGCm+EeYUPgV/xlb9F7Fv0YkoVXBkYCB7rXNHVWMNVuxkjgKRIx01T5sKo9TxQGAm9ubnbMA1kcFv7++OWBJXILGNjHj17tmA8rkUsghj/WhkqpBpboSyAIAra3t2k0Gnw49REASp8zc1IiCIL4voEFzCLfP1nlLfccW9F9hBQoJNJq0SIiIqJoF7ny+Cc0m00Arj3ybV8SmQLm5hsn2r/Ob069w91wnYtr57lwZ4EtscXFO+e58PsCu3u7LPx2jlarFV9v5iyJngLdcBNvT71LsVhESslfu3+yfTYC4J64h2VZ/PDCzx3XHySRKtALLpWkKUO+fOoaAJ8e+xyA+pzk7u46Xz3zNU0ZIpXsWyJVwHVdbpxYxkp8pjS8Jmqs1W9Tn+uEfPb0F6zVb1MTNZoyRCUkLC3huu4+Vup/fhAEzG6c4sfTK8zePNXexcmfmL/1SrzjtLj0xAeMXy/E17+68hJAvI5t7/+f6ZkBAEffYFkWylKZcBP1OdlxPRBnMi0DPYvQ2Nq2jW3blJwS3xz/jqvrVwAYv16Id9t9rJSi5JRYenGVpdMr8Rppkfna9cbfr8fHr92aRQiBlJL3Zi5l3YbjOJy9eYYoilBK9YRnCph0dadtY2Nj37Xdj2VycjJTsC+BrDj2x0x8bFJ/2MgtMD093TEPGkY/u7RHE9IIRIlBM9wbGTGxdsws8H+7FAKEDTESCfNariPUTGl5nucAE8CDZDQm7sxRHnhovC/Y1madYP2f1HO6MakB94GdIu0MhLTbJXTTkGzNCgB+xV8CDpQwcG/Re1l/ZOqruzULAdlPcxq/w/sVfzUrEwn4STprq3dzekB7buZk+/ZLmkQC/rzepXnOSYH09jwrtFiZdp1MaIlfkxIJ+HMavqNHaEC94kCBHhITJhNAcuc75ID3LZAicURLrALmme/QLq6+4bkEuiTG9HD0KUE79Y088NwCCQlTlOarar5iIg8c4D9k2fvQgZSSxwAAAABJRU5ErkJggg==",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_005_tools: L.icon({
        //iconUrl: "/static/_images/mapicons/eng-ecologica.png",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAYAAAAjt+tHAAAEuElEQVRYhbWXXWwUVRTHfzs7O53uV2mpm0pSaJelQgN2CYZCGosfbXyRlEAw0frio088aOKDPuoDj8Q339UEYoOpiWm2omhMW01la5CWsmwr1VpWKlCXZTu72fqwc4eZnZn9UDzJyb0z9875/8+5557d49na2gJgeHhYBiRA0UeZxytFoARoQCmRSBQBPFtbWwJcAVRdFZ2A9JjASzoBDcjrqiUSiaJnaGhIgPuBsD6q/D8RyAM5YEMfNeGlqoNHkunI1GMGtkg8mjmqT0tA0Rx6fzIdmerpiREMBPD7m+s2unA9RdeuTpZ/XaFrVyeq2mTbk8s9JPvgAclFpuLRzAH0Y5B4lHgqQEs4SCgUwOuV6laAL8+/TU9sh+ueUChASzgo+Ig8k2TKZy2UUDDQSERtUihoBPyq45rJtoEpEs3Idsn73xL/1sofNDerNDerJOfmLWvxvn3mR0kwsYj3XxLY13+G+ZlzjIyeRZIkA3x+5hwAr7/5keN3NjSvJNXUzfymRQ8/c8BiY37hpgV8X/8ZZn/6Ba9kd84WAZ/srerp7cw6qfQKPbEdACymVolFO237zOAAA0fijvYcjsDjCr52uwx+8ng/H7z3GgDvvv8JY+MzVcEHBw662rQRcEvCb76dBbCAA8Z8bHzGyAMz+HODh1zBHQk4HUHi0g/AI88qRZAQowAffuFwVXBHAtdTa5ZnTdPYuXMnExfeqmpIgI+MngWgo6PDZqsuAk6iKkXDq5PH+133jY3PGFdxI1uqx3R1ApqmAdDevp2NbIm1tTXL+ZtFEBRSKBRQFKUmgZpVJ9r1BOnlPykUCsY7EebKuVnW19drglclILw3GxR3//OP3zHei7lYGxk9a1lvmIAkeQyNdUdYvnUHSfJYwJwi4ARaLBYs9oQdszhew83NTWT9Z1R2qAtOERCymFoFyhHJb3pqVlabdUWR8flk9uzu4LfVu/h8MrdWfjdCXE0q95RKJRRFtmhNAsViAVnWvZclQiE/T/V013WulXsCARWfz2vRSrFRagkHaW/zc+evHD7Zi+KTSc4tGdfMXA3N52++hqff+JDF1Cr7e2MovuqlxjEC2QcaxWKBttYQapNs/JhUK0JibXDgIG2tIWNUm2SLukXAKFvb28IANDX5LBt793a7FiEol+KFGxnbd1WkJAgUTcrD/EO2tYRsu68tLNmqnRDz+2j3k66I9+7/LaYGpsyjdikPsHE/i+KTad0Wtnx8auRYHU65y917G2zcz4rHvI5Zkk3guXg0c/TS5R8dG5OXho6wt6erLrCFxWUmJqcd1/TGJCdIiAjkKbdL6E2DuTWTACYmp7+XvRK9e7urgl9bWGJicpp4NDOgvxL5Vdma5YFSPc2p8R8+mY7Mnnj5Wfb37nYEv3rtJhe/+I54NHMIa265N6c12nMxmtu3K6dOHKNvf8wCPnc1xWcXLxOPZg6aQ1xBwLk9ryY6MRUI6upPpiNzr5x8nvjTewBI/nyD82NfE49m+nTwrK55AeQmNQm4kAgm05Err55+EYBPL3wlPM/SAHjdBBxIhHUSs4A48yzl5KobvCECFST8uor/XBrl0OcaAW+YgImESEpxVcUV0xoBB/gHq9XqZvEKKZMAAAAASUVORK5CYII=",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),

    type_006_culture: L.icon({
        //iconUrl: "/static/_images/mapicons/culturaeducacao.png",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAYAAAAjt+tHAAADbklEQVRYhbWXPWgcRxiGnx3t3q1XiuPoICGHg12kMhwmGAIhVWDVujYpUxwkVbrAQYJIodqQVNekTZ/CxV0bBMEmmEuVSsZiRYzlCPl0f7uaSXEzm9nT3t2utPpgmL2duX2f+ebdn89RSgGws7PjAgKo6d6l2kgACcwA2ev1EgBHKWXEa4CvW00DiIrEpQaYARPdZr1eL3HCMDTiAXBT9z7Xk4EJMAJOdT8zq/S1+Pudzf5+xcKZ2DsLP9OHEkjs1Aedzf7+nTsuQSCo151KhadTxWgk6bzo7++dhS30NtjG8wGCQOAHHkopDg9nlYjfvl3DDxwgNqeMz4TLfK9No153UEohpQSg1Y0vXLBMDNoeUkqEyGQ11TRGW+n2Qdu7lPgaeLFWeN1Fm0037VvdmFY3Ts8VjcIARsSOxu4YgChKGLQ9Bm0vPVc5gBExYWBMnwdYKcBiag2M6Ru74zQL1wKQF8e7NzK/L+OD0o9bI7osI2WjFECz6RJFCUDaQ/bOGLS9zLxKAQyE7XR73y9jwtIAUZQQLaTbQC164loA8jJgoFrd+AJc5QB5GbjK+6IwwCpTLd4BRQ1YGOCqb8QrAdir+/j7p/jNe/z1dZA7t9WNeTt4wsFPD6sBMA8bpeDoKOHGR/d5O3iSGTMRRQnjl8/Zuhfmji+LQo/ik5NzhOcDcPjLV3g5Rnddh5fdL3E2PBxHMByeVwcwHis+fPQYgGT4mkbj4uq2tzeY/vP3/PiLbzg9VaUA5LqJtz59xOz4xfxPOdjm2+p89C8fPPyhiLY0AInVmE4VjuMghEib44Cob3L067cIQWZscd6r335kI3hPg9pjDtNpmpVU0+X/cmkCMBpJIM58lqvzhOi7GqfHMY2GBzJ/f999B173HhP/8TPIBORGOjbRn+Xmp9aUThiGNWALuMWKwuTuXY/t7WLOfvMm4eAg/9mhC5NXwAkwNBmYMC+X0EWDXZoJgM5B/3dgLYQR3zsLP9enzLIXS7MJIIsUp+k3fGez/2xVJizxB2S9tbw4XVOem94u3/7Mg7DEP9GrNPtsA+SX56tCg/nMfbKlIZ7bEJb4fS0+1G1ihJbFWoAlEFsmE4C98iElxAsD5EDc1BDPALPnQ+bmKixeCmABItCtpodmzFM/KiNeGsCCMKY0TjS32KyMOMB/92uyOQd7wMAAAAAASUVORK5CYII=",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_007_health: L.icon({
        //iconUrl: "/static/_images/mapicons/saudebemestar.png",
        iconUrl: "data:image/png;base64,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",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_008_economy: L.icon({
        //iconUrl: "/static/_images/mapicons/economiafinancas.png",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAYAAAAjt+tHAAAEyElEQVRYhbWXT2gcdRTHPzOZTmY3+y+7pem2KbtJMU0aVKQIjVKFkuhVehF7KFXZiwhKvOjFg0IpbdNWLQVJj4JeKwhKbsa29h/VSwtiZ2dpSOnS7MbZzWZ2MzvjYWe2k3azOxvjgx8z+/v9eJ/ve7/3Y+cJtm0DMDU1JQEiIDtPia01E7CAGmDNzc2ZAIJt2y5cBhRnyI4AcYvgliOgBhjOqM3NzZnC5OSkCw8CEeep8P9kwAAqgO48a26UigPfkcnMX9ti8DqbnT004bxagOlNfTCTmb+WTqcJBoMoirKlYMMwqFQqZDLz12ZnDz2PcwzewlMA3/BCoUC5XF43FwgESCQSiOKzpfOUT7fORInGWbujI7xer6PrOpIksX//KXbuPArA0tLPqOpnLC8vbxiEZ67JdAvNd7Xruo4sJ4jHj1Eo3OLhw8uIYoC+vudIJj+iWPyFx4+vEI1GCYfD7VyJXYHhyTkmEu9SrebZti1APP4ykUgKQVhFFEVGRy+SSmUoFovPHFEr6+qqLS0tEYu9Qjx+mHz+R3T9D/L5O1iW5QwoFn9nfPwilrVCLvcdoVBoawQUCgXq9Tr79s2wuqqhaTPIsky1WiUcfoFQaIy1tWVWVxe4e3ea0dFTLCx8T71ep6enZ/MC3LTXajVGRk4gyzu4efNNRFHEMAySyXcYGzvd3F8sXmVx8Qcqlb8RxRiLi4vs2bNnQ/9ta8CF9/dPMDz8Jb29A+RyM6ytFTFNk2Ty7SbcNEtks+epVh+RSLxOPv8TExO/4f7XbCoDiqLQ13eAQOA1crlv2bXrKA8eXAJ4JvIbN6YwjAWSySMUi7c4ePBXRLHzCbfd0cjAPD09V+npGUCSZExzdV3kjehXMIwFent7yecvE4+/4QsOHY5AURTi8TjBYBBJCnDv3ucMDBxhbGxmfRRSH0ND01SrVaCXvXs/9QUHn7egXC5TKj1kYOAtxse/brlnaGia3buPIcvbm3MrK3919N02A7ZtUyqVKJVKDA4eZ3z8QltnXriqnub69cNIUvsY267quo6ulxkcfI+RkS/aOvKapl1A074iGo0SjUY3LyAUCrF9+/ukUtO+4bncRVT1JJFIpCO8o4ByucyjR5cAhVTqg47OstnzZLNnCIfDxGIxX4LbCgiHw1jWP9y/fwLbtkinP2wDP0s2e5ZIJOIb3lGAKIr09/cjCAKqehKgpYjNwjsKcM11qqonsW2ToaGPm2uqOoOmndsU3LcAr4hs9gy2XWd4+BNU9bTvau8kwPIrQhAENO0comiiad/8F7jlCjA9A8Mw2n4XRqNRBEHANC8Ti8WIRCK+iYZhuK9NpsiTdskAqFQq3o0tzYV2C69UKs2fDtMSJicnZSAExGjTmKTTaeLxuC9YoVBA07SWa05jkgeWgbJEIwMGjXYJp2nwtmYiQCYzfwXoKMKFz84eetWZcuvr6dbMACw/zWnzGz6Tmb/dLhMe+AHW19bGzWmH9tx9etu3O61EeOAvOVG65+wV0Lo9b2eOMIVGnYQcEX96RXjgLzrwsjMMF7SRdRSwgYiQmwnAG3mZLuC+BbQQEXFE3AbcMy/TKC7f8K4EPCUi6AzZWarRSH2lG3jXAjwi3KJ0r6p7xWrdwAH+BRUNOhXcuJdKAAAAAElFTkSuQmCC",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_009_community: L.icon({
        //iconUrl: "/static/_images/mapicons/terracomunidade.png",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAYAAAAjt+tHAAAD7ElEQVRYhbWXwWvjRhSHP2tjI5zIrXIoJKGJyaHBsE0ppYSlkJNdCrn0VHIJxIT8BYVeloLpEnrqXxBCyoaFPfYSKPHNUMIeltKy7TawLE5Ka+ghKutgBtuVe9CMOpZGlp11HwwjzUjz++bNm5FeZjAYAFCpVGYAC8jJeobpWh/wgS7g1+v1PkBmMBgo8Rxgy5KTANaUxH0J0AWELN16vd7PlMtlJZ4HCrK2+X88IIAO8ErWXTVLW4q/1RhUz6csPGSbmeN78tIH+rrr841B9bxYLJLP57Fte6rCQgg6nQ6NZvV8M3P8LnIZ9MCzgVRxz/MQQtDr9Ybas9kstm3juq7xvciYKs6sGYK1VsUoHhWt7ayxUXJZXy0A8PPLVzx57lE7uaDdbifCaGOHmirQjNHueR7tdtsoqoQB1lcLrK8W2N9aicE4jpPkFUuRpArvb60M9R+eXlI7uRhqU8/pMOq5USAxACUeFY6K6gN6XjBj1a/eVcUEnAgghOCr3RJ7n7ydKqzMdd2w7erqKoTRQaw7Fg8evUgHsG2bD995Y0hYDXR4esk33/1pnIlufzz+GICl7bMQZKPkGgPc6IHPvv4FIQSO46SKpZnjOBw8folt2wgh0gEWFhbC6zAelCe0pYgugx64S9tn1HbWAGIB2Gq1RgPExLVgjAaUDmEKXP35pAMq8WvXbrc52Lsb24L7Wysc7N0NZxvtG6dtLACA3coiS9tnQ21L22fsVhaBwEutVgvP88L+w9NL43WSvdYn9/NPF7HuWPj/+In7fCoA6siNWjaXZbeyyLf19K15KwA1sDr/1XKo9vtHz7h/9Cx8/uj732NjmNp0S4wBx3GoPbwItxMEB0xtZ40vj38FggNKtQHUHsaX4cGjFyPPk0QA13Xp9XpslIa3z0bJxff92PbUQU1jTQwAwU+G/vkFYve6+b4/arjJAXq9Xrju0drkmdvYSIDl5WVjezab5cnzYO+rva7ubwswke9s2459H2onF1jWRGmErwD6WjF+saKWFFSzs7NGWGXa2KHmDP+lSwKg0+nEXrz3xW9D9ah2/c8ICLeg+i1XLFLTz5TL5RwwB7zJiMSkWCwyPz9vnHnUrq+vaTabxj6ZmPwF/A3cKA8IgnQJmTToqZkF0GhWfwBSIZT4Zub4I9mk4iuamgnAHyc5Df/hG4Pq01Ge0MQ/YDi2kpPTlPRc1Xr69qMJQhN/X85SrbMOYE7PR5kEswniZE5C/KRDaOLvSfEbWYQSSrJUgASIOeUJQJ/5DROIjw1ggChIiKeAWvMbguAaW3wigAhEXpac7OoSuL4zifjEABqECkq1VdUW604iDvAvfmEsxLcsQqoAAAAASUVORK5CYII=",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),
    type_999_other: L.icon({
        //iconUrl: "/static/_images/mapicons/outro.png",
        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAlCAYAAAAjt+tHAAAEMklEQVRYhb2XTWgbVxDHf5Kl9Wory7I+IhkbrFKHlhDLlFKH0IIvMoVS3EKhvfjQQ1oEPecQeig9Orc2PfiQXgq55GBw2ptE2kKLU3AIcWPIwQfXTloHf9SV5Nfn9UrKwbvbta2Vdo2dgeHpvR3N/7/zZt6+CTSbTQAmJiZCQBBQzDHE6YoBNAAdaJRKJQMg0Gw2LXAFUE1VTALBUwJvmAR0QJqql0olI1AoFCxwDYiZo8rZREACAqiYo269pWqCnyumy/OnDHxIZjYKl82fDcBwhl4rpsvzuVwGTVNRVeVUgaXUEUJSpDw/s1EYwdwGZ+KpwJmAA0d9WnkWtLLdUs/ghmFQqVTs0ScJG9PKct/ZLoTAUJJoo1Ps7u76/buNeeIyq9Vq9F54l978h+zv72MYxon8nIiAYRgYhkF2bIrowCjdiSGEEC+OgBCC7sQQ0cFRAFL5SarV6osjUKvVSOUn7fng+OfU63V0Xffty/W0E0JQrVap1+vU6/VDz5rNJtmxKXuuJnO8NJBn/ekigUDAXg8EAoTDYUKhEMlk0h8BTdPQhifoe/OTls+t8Fty8cpt5Pafx+z2/31C5e6XbjAdIvBgFrRzvPzBtKsDS9RkDjWZO7S2uXiHlblrBIxd1wi45oCmaUQiEVbvfs3C9Bhya6UjCacsz15l6eZHNPUqfX19rnZtkzAWi5HNZpHrSyxcv8Tm4lxHYLm1wsL0GE9/vkE8HiedThMMusN0rAJFUejv70dBZ+nmx6zf+97V1hA7LFy/xH9/PyKbzRKLxToS9lSGwWDQ3kM1OeRqF9LihCJxenp6UBRv3xTP54AQgq5IL/Hz423tUvlJ9vb2vLr1R8B5+AA8+ekbHt/6FEPs2Gvx4beRUtJoNDz59XztklLyysh7wMFeP771GVt/3AEOyu3ildvEz4+Tyr9PV6QXKSWapnX06ykCuq4TDoeJD4+zuTjHva9eZfvRD6RSKQYHBwk1JA9vvMPy7FUMsUN8ePzY6ekmniKgKArdmQus/vgFa79+RyQSITkwYJdXJpOhUqnw1y/fsrf2O+HUaxhdXadHQNd1FH2N/eVnJBIJotHoMZtYLIaqquj/LMPuqu8caGutKIpdVu3Ky6udEzPIwX3dUqT0/0n1Kg7fNmaQ/9slCSCEPBMS1rXcmpqYjZADXMxsFC4Xad2Y5HIZEonORyvA9naFlZVnLZ+ZjYnA0Rc0zEnFNBjhcGsWBChS/g3oSMICn9kovGUuWfl1tDWTQMNLc2rf4Yvp8v12kXCAv8Hh3HJvTju059bobN8etCLhAH/dGeIjBFq35+3EJKYCUVO1Yrr80EnCAT5qgtdMlRaQm3Qk4EIiakUCcL55DR/gngm0IBEzSdwHrD2vcZBcnsF9EThCQjPVOu50DkIv/ID7JuAgYSWlVapWiel+wAGeA4jp5NmB4ap+AAAAAElFTkSuQmCC",
        iconSize: RCData.iconSize,
        iconAnchor: RCData.iconAnchor,
        popupAnchor: RCData.popupAnchor,
        labelAnchor: RCData.labelAnchor
    }),

};




var LayerM = Backbone.Model.extend({
    initialize: function() {

        // apply the backbone.select mixin (must also be done in the respective collection)
        Backbone.Select.Me.applyTo(this);
    },

});

var BaseLayersC = Backbone.Collection.extend({
    model: LayerM,
    initialize: function(models) {

        // apply the backbone.select mixin (must also be done in the respective model)
        Backbone.Select.One.applyTo(this, models);

        // listen for the events triggered by the select plugin
        this.on("select:one", this.addLayer);
        this.on("deselect:one", this.removeLayer);
    },

    // update the layers in the underlying leaflet map (tileLayer, gridlayer, etc)
    addLayer: function(layerM) {

        var leafletMap, layer = layerM.get("baseLayer");

        if (layer) {

            leafletMap = mapM.get("leafletMap");

            // if the leaflet map already has this layer, there's nothing to add
            if (!leafletMap || leafletMap.hasLayer(layer)) {
                return;
            }

            // add the tile layer and syncronize the "selected" attribute with the respective property in the model 
            leafletMap.addLayer(layer);
            layerM.set("selected", true);
        }
    },

    removeLayer: function(layerM) {

        var leafletMap, layer = layerM.get("baseLayer");

        if (layer) {

            leafletMap = mapM.get("leafletMap");

            // if the leaflet map does not have the layer, there's nothing to remove
            if (!leafletMap || !leafletMap.hasLayer(layer)) {
                return;
            }

            leafletMap.removeLayer(layer);
            layerM.set("selected", false);
        } 
    },


});

var baseLayersC = new BaseLayersC(RCData.baseLayers);

var SelectableM = Backbone.Model.extend({
    initialize: function() {

        // apply the backbone.select mixin (must also be done in the respective collection)
        Backbone.Select.Me.applyTo(this);
    },

});

var SelectableC = Backbone.Collection.extend({
    model: SelectableM,
    initialize: function(models) {

        // apply the backbone.select mixin (must also be done in the respective model)
        Backbone.Select.Many.applyTo(this, models);

        // listen for the events triggered by the select plugin and update the attribute in the model
        this.on("select:some", this.updateAttr);
        this.on("select:all", this.updateAttr);
        this.on("select:none", this.updateAttr);
    },

    updateAttr: function(diff){

        for(var i=0; i<diff.selected.length; i++){
            diff.selected[i].set("selected", true);
        }

        for(i=0; i<diff.deselected.length; i++){
            diff.deselected[i].set("selected", false);
        }
    }
});


var typesC = new SelectableC(RCData.definitions.type);

// initial selection for types (hardcoded at the beggining of this file; should be empty)
_.each(RCData.initial.types, function(typeId){

    typesC.get(typeId).select();
});

// for domains
var domainsC = new SelectableC(RCData.definitions.domain);

_.each(RCData.initial.domains, function(typeId){

    domainsC.get(typeId).select();
});




// TODO: initiativeM and initiativeC could be extended from a base class
var InitiativeM = Backbone.Model.extend({

    initialize: function() {

        // apply the backbone.select mixin (must also be done in the respective collection)
        Backbone.Select.Me.applyTo(this);
    },

    idAttribute: "slug"
});

var InitiativesC = Backbone.Collection.extend({

    initialize: function(models) {

        // apply the backbone.select mixin (must also be done in the respective model)
        Backbone.Select.One.applyTo(this, models);

        // listen for the events triggered by the select plugin
        this.on("select:one", this.selectInitiative);
        this.on("deselect:one", this.deselectInitiative);
    },

    model: InitiativeM,

    selectInitiative: function(model){

        model.set("selected", model.selected);
        var slug = model.get("slug");

        mapM.hideLabelAndResetScale(slug);
        
        // open the marker's popup; the call to this method is delayed because leaflet will automatically open the popup when the marker
        //  is clicked, and calling marker.openPopup explicitely seems to be closing it (it acts more like togglePopup())
        setTimeout(function(){
            mapM.openPopup(slug);
        }, 10); 

        // add css class
        cartografiaChannel.request("addClassSelected", slug);

        // flyTo animation
        var zoom = mapM.attributes.zoom;
        mapM.flyTo(initiativesC.get(slug).get("coordinates"), zoom >= 10 ? zoom : 9);

        var _layers = mapM.attributes.markersLayer._layers;
        var marker = _layers[RC.getMarker[slug]];

        if(!marker){
            return;
        }

        var updateZIndex = function(){

            var _zIndex = marker._zIndex;
            //console.log("zindex", _zIndex)
            if(_zIndex < RC.markersMaxZindex){
                RC.markersMaxZindex++;
                marker._zIndex = RC.markersMaxZindex;
            }

            marker._icon.style["zIndex"] = "" + RC.markersMaxZindex;
        };

        // this a bit hacky; we have to do it because the flyTo animation seems to be
        // resetting he zindex of the marker while it lasts;
        // we are taking into account that the duration for the 
        // flyTo animation is 1200ms; note that bind a callback to the 'moveend'
        // with .once will not work because that event is fired at the beggining of the
        // animation
        // TODO: report this bug in github

        setTimeout(updateZIndex, 1210);
        setTimeout(updateZIndex, 1220);
        setTimeout(updateZIndex, 1230);
        setTimeout(updateZIndex, 1240);

        this.selectTimestamp = (new Date()).getTime();
        RC.updateUrl();
    },

    deselectInitiative: function(model){

        model.set("selected", model.selected);
        var slug = model.get("slug");

        // remove css class
        cartografiaChannel.request("removeClassSelected", slug);
        RC.updateUrl();
    },

    parse: function(array){


        // array = _.filter(array, function(obj){
        //     return obj.name.toLowerCase().indexOf("biovilla")>=0;
        // });
        

        // array is the raw data coming from the server; here we add the missing data;
        for(var i=0; i<array.length; i++){

            // 1. add the human-readable type informations
            var typeM = typesC.get(array[i]["typeId"]);
            if(typeM){
                array[i]["typeTitle"] = typeM.get("title").pt;
                array[i]["typeTitleSlug"] =  slug(typeM.get("title").pt, {lower: true});
                array[i]["typeDescription"] =  typeM.get("description").pt;

            }

            // 2. add the slugified version of type other 
            array[i]["typeOther"] = array[i]["typeOther"] || "";
            array[i]["typeOtherSlug"] = slug(array[i]["typeOther"], {lower: true});

            /*
            // 3. create the geoJson object for this initiative
            array[i]["geoJson"] = {
                type: "Feature",
                properties: {
                    id: array[i]["id"],
                    name: array[i]["name"],
                    typeId: array[i]["typeId"],
                    typeTitle: array[i]["typeTitle"],
                    typeDescription: array[i]["typeDescription"],
                    typeOther: array[i]["typeOther"],
                    slug: array[i]["slug"],
                    description: array[i]["description"],
                    logo: array[i]["logo"],
                    coordinates: array[i]["coordinates"],
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": [array[i]["coordinates"][1], array[i]["coordinates"][0]]
                }
            };
            */

            // create the marker for this initiative
            this._createMarker(array[i]);
        }

        return array;
    },

    _createMarker: function(obj){

        var marker = L.marker(obj.coordinates, {
            icon: iconsC[obj.typeId] || iconsC["other"],
        });
        marker.slug = obj.slug;

        marker.bindLabel(obj.name);

        marker.on("add", function(e){

            var marker = e.target;
            if(marker._zIndex > RC.markersMaxZindex){
                RC.markersMaxZindex = marker._zIndex;
            }

            RC.getMarker[marker.slug] = marker["_leaflet_id"];
        });
        
        marker.on("mouseover", function(e){

            if(RC.mapIsMoving){
                return;
            }

            var marker = e.target;
            var _zIndex = marker._zIndex;
            if(_zIndex < RC.markersMaxZindex){
                RC.markersMaxZindex++;
                marker._zIndex = RC.markersMaxZindex;
            }

            marker._icon.style["zIndex"] = RC.markersMaxZindex;
            marker._icon.style["transition"] = "transform 0.2s";
            marker._icon.style["transform-origin"] = "center bottom";
            marker._icon.style["transform"] = marker._icon.style["transform"] + " scale(1.1)";

            // increase the zindex of the label
            marker.label._container.style["zIndex"] = RC.markersMaxZindex;
        });
        
        marker.on("mouseout", function(e){

            var marker = e.target;
            
            marker._icon.style["transition"] = "";
            var i = marker._icon.style["transform"].indexOf("scale(1.1)");
            if(i>=0){
                // restore the original values
                
                // transform-origin comes from .leaflet-zoom-animated, but it seems
                // we don't have to restore it
                //marker._icon.style["transform-origin"] = "0 0";  
                marker._icon.style["transform"] = marker._icon.style["transform"].substring(0, i);
            }
        });

        marker.on("click", function(e){
//debugger;
            var marker = e.target;
            var slug = marker.slug

            initiativesC.get(slug).select();

            cartografiaChannel.request("scrollTo", slug);
        });
/*
        marker.on("click_old", function(e){

            var marker = e.target;

            marker.hideLabel();
            marker._icon.style["transition"] = "";

            var i = marker._icon.style["transform"].indexOf("scale(1.1)");
            if(i>=0){
                // restore the original values
                
                // transform-origin comes from .leaflet-zoom-animated, but it seems
                // we don't have to restore it
                //marker._icon.style["transform-origin"] = "0 0";  
                marker._icon.style["transform"] = marker._icon.style["transform"].substring(0, i);
            }

            var zoom = mapM.attributes.leafletMap._zoom;
            mapM.flyTo(e.latlng, zoom >= 10 ? zoom : 9);

            var slug = marker.feature.properties.slug;
            cartografiaChannel.request("scrollTo", slug);
        });
*/
        var popupContents = RC.popupTemplate({
            url: "/iniciativas/" + obj.slug,
            name: obj.name
        });

        marker.bindPopup(popupContents);

        marker.on("popupclose", function(e){

            var marker = e.target;
            var slug = marker.slug;

            initiativesC.deselect(initiativesC.get(slug));
        });
/*
*/
        obj.marker = marker;
    },

    updateVisibility: function(methodName){

        var refresh = true;
        if(methodName){
            refresh = this[methodName]();
        }
        else{
            // note that the refresh status only matters for _updateInVisibleBounds method;
            // the other always returns true (because we always want to show the loading view 
            // after the button "apply filters" button is clicked
            this._updateInFilters();
            refresh = this._updateInVisibleBounds();
        }

        return refresh;
    },

    _updateInVisibleBounds: function(){

        var model, coordinates, point, inVisibleBounds;
        var refresh = false, leafletMap = mapM.attributes.leafletMap;

        for(var i=0, l=this.models.length; i<l; i++){

            model = this.models[i];

            // if the model is not visible by the filters, don't even bother
            if(!model.attributes.inFilters){
                continue;
            }

            point = leafletMap.latLngToContainerPoint(model.attributes.coordinates);

            // update the attribute in the initiative model; we don't use .set for performance reasons
            inVisibleBounds = RC.visibleBounds.contains(point) ? true : false;

            // we should refresh the list only if there are changes in the visibility of at least 1 marker
            if(inVisibleBounds!==model.attributes.inVisibleBounds){
                refresh = true;
            }

            model.attributes.inVisibleBounds = inVisibleBounds;
        }

        return refresh;
    },

    _updateInFilters: function(options){

        var refresh = true, selectedTypes = [], selectedDomains = [];

        for(var key in typesC.selected){
            selectedTypes.push(typesC.selected[key].attributes.id);
        }

        for(var key in domainsC.selected){
            selectedDomains.push(domainsC.selected[key].attributes.id);
        }

        var model, typeId, domains, search;
        var inSelectedTypes, inSelectedDomains, inSearch;
        for(i=0, l=this.models.length; i<l; i++){
            model = this.models[i];

            typeId = model.attributes.typeId;    
            inSelectedTypes = selectedTypes.length === 0 ? true : _.contains(selectedTypes, typeId);

            domains = model.attributes.domains;
            inSelectedDomains = selectedDomains.length === 0 ? true : (_.intersection(selectedDomains, domains).length > 0);
            
            search = RC.searchText;

            // search for the given text in the initiative's name and type
            inSearch = (model.attributes.name.toLowerCase() 
                        + model.attributes.slug 
                        + model.attributes.typeTitle.toLowerCase()
                        + model.attributes.typeTitleSlug
                        + model.attributes.typeOther.toLowerCase()
                        + model.attributes.typeOtherSlug
                        )
                        .indexOf(search) >= 0;

            model.attributes.inFilters = inSelectedTypes && inSelectedDomains && inSearch;
        }

        // here we always want to refresh (even if the filtered markers stay the same)
        return refresh;
    },

});

var initiativesC = new InitiativesC();
initiativesC.reset(RCData.initiatives, { parse: true });



var MapM = Backbone.Model.extend({
    initialize: function(){

        this.on("change:zoom", this._setZoom);
        this.on("change:center", this._setCenter);
    },

    // define this method using debounce as otherwise it would be
    // executed 2 times when the map interaction is a change in the zoom 
    // (which changes both the zoom and the center)

    updateInitiativesVisibility: _.debounce(function(){
        
        var refresh = initiativesC.updateVisibility("_updateInVisibleBounds")
        return refresh;
    }, 50, true),

    // sync the "zoom" attribute in the model with the zoom value in the actual leaflet map
    _setZoom: function(model, newZoom){

        if(!this.attributes.leafletMap){
            return;
        }

        var leafletZoom = this.attributes.leafletMap.getZoom();
        if(this.attributes.zoom!==leafletZoom){
            //console.log("mapM._setZoom @ " + Date.now());
            this.attributes.leafletMap.setView(this.attributes.center, this.attributes.zoom);
        }
        RC.updateUrl();
        
    },

    // sync the "center" attribute in the model with the center value in the actual leaflet map
    _setCenter: function(model){

        if(!this.attributes.leafletMap){
            return;
        }

        var leafletCenter = this.attributes.leafletMap.getCenter();
        if(this.attributes.center.lat!==leafletCenter.lat ||
             this.attributes.center.lng!==leafletCenter.lng){
            //console.log("mapM._setCenter @ " + Date.now());
            this.attributes.leafletMap.setView(this.attributes.center, this.attributes.zoom);            
        }
        RC.updateUrl();
    },    


    flyTo: function(targetCenter, targetZoom, options){

        var defaultOptions = {
            duration: 1.2,
            easeLinearity: 0.1
        };

        this.attributes.leafletMap.flyTo(targetCenter, targetZoom || 11, _.extend(defaultOptions, options));
    },

    addZoomControl: function(options) {

        var defaultOptions = {
            position: "topright"
            //position: "bottomright",
        };

        var zoomControl = L.control.zoom(_.extend(defaultOptions, options));
        this.get("leafletMap").addControl(zoomControl);
    },

    addScaleControl: function(options) {

        var defaultOptions = {
            position: "bottomright",
            imperial: false,
            maxWidth: 130
        };

        var scaleControl = L.control.scale(_.extend(defaultOptions, options));
        this.get("leafletMap").addControl(scaleControl);
    },

    addMenuControl: function(options) {

        var defaultOptions = {
            position: "topleft"
        };

        if(!options.view.model){
            options.view.model = this;
        }
        options.view.render();

        var menuControl = new L.Control.BackboneView(_.extend(defaultOptions, options));
        this.get("leafletMap").addControl(menuControl);
    },

    addMapEvents: function(){

        var leafletMap = this.get("leafletMap");
        leafletMap.on("click", function(e){
            //debugger;
            console.log(e.containerPoint)
            console.log(e.latlng)
            console.log(leafletMap.containerPointToLatLng(e.containerPoint))

        }, this);

        leafletMap.on("movestart", function(){
            RC.mapIsMoving = true;
        });

        //leafletMap.on("moveend", _.debounce(this.updateModelAttrs, 10), this);
        //leafletMap.on("moveend", this.updateModelAttrs, this);

        function showList(){
            RC.mapIsMoving = false;
            this.updateModelAttrs();
            var refresh = this.updateInitiativesVisibility();
            if(refresh){
                //delay = (Date.now() - initiativesC.selectTimestamp < 2000) ? 0 : "short";
                delay = "short";
                cartografiaChannel.request("showList", {delay: delay});
            }
            
        }
        // leafletMap.on("dragend", showList, this);
        // leafletMap.on("zoomend", showList, this);
        leafletMap.on("moveend", showList, this);


    },

    createMap: function(elem){

        // crate the leaflet map in the correct div
        this.set("leafletMap", L.map(elem, {
            zoomControl: false,
            attributionControl: false,
            zoom:    this.get("zoom"),
            maxZoom: this.get("maxZoom"),
            minZoom: this.get("minZoom"),
            center:  this.get("center"),
        }));
    },

    initializeMap: function(options){

        // selected default base map (tile layer);

        // if the "baseLayer" key is given in the query string, it will selected it in the baseLayersC
        var initialBaseLayer = baseLayersC.selected;
        if(initialBaseLayer){

            // deselect and select again to trigger the code that actually adds it to the leaflet map
            initialBaseLayer.deselect();
            initialBaseLayer.select();
        }
        else{
            baseLayersC.get(RCData.initial.baseLayer).select();    
        }



        this.addMapEvents();

        this.addZoomControl();
        this.addScaleControl();

        this.addMenuControl({
            view: new MenuLV({ model: this})
        });
        this.set("menuOpen", true);

        // we have an instance of L.LayerGroup in the map model, but it is not added to the map yet
        var leafletMap = this.get("leafletMap"),
            markersLayer = this.get("markersLayer");


        leafletMap.addLayer(markersLayer);
    },

    updateMarkers2: function(options){


        // ids of the initiatives that are currently in the map
        var initiativesIds = [];
        var leafletIds = [];
        var markersGroup = this.attributes.markersLayer;

        var _layers = markersGroup._layers;

        for(var key in _layers){
            leafletIds.push(key);
            initiativesIds.push(_layers[key].slug);
        }
        
        var push, model, i, j;
        var l = leafletIds.length;
//debugger;
        for(i=0; i<initiativesC.models.length; i++){
            model = initiativesC.models[i];

            // this initiative should be added to the map (if it isn't already)
            //if(model.attributes.inVisibleBounds && model.attributes.inFilters){
            if(model.attributes.inFilters){

                // verify if this initiative is already in the map; if not, add it
                push = true;
                for(j=0; j<l; j++){
                    if(initiativesIds[j]===model.attributes.slug){
                        push = false;
                        break;
                    }
                }

                if(push){

                    //debugger
                    markersGroup.addLayer(model.attributes.marker);
                }
            }

            // this initiative should be removed from the map (if it isn't already)
            else{
                //debugger;
                for(j=0; j<l; j++){

                    // verify if this initiative is in the map; if so, remove it
                    if(initiativesIds[j]===model.attributes.slug){
                        //debugger;
                        markersGroup.removeLayer(leafletIds[j]);
                        break;
                    }
                }
            }
        }
        //debugger;

    },

    // the "center" and "zoom" attributes in the model should be in sync with the leaflet map
    updateModelAttrs: function(){
//debugger;
        var leafletMap = this.attributes.leafletMap;
        var leafletZoom = leafletMap.getZoom(), leafletCenter = leafletMap.getCenter();

        if(this.attributes.zoom !== leafletZoom){
            console.log("mapIV.updateModel (zoom) @ " + Date.now());
            this.set("zoom", leafletZoom);
        }

        if(this.attributes.center.lat !== leafletCenter.lat || 
            this.attributes.center.lng !== leafletCenter.lng){
            console.log("mapIV.updateModel (center) @ " + Date.now());
            this.set("center", leafletCenter);
        }
        
    },


    openPopup: function(slug){

        var _layers = this.attributes.markersLayer._layers;
        var marker = _layers[RC.getMarker[slug]];

        if(!marker){
            return;
        }

        if(!marker.isPopupOpen()){
            marker.openPopup();    
        }

    },

    showLabelAndScale: function(slug){

        if(RC.mapIsMoving){
            return;
        }

        var _layers = this.attributes.markersLayer._layers;
        var marker = _layers[RC.getMarker[slug]];

        if(!marker){
            return;
        }

        var _zIndex = marker._zIndex;
        if(_zIndex < RC.markersMaxZindex){
            RC.markersMaxZindex++;
            marker._zIndex = RC.markersMaxZindex;
        }

        marker._icon.style["zIndex"] = RC.markersMaxZindex;
        marker._icon.style["transition"] = "transform 0.2s";
        marker._icon.style["transform-origin"] = "center bottom";
        marker._icon.style["transform"] = marker._icon.style["transform"] + " scale(1.1)";

        marker.showLabel();
        marker.label._container.style["zIndex"] = RC.markersMaxZindex;
    },

    hideLabelAndResetScale: function(slug){

        var _layers = this.attributes.markersLayer._layers;
        var marker = _layers[RC.getMarker[slug]];

        if(!marker){
            return;
        }

        marker.hideLabel();
        marker._icon.style["transition"] = "";
        var i = marker._icon.style["transform"].indexOf("scale(1.1)");

        if(i>=0){
            // restore the original values
            
            // transform-origin comes from .leaflet-zoom-animated, but it seems
            // we don't have to restore it
            //marker._icon.style["transform-origin"] = "0 0";  
            marker._icon.style["transform"] = marker._icon.style["transform"].substring(0, i);
        }

    }

});

var mapM = new MapM({
    center: L.latLng(RCData.initial.center.lat, RCData.initial.center.lng),
    zoom: RCData.initial.zoom,
    maxZoom: 13,
    minZoom: 5,
    menuOpen: false,  // we will toggle the menu when the map view is created
    markersLayer: L.featureGroup(null)
});







