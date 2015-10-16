
1) execute shp2pgsql
shp2pgsql -D -I -s 4326                 "/path/to/shape_file.shp" geo.shape_file | psql --dbname=150608

NOTE: the table name (in the "geo" schema) should be in lower case


2) create row in the shapes table

select * from shapes_create('{"srid":4326,"description":{"en":""},"schema_name":"geo","table_name":"shape_file","file_id":2145,"owner_id":1}')


3) style + legend + interactivity


4) export to mbtiles: 8-16 (or only 8-9 to begin)


5) copy-paste the .mml file from the project 

5a) re-use the following:

    bounds
    center
    minzoom
    maxzoom
    name
    description
    legend

5b) add these:
    id (same as the file name)
    isCirac: true,
    tiles (same as the file name)
    grids (same as the file name)
    template (copy from template_teaser.template_teaser)


    

    

--

shp2pgsql -D -I -s 4326      "/home/pvieira/cirac/SERVIDOR/CIRAC/outputs/mapas/vulnerabilidade/Indice-Vulnerabilidade/Map-SHP/BGRI/Indice-de-vulnerabilidade/cirac_vul_bgri_FVI_N.shp" geo.cirac_vul_bgri_fvi_n | psql --dbname=150608

select * from shapes_create('{"srid":4326,"description":{"en":""},"schema_name":"geo","table_name":"cirac_vul_bgri_fvi_n","file_id":1,"owner_id":1}')

--


shp2pgsql -D -I -s 4326  \
"/home/pvieira/cirac/SERVIDOR/CIRAC/outputs/mapas/vulnerabilidade/Indice-Vulnerabilidade/Map-SHP/BGRI/Indice-de-vulnerabilidade/Percentile-75/cirac_vul_bgri_FVI_75.shp" geo.cirac_vul_bgri_fvi_75 | psql --dbname=150608

select * from shapes_create('{"srid":4326,"description":{"en":""},"schema_name":"geo","table_name":"cirac_vul_bgri_fvi_75","file_id":1,"owner_id":1}')

--





Quando se selecciona um layer do cirac, já nao é possível voltar a nao ver esse layer