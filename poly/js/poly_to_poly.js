/**
 * Query for polygon and adjacent polygons
 *
 * @author Giovanni Zambotti
 * @organization Center for Geographic Analysis, Harvard University
 * @contact gzambotti@cga.hrvard.edu, g.zambotti@gmail.com
 * @license You are free to copy and use this sample.
 * @version 0.1
 * @updated 
 * @since December 5, 2011
 * @update November 24, 2014
 * @dependencies  CartoDB, Leaflet, jQuery
 *
 * Usage Notes: Insipire by http://help.arcgis.com/en/webapi/javascript/arcgis/demos/query/query_bypoly.html.
 *
**/

window.onload = function() {
	var bounds;
	var highlightStyle = {color: "#ff0000", weight: 2, opacity: 0.6, fillOpacity: 0.1, fillColor: "#ff0000"}
		
	var map = L.map('main').setView([42.3, -71.6], 10);	
	
	var layer = new L.StamenTileLayer("toner");
	map.addLayer(layer);
	var centerLayer = {color:'#088A08', weight: 2, fill: true, fillColor:"#00ff00", fillOpacity: .4}
	var adjLayer = {color:'#B40431', weight: 2, fill: true, fillColor:"#FF0040", fillOpacity: .6}		
	var boundaryLayer, boundaryLayer1;	
	var pColor = '', bcolor = '', coords= '', sparePopup;
	sparePopup = new L.Popup({"maxWidth":400});
	map.on('click', function(e) {				
		if(typeof(boundaryLayer) != "undefined" ){boundaryLayer1.clearLayers();}     
		
		var q = encodeURIComponent("SELECT r.the_geom, r.zip FROM p_zip AS r WHERE ST_Contains(r.the_geom,ST_GeomFromText('POINT(" + e.latlng.lng + " " + e.latlng.lat + ")', 4326))");
		    
		$.getJSON("http://gz.cartodb.com/api/v1/sql?q=" + q + "&format=geojson&callback=?",
		function(geojson) {
			console.log(geojson)
			boundaryLayer1 = L.geoJson(geojson,{style: centerLayer});
			boundaryLayer1.addTo(map);				
		})
		
		/*boundaryLayer1.on('featureparse', function(e) {						
				e.layer.setStyle({ color:'#000', weight: 1, fill: true, fillColor:"#ffff00", fillOpacity: .5 });										
		});*/					
		
		if(typeof(boundaryLayer) != "undefined" ){boundaryLayer.clearLayers();}      

		var q2 = encodeURIComponent("SELECT a.* FROM p_zip a, p_zip b WHERE ST_Contains(b.the_geom,ST_GeomFromText('POINT(" + e.latlng.lng + " " + e.latlng.lat + ")', 4326)) AND a.the_geom && b.the_geom AND ST_Distance(a.the_geom, b.the_geom) = 0 AND a.cartodb_id != b.cartodb_id");
		
		$.getJSON("http://gz.cartodb.com/api/v1/sql?q=" + q2 + "&format=geojson&callback=?",
			function(geojson) {
				boundaryLayer = L.geoJson(geojson,{style: adjLayer});
			    boundaryLayer.addTo(map);					
							
		});					
		
		});	
}
		
	/*boundaryLayer.on('featureparse', function(e) {						
				e.layer.setStyle({ color:'#000', weight: 1, fill: true, fillColor:"#0000ff", fillOpacity: .6 });
				//e.layer.bindPopup(e.properties.zip);
				//e.layer.openPopup(sparePopup);					
					(function(properties, layer) {
						var popup = new L.Popup();
						layer.on("mouseover", function (e) {
							layer.setStyle(highlightStyle);	
							var popupContent = "<b>County Name:</b> " + properties.po_name + "<br /><b>Zip code:</b> " + properties.zip; 
															
							var latlng = new L.LatLng(properties.point_y, properties.point_x);								
							popup.setLatLng(latlng);
							popup.setContent(popupContent);
							map.openPopup(popup);								
							});
						layer.on("mouseout", function (e) {
						layer.setStyle(defaultStyle);
						map.closePopup(popup)							
			
					  });
					})(e.properties, e.layer);
					
			});
			*/
		
	