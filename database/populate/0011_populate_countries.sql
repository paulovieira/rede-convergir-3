BEGIN;

COPY countries (name, code, id) FROM stdin DELIMITER '|';
Afghanistan|AF|4
Albania|AL|8
Algeria|DZ|12
American Samoa|AS|16
Andorra|AD|20
Angola|AO|24
Anguilla|AI|660
Antarctica|AQ|10
Antigua and Barbuda|AG|28
Argentina|AR|32
Armenia|AM|51
Aruba|AW|533
Australia|AU|36
Austria|AT|40
Azerbaijan|AZ|31
Bahamas|BS|44
Bahrain|BH|48
Bangladesh|BD|50
Barbados|BB|52
Belarus|BY|112
Belgium|BE|56
Belize|BZ|84
Benin|BJ|204
Bermuda|BM|60
Bhutan|BT|64
Bolivia|BO|68
Bosnia and Herzegowina|BA|70
Botswana|BW|72
Bouvet Island|BV|74
Brazil|BR|76
British Indian Ocean Territory|IO|86
Brunei Darussalam|BN|96
Bulgaria|BG|100
Burkina Faso|BF|854
Burundi|BI|108
Cambodia|KH|116
Cameroon|CM|120
Cape Verde|CV|132
Cayman Islands|KY|136
Central African Republic|CF|140
Chad|TD|148
Chile|CL|152
China|CN|156
Christmas Island|CX|162
Cocos (Keeling) Islands|CC|166
Colombia|CO|170
Comoros|KM|174
Congo|CG|178
Congo, The Democratic Republic of the|CD|180
Cook Islands|CK|184
Costa Rica|CR|188
Cote D'Ivoire|CI|384
Croatia (local name: Hrvatska)|HR|191
Cuba|CU|192
Cyprus|CY|196
Czech Republic|CZ|203
Denmark|DK|208
Djibouti|DJ|262
Dominica|DM|212
Dominican Republic|DO|214
East Timor|TP|626
Ecuador|EC|218
Egypt|EG|818
El Salvador|SV|222
Equatorial Guinea|GQ|226
Eritrea|ER|232
Estonia|EE|233
Ethiopia|ET|231
Falkland Islands (Malvinas)|FK|238
Faroe Islands|FO|234
Fiji|FJ|242
Finland|FI|246
France|FR|250
France, Metropolitan|FX|249
French Guiana|GF|254
French Polynesia|PF|258
French Southern Territories|TF|260
Gabon|GA|266
Gambia|GM|270
Georgia|GE|268
Germany|DE|276
Ghana|GH|288
Gibraltar|GI|292
Greece|GR|300
Greenland|GL|304
Grenada|GD|308
Guadeloupe|GP|312
Guam|GU|316
Guatemala|GT|320
Guinea|GN|324
Guinea-Bissau|GW|624
Guyana|GY|328
Haiti|HT|332
Heard and McDonald Islands|HM|334
Holy See (Vatican City State)|VA|336
Honduras|HN|340
Hong Kong|HK|344
Hungary|HU|348
Iceland|IS|352
India|IN|356
Indonesia|ID|360
Iran (Islamic Republic of)|IR|364
Iraq|IQ|368
Ireland|IE|372
Israel|IL|376
Italy|IT|380
Jamaica|JM|388
Japan|JP|392
Jordan|JO|400
Kazakhstan|KZ|398
Kenya|KE|404
Kiribati|KI|296
Korea, Democratic People's Republic of|KP|408
Korea, Republic of|KR|410
Kuwait|KW|414
Kyrgyzstan|KG|417
Lao People's Democratic Republic|LA|418
Latvia|LV|428
Lebanon|LB|422
Lesotho|LS|426
Liberia|LR|430
Libyan Arab Jamahiriya|LY|434
Liechtenstein|LI|438
Lithuania|LT|440
Luxembourg|LU|442
Macau|MO|446
Macedonia, the Former Yugoslav Republic of|MK|807
Madagascar|MG|450
Malawi|MW|454
Malaysia|MY|458
Maldives|MV|462
Mali|ML|466
Malta|MT|470
Marshall Islands|MH|584
Martinique|MQ|474
Mauritania|MR|478
Mauritius|MU|480
Mayotte|YT|175
Micronesia, Federated States of|FM|583
Moldova, Republic of|MD|498
Monaco|MC|492
Mongolia|MN|496
Montserrat|MS|500
Morocco|MA|504
Mozambique|MZ|508
Myanmar|MM|104
Namibia|NA|516
Nauru|NR|520
Nepal|NP|524
Netherlands|NL|528
Netherlands Antilles|AN|530
New Caledonia|NC|540
New Zealand|NZ|554
Nicaragua|NI|558
Niger|NE|562
Nigeria|NG|566
Niue|NU|570
Norfolk Island|NF|574
Northern Mariana Islands|MP|580
Norway|NO|578
Oman|OM|512
Pakistan|PK|586
Palau|PW|585
Palestinian Territory, Occupied|PS|275
Panama|PA|591
Papua New Guinea|PG|598
Paraguay|PY|600
Peru|PE|604
Philippines|PH|608
Pitcairn|PN|612
Poland|PL|616
Portugal|PT|620
Puerto Rico|PR|630
Qatar|QA|634
Reunion|RE|638
Romania|RO|642
Russian Federation|RU|643
Rwanda|RW|646
Saint Kitts and Nevis|KN|659
Saint Lucia|LC|662
Saint Vincent and the Grenadines|VC|670
Samoa|WS|882
San Marino|SM|674
Sao Tome and Principe|ST|678
Saudi Arabia|SA|682
Senegal|SN|686
Serbia and Montenegro|CS|891
Seychelles|SC|690
Sierra Leone|SL|694
Singapore|SG|702
Slovakia (Slovak Republic)|SK|703
Slovenia|SI|705
Solomon Islands|SB|90
Somalia|SO|706
South Africa|ZA|710
South Georgia and the South Sandwich Islands|GS|239
Spain|ES|724
Sri Lanka|LK|144
St. Helena|SH|654
St. Pierre and Miquelon|PM|666
Sudan|SD|736
Suriname|SR|740
Svalbard and Jan Mayen Islands|SJ|744
Swaziland|SZ|748
Sweden|SE|752
Switzerland|CH|756
Syrian Arab Republic|SY|760
Taiwan, Province of China|TW|158
Tajikistan|TJ|762
Tanzania, United Republic of|TZ|834
Thailand|TH|764
Timor-Leste|TL|626
Togo|TG|768
Tokelau|TK|772
Tonga|TO|776
Trinidad and Tobago|TT|780
Tunisia|TN|788
Turkey|TR|792
Turkmenistan|TM|795
Turks and Caicos Islands|TC|796
Tuvalu|TV|798
Uganda|UG|800
Ukraine|UA|804
United Arab Emirates|AE|784
United States Minor Outlying Islands|UM|581
Uruguay|UY|858
Uzbekistan|UZ|860
Vanuatu|VU|548
Venezuela|VE|862
Viet Nam|VN|704
Virgin Islands (British)|VG|92
Virgin Islands (U.S.)|VI|850
Wallis and Futuna Islands|WF|876
Western Sahara|EH|732
Yemen|YE|887
Yugoslavia|YU|891
Zambia|ZM|894
Zimbabwe|ZW|716
Canada|CA|124
Mexico|MX|484
United Kingdom|GB|826
United States|US|840
\.

COMMIT;

ANALYZE countries;
