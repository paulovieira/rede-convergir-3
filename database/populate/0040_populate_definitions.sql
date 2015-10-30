BEGIN;

COPY definitions (id, title, description) FROM stdin DELIMITER '|';
type_permaculture|{"pt": "Permacultura"}|{"pt": "Projectos integrais que visem a cultura permanente."}
type_transition|{"pt": "Transição"}|{"pt": "Iniciativas sociais que facilitem a transição da comunidade para uma visão positiva."}
type_soil_nature|{"pt": "Gestão da Terra e da Natureza"}|{"pt": "Projectos que visem a sustentabilidade da Terra de forma proactiva: Agroecologia, Jardinagem Bio-intensiva, Jardinagem Florestal, Banco de Sementes, Agricultura Biológica, Biodinâmica, Plantação Natural, Linha chave/Keyline para colecta de água, Gestão Holística de pastos (Holistic Management), Plantio em Sequencia Natural, Agrofloresta, Floresta baseada na natureza, Aquacultura Integrada, Colheita e caça selvagem, zonas de Reserva Natural, Pastagens Biodiversas, Recuperação de solos e ecossistemas, hortas comunitárias, hortas sociais"}
type_construction|{"pt": "Espaço Construído"}|{"pt": "Projectos inspiradores de arquitectura e construção sustentável: Planeamento solar passivo, Construção com material natural, Coleta e Reuso da Água, Bioarquitetura, Construções de abrigos na terra, Linguagem dos Padrões, Engenharia Ecológica."}
type_tools|{"pt": "Ferramentas e Tecnologias"}|{"pt": "Projectos e ferramentas de tecnologias criativas e sustentáveis: Reuso e Reciclagem criativa, Ferramentas Manuais, Bicicletas e bicicletas eléctricas, Fogão de lenha eficiente e de baixa poluição, Combustíveis de restos orgânicos, Gaseificação de madeira, Co-geração, Micro-hydro & Aero geradores, Cerca eléctrica de geração de energia renovável, Armazenagem de energia, Engenharia de Transição"}
type_culture|{"pt": "Cultura e Educação"}|{"pt": "Projectos que promovam uma nova consciência e inspirem uma nova cultura: Educação alternativa, Educação Waldorf, Arte e Música participativa, Ecologia social, Pesquisa através de Acção, Cultura de transição"}
type_health|{"pt": "Saúde e Bem-Estar Espiritual"}|{"pt": "Projecto que visem o cuidar das pessoas de forma preventiva: Medicina Complementar e Holística, Yoga, Tai Chi, Capoeira e outras, disciplinas de corpo/mente/espírito, Espírito do lugar, renascimento, cultural indígena, Morte Digna"}
type_economy|{"pt": "Economia e Finanças"}|{"pt": "Ferramentas financeiras que promovam a sustentabilidade económica: Redes de Trocas e Economia solidária, Economia solidária, Moeda local e regional, Rodovias específicas para carros cheios, boleias & Compartilhar o carro, Investimento Ético & Comércio Justo, WWOOFing & Redes similares, Mercados de Produtores & Agricultura apoiada na Comunidade (AAC), Cotas de Energia Cambiável, Análise dos Ciclos da Vida & Contabilidade Emergética"}
type_community|{"pt": "Uso da Terra e Comunidade"}|{"pt": "Projectos inspiradores e criadores de relações interdependentes: Eco-comunidades, Cooperativas e Associações comunitárias, Ecoaldeias e Co-habitações, Tecnologia de espaço aberto e Tomada de Decisão por Consenso, Título Nativo e Direito tradicional de uso, Agenda Local 21, Cidade pela retoma."}
domain_agriculture|{"pt": "Agricultura"}|{"pt": "Agricultura - biológica ou natural"}
domain_husbandry|{"pt": "Pecuária"}|{"pt": "Pecuária - criação biológica de animais"}
domain_bioconstruction|{"pt": "Bio-Construção"}|{"pt": "Bio-Construção - usar recursos naturais locais para a construção de edificações"}
domain_ecotechnology|{"pt": "Eco-Tecnologia"}|{"pt": "Eco-Tecnologia - que possam ser usadas para o desenvolvimento sustentável"}
domain_art|{"pt": "Arte"}|{"pt": "Arte - ligada à sustentabilidade"}
domain_education|{"pt": "Educação"}|{"pt": "Educação - desde acções de formação isoladas até projectos pedagógicos continuados e plurianuais, que inclua a componente da natureza e que promovam o desenvolvimento holístico do ser humano"}
domain_health|{"pt": "Saúde"}|{"pt": "Saúde - prevenção e tratamentos naturais"}
domain_spirituality|{"pt": "Espiritualidade"}|{"pt": "Espiritualidade - práticas espirituais com peso na vida da comunidade e na sua identidade"}
domain_economy|{"pt": "Economia alternativa"}|{"pt": "Economia alternativa - promoção e desenvolvimento de sistemas económicos alternativos à economia formal, como sistemas de troca directa, bancos de tempo ou moedas locais"}
domain_sharing|{"pt": "Partilha de terra ou equipamentos"}|{"pt": "Partilha de terra ou equipamentos - bancos de terras ou partilha de equipamentos"}
domain_tools|{"pt": "Ferramentas Sociais"}|{"pt": "Ferramentas sociais - uso de metodologias e ferramentas que visam o equilíbrio e harmonia social do projecto"}
target_children|{"pt": "Crianças"}|{"pt": ""}
target_teenagers|{"pt": "Adolescentes"}|{"pt": ""}
target_adults|{"pt": "Adultos"}|{"pt": ""}
target_seniors|{"pt": "Idosos"}|{"pt": ""}
target_families|{"pt": "Famílias"}|{"pt": ""}
target_handicapped|{"pt": "Pessoas com deficiência"}|{"pt": ""}
target_special_need_children|{"pt": "Crianças com necessidades educativas especiais"}|{"pt": ""}
target_general|{"pt": "Geral"}|{"pt": ""}
scope_urban|{"pt": "Urbano"}|{"pt": ""}
scope_rural|{"pt": "Rural"}|{"pt": ""}
scope_mixed|{"pt": "Urbano e Rural"}|{"pt": ""}
visitors_yes|{"pt": "Sim"}|{"pt": ""}
visitors_no|{"pt": "Não"}|{"pt": ""}
visitors_confirmation|{"pt": "Sujeito a confirmação após contacto"}|{"pt": ""}
status_alive|{"pt": "Ativo"}|{"pt": ""}
status_germinate|{"pt": "A germinar"}|{"pt": ""}
status_inactive|{"pt": "Inativo"}|{"pt": ""}
event_type_course|{"pt": "Formação"}|{"pt": ""}
event_type_seminar|{"pt": "Seminário"}|{"pt": ""}
event_type_meetings|{"pt": "Encontro"}|{"pt": ""}
\.

COMMIT;

ANALYZE definitions;
