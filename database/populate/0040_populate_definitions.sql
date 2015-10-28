-- -- SEGMENT: types

select * from definitions_upsert('
    {
        "id": "type_permaculture",
        "title": {"pt": "Permacultura"},
        "description": {"pt": "Projectos integrais que visem a cultura permanente."}
    }
');

select * from definitions_upsert('
    {
        "id": "type_transition",
        "title": {"pt": "Transição"},
        "description": {"pt": "Iniciativas sociais que facilitem a transição da comunidade para uma visão positiva."}
    }
');

select * from definitions_upsert('
    {
        "id": "type_soil_nature",
        "title": {"pt": "Gestão da Terra e da Natureza"},
        "description": {"pt": "Projectos que visem a sustentabilidade da Terra de forma proactiva: Agroecologia, Jardinagem Bio-intensiva, Jardinagem Florestal, Banco de Sementes, Agricultura Biológica, Biodinâmica, Plantação Natural, Linha chave/Keyline para colecta de água, Gestão Holística de pastos (Holistic Management), Plantio em Sequencia Natural, Agrofloresta, Floresta baseada na natureza, Aquacultura Integrada, Colheita e caça selvagem, zonas de Reserva Natural, Pastagens Biodiversas, Recuperação de solos e ecossistemas, hortas comunitárias, hortas sociais"}
    }
');

select * from definitions_upsert('
    {
        "id": "type_construction",
        "title": {"pt": "Espaço Construído"},
        "description": {"pt": "Projectos inspiradores de arquitectura e construção sustentável: Planeamento solar passivo, Construção com material natural, Coleta e Reuso da Água, Bioarquitetura, Construções de abrigos na terra, Linguagem dos Padrões, Engenharia Ecológica."}
    }
');

select * from definitions_upsert('
    {
        "id": "type_tools",
        "title": {"pt": "Ferramentas e Tecnologias"},
        "description": {"pt": "Projectos e ferramentas de tecnologias criativas e sustentáveis: Reuso e Reciclagem criativa, Ferramentas Manuais, Bicicletas e bicicletas eléctricas, Fogão de lenha eficiente e de baixa poluição, Combustíveis de restos orgânicos, Gaseificação de madeira, Co-geração, Micro-hydro & Aero geradores, Cerca eléctrica de geração de energia renovável, Armazenagem de energia, Engenharia de Transição"}
    }
');

select * from definitions_upsert('
    {
        "id": "type_culture",
        "title": {"pt": "Cultura e Educação"},
        "description": {"pt": "Projectos que promovam uma nova consciência e inspirem uma nova cultura: Educação alternativa, Educação Waldorf, Arte e Música participativa, Ecologia social, Pesquisa através de Acção, Cultura de transição"}
    }
');

select * from definitions_upsert('
    {
        "id": "type_health",
        "title": {"pt": "Saúde e Bem-Estar Espiritual"},
        "description": {"pt": "Projecto que visem o cuidar das pessoas de forma preventiva: Medicina Complementar e Holística, Yoga, Tai Chi, Capoeira e outras, disciplinas de corpo/mente/espírito, Espírito do lugar, renascimento, cultural indígena, Morte Digna"}
    }
');

select * from definitions_upsert('
    {
        "id": "type_economy",
        "title": {"pt": "Economia e Finanças"},
        "description": {"pt": "Ferramentas financeiras que promovam a sustentabilidade económica: Redes de Trocas e Economia solidária, Economia solidária, Moeda local e regional, Rodovias específicas para carros cheios, boleias & Compartilhar o carro, Investimento Ético & Comércio Justo, WWOOFing & Redes similares, Mercados de Produtores & Agricultura apoiada na Comunidade (AAC), Cotas de Energia Cambiável, Análise dos Ciclos da Vida & Contabilidade Emergética"}
    }
');

select * from definitions_upsert('
    {
        "id": "type_community",
        "title": {"pt": "Uso da Terra e Comunidade"},
        "description": {"pt": "Projectos inspiradores e criadores de relações interdependentes: Eco-comunidades, Cooperativas e Associações comunitárias, Ecoaldeias e Co-habitações, Tecnologia de espaço aberto e Tomada de Decisão por Consenso, Título Nativo e Direito tradicional de uso, Agenda Local 21, Cidade pela retoma."}
    }
');




-- SEGMENT: domains

select * from definitions_upsert('
    {
        "id": "domain_agriculture",
        "title": {"pt": "Agricultura"},
        "description": {"pt": "Agricultura - biológica ou natural"}
    }
');

select * from definitions_upsert('
    {
        "id": "domain_husbandry",
        "title": {"pt": "Pecuária"},
        "description": {"pt": "Pecuária - criação biológica de animais"}
    }
');

select * from definitions_upsert('
    {
        "id": "domain_bioconstruction",
        "title": {"pt": "Bio-Construção"},
        "description": {"pt": "Bio-Construção - usar recursos naturais locais para a construção de edificações"}
    }
');

select * from definitions_upsert('
    {
        "id": "domain_ecotechnology",
        "title": {"pt": "Eco-Tecnologia"},
        "description": {"pt": "Eco-Tecnologia - que possam ser usadas para o desenvolvimento sustentável"}
    }
');

select * from definitions_upsert('
    {
        "id": "domain_art",
        "title": {"pt": "Arte"},
        "description": {"pt": "Arte - ligada à sustentabilidade"}
    }
');

select * from definitions_upsert('
    {
        "id": "domain_education",
        "title": {"pt": "Educação"},
        "description": {"pt": "Educação - desde acções de formação isoladas até projectos pedagógicos continuados e plurianuais, que inclua a componente da natureza e que promovam o desenvolvimento holístico do ser humano"}
    }
');

select * from definitions_upsert('
    {
        "id": "domain_health",
        "title": {"pt": "Saúde"},
        "description": {"pt": "Saúde - prevenção e tratamentos naturais"}
    }
');

select * from definitions_upsert('
    {
        "id": "domain_spirituality",
        "title": {"pt": "Espiritualidade"},
        "description": {"pt": "Espiritualidade - práticas espirituais com peso na vida da comunidade e na sua identidade"}
    }
');

select * from definitions_upsert('
    {
        "id": "domain_economy",
        "title": {"pt": "Economia alternativa"},
        "description": {"pt": "Economia alternativa - promoção e desenvolvimento de sistemas económicos alternativos à economia formal, como sistemas de troca directa, bancos de tempo ou moedas locais"}
    }
');

select * from definitions_upsert('
    {
        "id": "domain_sharing",
        "title": {"pt": "Partilha de terra ou equipamentos"},
        "description": {"pt": "Partilha de terra ou equipamentos - bancos de terras ou partilha de equipamentos"}
    }
');

select * from definitions_upsert('
    {
        "id": "domain_tools",
        "title": {"pt": "Ferramentas Sociais"},
        "description": {"pt": "Ferramentas sociais - uso de metodologias e ferramentas que visam o equilíbrio e harmonia social do projecto"}
    }
');


-- SEGMENT: targets


select * from definitions_upsert('
    {
        "id": "target_children",
        "title": {"pt": "Crianças"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "target_teenagers",
        "title": {"pt": "Adolescentes"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "target_adults",
        "title": {"pt": "Adultos"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "target_seniors",
        "title": {"pt": "Idosos"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "target_families",
        "title": {"pt": "Famílias"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "target_handicapped",
        "title": {"pt": "Pessoas com deficiência"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "target_special_need_children",
        "title": {"pt": "Crianças com necessidades educativas especiais"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "target_general",
        "title": {"pt": "Geral"},
        "description": {"pt": ""}
    }
');


-- SEGMENT: scopes

select * from definitions_upsert('
    {
        "id": "scope_urban",
        "title": {"pt": "Urbano"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "scope_rural",
        "title": {"pt": "Rural"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "scope_mixed",
        "title": {"pt": "Misto"},
        "description": {"pt": ""}
    }
');


-- SEGMENT: visitors

select * from definitions_upsert('
    {
        "id": "visitors_yes",
        "title": {"pt": "Sim"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "visitors_no",
        "title": {"pt": "Não"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "visitors_confirmation",
        "title": {"pt": "Sujeito a confirmação após contacto"},
        "description": {"pt": ""}
    }
');


-- SEGMENT: status

select * from definitions_upsert('
    {
        "id": "status_alive",
        "title": {"pt": "Vivo"},
        "description": {"pt": ""}
    }
');

select * from definitions_upsert('
    {
        "id": "status_inactive",
        "title": {"pt": "Inactivo"},
        "description": {"pt": ""}
    }
');

