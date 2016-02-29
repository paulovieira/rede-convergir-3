// JavaScript Document
function loadXMLDoc(dname)
{
var xmlhttp;
			if (window.XMLHttpRequest)
			  {// code for IE7+, Firefox, Chrome, Opera, Safari
			  xmlhttp=new XMLHttpRequest();
			  }
			else
			  {// code for IE6, IE5
			  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
			  }

		xmlhttp.open("GET",dname,false);
		xmlhttp.send();
		return xmlhttp.responseXML;
}
//new function
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
   });
    return vars;
}

var infos = [];

function initialize() {

	var mapDiv = document.getElementById('map_canvas');
  	var map = new google.maps.Map(mapDiv, {
    center: new google.maps.LatLng(39.6, -8),
    zoom: 6,
   panControl: false,
    zoomControl: true,
	zoomControlOptions: {
    style: google.maps.ZoomControlStyle.LARGE
  },
    scaleControl: true,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });
	
	var control = document.createElement('DIV');
        control.style.padding = '1px';
        control.style.width = '70px';
        control.style.textAlign = 'center';
        control.style.border = '1px solid #333';
        control.style.backgroundColor = '#069';
        control.style.cursor = 'pointer';
        control.style.color = '#fff';
        control.style.marginTop = '6px';
        control.style.fontSize = '9pt';
        control.style.fontWeight = 'bold';
        control.innerHTML = 'Mapa inicial';
        control.index = 1;
		
			google.maps.event.addDomListener(control, 'click', function() {
			map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
			var latlng = new google.maps.LatLng(39.6, -8);
			map.setCenter(latlng);
			zoomLevel = map.getZoom();
			map.setZoom(6);
					});
		 
		 map.controls[google.maps.ControlPosition.TOP_RIGHT].push(control);

	
	url_end = "?nocache=" + (new Date()).valueOf();

	xmlDoc=loadXMLDoc("/static/old/kml/db.xml"+url_end);
	x=xmlDoc.getElementsByTagName('project');
	var markers = [];
	//var projectids = [];
	
	//var infowindow = [];
	
	for (i=0;i<x.length;i++)
		{
			
			
			projectname=xmlDoc.getElementsByTagName("projectname")[i].childNodes[0].nodeValue.toUpperCase();
			projectid=xmlDoc.getElementsByTagName("projectid")[i].childNodes[0].nodeValue;
			
			
			projecttype=xmlDoc.getElementsByTagName("projecttype")[i].childNodes[0].nodeValue;
			lat=xmlDoc.getElementsByTagName("lat")[i].childNodes[0].nodeValue;
			lng=xmlDoc.getElementsByTagName("lng")[i].childNodes[0].nodeValue;
			
						
			
			
			
			if(projecttype=="Transição")
			{
				iconimg='/static/old/mapicons/transicao.png'
				tid=1
			}
			else if(projecttype=="Permacultura")
			{
				iconimg='/static/old/mapicons/permacultura.png'
				tid=2
			}
			else if(projecttype=="Gestão da Terra e da Natureza")
			{
				iconimg='/static/old/mapicons/gestaoterranatureza.png'
				tid=3
			}
			else if(projecttype=="Espaço Construído")
			{
				iconimg='/static/old/mapicons/espacoconstruido.png'
				tid=4
			}
			else if(projecttype=="Ferramentas e Tecnologias")
			{
				iconimg='/static/old/mapicons/eng-ecologica.png'
				tid=5
			}
			else if(projecttype=="Cultura e Educação")
			{
				iconimg='/static/old/mapicons/culturaeducacao.png'
				tid=6
			}
			else if(projecttype=="Saúde e Bem-Estar Espiritual")
			{
				iconimg='/static/old/mapicons/saudebemestar.png'
				tid=7
			}
			else if(projecttype=="Economia e Finanças")
			{
				iconimg='/static/old/mapicons/economiafinancas.png'
				tid=8
			}
			else if(projecttype=="Uso da Terra e Comunidade")
			{
				iconimg='/static/old/mapicons/terracomunidade.png'
				tid=9;
			}
			else
			{
				iconimg='/static/old/mapicons/outro.png'
				tid=10;
			}
			
			//var ptype = getUrlVars()["ptype"];//new var
			//debugger;
			//filter by type of project
			//ptype = {{ ctx.query.ptype }};

			if(typeof(ptype)!=='undefined' && ptype!=tid && ptype!=11 )
			{
			continue;
			}
			
			
			var latLng = new google.maps.LatLng(lat,lng);
			
			
			
			
			var marker = new google.maps.Marker({
				title: projectname+": projecto de "+projecttype,
				map: map,
				position: latLng,
				content: "<span style='color:#5f72c4; font-family:Arial, Helvetica, sans-serif; font-size:9pt;'>"+projectname+"</span><br /><span style='color:#000; font-family:Arial, Helvetica, sans-serif; font-size:9pt;'>Projecto de "+projecttype+"</span><br /><br /><a href='http://www.redeconvergir.net/v2/?pid="+projectid+"' style='color:#5f72c4; font-family:Arial, Helvetica, sans-serif; font-size:8pt; text-decoration:none;' target='_blank'>mais informações >></a>",
				icon: iconimg
			  });
			
			
			markers.push(marker);
			
			google.maps.event.addListener(marker, 'click', function () {
			// where I have added .html to the marker object.
			//window.open("http://www.redeconvergir.net/");
			//infowindow.setContent(contents[j]);
			 closeInfos();
			infowindow = new google.maps.InfoWindow({content: this.content});
			infowindow.open(map, this);
			infos[0]=infowindow;
		});
			}
		
		var markerCluster = new MarkerClusterer(map, markers, {
          maxZoom: 7,
          gridSize: 15,
        });
}

function closeInfos(){
 
   if(infos.length > 0){
 
      /* detach the info-window from the marker ... undocumented in the API docs */
      infos[0].set("marker", null);
 
      /* and close it */
      infos[0].close();
 
      /* blank the array */
      infos.length = 0;
   }
}
    
 google.maps.event.addDomListener(window, 'load', initialize);