## Introduction

Postgres

all interactions with the database (that is, read, create, update and delete data) are executed via postgres functions (which are known as "stored procedures" or "stored functions" in other database systems, such as mysql).

Example

The initial data (from the old database) is loaded via curl.

## Tables

    - users
    - initiatives
    - users_initiatives
    - definitions
    - events

### users

    - id SERIAL PK
    - email TEXT
    - name TEXT
    - bio JSONB
    - photo TEXT
    - url TEXT

## initiatives 

The domains field should be (in principle) one of the 9 predefined values (present in the definitions table). However the user might also choose to give a new type (not present in the list). In that case type_id will have the id of the "none" type, and typeOther will be the column where the type is actually defined. These field are exclusive (if type_id is set to the "none" type, type_other should defined; if type_id is set to some type, type_other should be empty or null).

The domains_other field is similar, however here we can have a bunch of domains (in the definitions_initiatives link table) and still have something in the domains_other column.

The same happens for target_other.





    - id INT PK
    - name TEXT
    - description TEXT
    - type_id INT FK (definitions)
    - type_other TEXT
    [- domains INT FK (definitions)]
    - domains_other TEXT,
    - url TEXT
    - contact_name TEXT
    - email TEXT
    - phone TEXT
    - contact_other TEXT
    - logo TEXT
    - street TEXT
    - city TEXT
    - postal_code TEXT
    - coordinates JSONB (array)
    - promoter TEXT
    - start_date TIMESTAMPTZ
    - registry_date TIMESTAMPTZ
    - update_date TIMESTAMPTZ
    - visitors INT FK (definitions)
    - group_size JSON (array)
    - scope_area INT FK (definitions)
    [- target INT FK (definitions)]
    - target_other TEXT
    - influence TEXT
    - physical_area TEXT
    - video_url TEXT
    - doc_url TEXT

### users_initiatives

Link table. If a pair (user, initiative) is present in this table it means the user is responsible for the project (can change the data for that project)

    * id SERIAL PK
    * user_id INT FK
    * initiative_id INT FK

Note: When the database is initialized there are no users (apart from the moderators). An email will be sent to the available contacts with a secret URL, inviting the person to create an account. If accepted, that new user will immediatelly be associated with the existing iniative


### definitions

Contains the name and respective definitions. The "segment" column indicates the group where a given definition belongs. We have the following segments/groups and respective names.
    segment "type"
        Permacultura
        Projectos integrais que visem a cultura permanente.
        
        Transição
        Iniciativas sociais que facilitem a transição da comunidade para uma visão positiva.

        Gestão da Terra e da Natureza
        Projectos que visem a sustentabilidade da Terra de forma proactiva: Agroecologia, Jardinagem Bio-intensiva, Jardinagem Florestal, Banco de Sementes, Agricultura Biológica, Biodinâmica, Plantação Natural, Linha chave/Keyline para colecta de água, Gestão Holística de pastos (Holistic Management), Plantio em Sequencia Natural, Agrofloresta, Floresta baseada na natureza, Aquacultura Integrada, Colheita e caça selvagem, zonas de Reserva Natural, Pastagens Biodiversas, Recuperação de solos e ecossistemas, hortas comunitárias, hortas sociais

        Espaço Construído
        Projectos inspiradores de arquitectura e construção sustentável: Planeamento solar passivo, Construção com material natural, Coleta e Reuso da Água, Bioarquitetura, Construções de abrigos na terra, Linguagem dos Padrões, Engenharia Ecológica.

        Ferramentas e Tecnologias
        Projectos e ferramentas de tecnologias criativas e sustentáveis: Reuso e Reciclagem criativa, Ferramentas Manuais, Bicicletas e bicicletas eléctricas, Fogão de lenha eficiente e de baixa poluição, Combustíveis de restos orgânicos, Gaseificação de madeira, Co-geração, Micro-hydro & Aero geradores, Cerca eléctrica de geração de energia renovável, Armazenagem de energia, Engenharia de Transição

        Cultura e Educação
        Projectos que promovam uma nova consciência e inspirem uma nova cultura: Educação alternativa, Educação Waldorf, Arte e Música participativa, Ecologia social, Pesquisa através de Acção, Cultura de transição

        Saúde e Bem-Estar Espiritual
        Projecto que visem o cuidar das pessoas de forma preventiva: Medicina Complementar e Holística, Yoga, Tai Chi, Capoeira e outras, disciplinas de corpo/mente/espírito, Espírito do lugar, renascimento, cultural indígena, Morte Digna

        Economia e Finanças
        Ferramentas financeiras que promovam a sustentabilidade económica: Redes de Trocas e Economia solidária, Economia solidária, Moeda local e regional, Rodovias específicas para carros cheios, boleias & Compartilhar o carro, Investimento Ético & Comércio Justo, WWOOFing & Redes similares, Mercados de Produtores & Agricultura apoiada na Comunidade (AAC), Cotas de Energia Cambiável, Análise dos Ciclos da Vida & Contabilidade Emergética

        Uso da Terra e Comunidade
        Projectos inspiradores e criadores de relações interdependentes: Eco-comunidades, Cooperativas e Associações comunitárias, Ecoaldeias e Co-habitações, Tecnologia de espaço aberto e Tomada de Decisão por Consenso, Título Nativo e Direito tradicional de uso, Agenda Local 21, Cidade pela retoma.

    segment "domain"
        Agricultura
        Agricultura - biológica ou natural; 

        Pecuária
        Pecuária - criação biológica de animais

        Bio-Construção
        Bio-Construção - usar recursos naturais locais para a construção de edificações

        Eco-Tecnologia
        Eco-Tecnologia - que possam ser usadas para o desenvolvimento sustentável;

        Arte
        Arte - ligada à sustentabilidade;

        Educação
        Educação - desde acções de formação isoladas até projectos pedagógicos continuados e plurianuais, que inclua a componente da natureza e que promovam o desenvolvimento holístico do ser humano; 

        Saúde
        Saúde - prevenção e tratamentos naturais;

        Espiritualidade
        Espiritualidade - práticas espirituais com peso na vida da comunidade e na sua identidade;

        Economia alternativa
        Economia alternativa - promoção e desenvolvimento de sistemas económicos alternativos à economia formal, como sistemas de troca directa, bancos de tempo ou moedas locais;

        Partilha de terra ou equipamentos
        Partilha de terra ou equipamentos - bancos de terras ou partilha de equipamentos;

        Ferramentas Sociais
        Ferramentas sociais - uso de metodologias e ferramentas que visam o equilíbrio e harmonia social do projecto. 

    segment "target"
        Crianças
        Adolescentes
        Adultos
        Idosos
        Famílias
        Pessoas com deficiência
        Crianças com necessidades educativas especiais
        Geral
    segment "scope"
        Urbano
        Rural
        Misto
    segment "visitors"
        Sim
        Não
        Sujeito a confirmação após contacto
    segment "status"
        Vivo
        Terminado


    - id SERIAL PK
    - segment TEXT
    - name JSONB
    - desc JSONB

### initiatives_definitions

Link table. 

    - id SERIAL PK
    - definition_id INT FK
    - initiative_id INT FK

### events

    - id SERIAL PK
    - name JSONB
    - desc JSONB
    - start_date TIMESTAMPTZ
    - end_date TIMESTAMPTZ
    - address TEXT
    - postal_code TEXT
    - city TEXT
    - files JSONB (array)
    - url TEXT
    - coordinates JSONB (array)
