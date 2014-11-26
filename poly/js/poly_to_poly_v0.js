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
	 * @dependencies  CartoDB, Leaflet, jQuery
	 *
	 * Usage Notes: Insipire by http://help.arcgis.com/en/webapi/javascript/arcgis/demos/query/query_bypoly.html.
	 *
	**/
	
	var map;
	var bounds;	
		
	// create layer zip boundary
	var boundaryLayer = new L.GeoJSON();
	var boundaryLayer1 = new L.GeoJSON();
	var pLng, pLat;
	
	var highlightStyle = {	
		color: "#ff0000",
        weight: 1,
        opacity: 0.6,
        fillOpacity: 0.1,
        fillColor: "#ff0000"
    }
	
	var defaultStyle = {
		color:'#000', weight: 1, fill: true, fillColor:"#0000ff", fillOpacity: .6	
    }
	
	function initialize() {	
		
		map = new L.Map('main');		
		
		var cloudmadeUrl = 'http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/22677/256/{z}/{x}/{y}.png',
			cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
			cloudmade = new L.TileLayer(cloudmadeUrl, {maxZoom: 18, attribution: cloudmadeAttribution});
	
		map.setView(new L.LatLng(42.3, -71.9), 9).addLayer(cloudmade);
		
		getResult();
	}
		
	function clearSelection()
	{			
		boundaryLayer1.clearLayers();
		boundaryLayer.clearLayers();
	}
						
	function getResult(){			
		var pColor = '';
		var bcolor = '';			
		var coords= '';

		map.on('click', function(e) {
			clearSelection();				
			pLng = e.latlng.toString().slice(16,26);
			pLat = e.latlng.toString().slice(7,15);
			//alert(pLat + " " + pLng);			
				
			if(pLng.charAt(pLng.length-1) == ")" || pLat.charAt(pLat.length-1) == ","){
				pLng = pLng.substring(0, pLng.length-1);
				pLat = pLat.substring(0, pLat.length-1);
			}
			else{pLng = e.latlng.toString().slice(16,26); pLat = e.latlng.toString().slice(7,15);}
			alert(pLat + " " + pLat.substring(0, pLat.length-1) + " " + pLat.charAt(pLat.length-1) );
			//var q1 = encodeURIComponent("SELECT a.* FROM zip a, zip b WHERE b.zip ='02138' AND a.the_geom && b.the_geom AND ST_Distance(a.the_geom, b.the_geom) = 0");
				
			var q = encodeURIComponent("SELECT r.the_geom, r.zip FROM zip AS r WHERE ST_Contains(r.the_geom,ST_GeomFromText('POINT(" + pLng + " " + pLat + ")', 4326))");
			
			$.getJSON(            
				"http://gz.cartodb.com/api/v1/sql?q=" + q + "&format=geojson&callback=?",
				function(geojson) {
					$.each(geojson.features, function(i, feature) {
						boundaryLayer1.addGeoJSON(feature);
						coords = feature.properties.zip;							
					})														
				})
					
				boundaryLayer1.on('featureparse', function(e) {						
						e.layer.setStyle({ color:'#000', weight: 1, fill: true, fillColor:"#ffff00", fillOpacity: .5 });										
				});		
				
																
				boundaryLayer.on('featureparse', function(e) {						
					e.layer.setStyle({ color:'#000', weight: 1, fill: true, fillColor:"#0000ff", fillOpacity: .6 });
					//e.layer.bindPopup(e.properties.zip);					
						(function(properties, layer) {
							layer.on("mouseover", function (e) {
								layer.setStyle(highlightStyle);	
								//layer.bindPopup(properties.zip);
								var li = $("<p>");
								var a = $("<div>", {
									id: "popup-" + properties.cartodb_id,							
									text: properties.zip + " " + properties.pop2010
								}).appendTo(li);
								li.appendTo("#right-col");
								
							});
							layer.on("mouseout", function (e) {
							layer.setStyle(defaultStyle); 
							$("#popup-" + properties.cartodb_id).remove();
						  });
						  //layer.on("click", function (e) { window.location = properties.url; });
						  $("#" + properties.cartodb_id).hover(function() {
							e.layer.fire("mouseover");
						  }, function() {
							e.layer.fire("mouseout");
						  });
						})(e.properties, e.layer);
						
				});

				var q2 = encodeURIComponent("SELECT a.* FROM zip a, zip b WHERE ST_Contains(b.the_geom,ST_GeomFromText('POINT(" + pLng + " " + pLat + ")', 4326)) AND a.the_geom && b.the_geom AND ST_Distance(a.the_geom, b.the_geom) = 0 AND a.cartodb_id != b.cartodb_id");
				
				$.getJSON(            
					"http://gz.cartodb.com/api/v1/sql?q=" + q2 + "&format=geojson&callback=?",
					function(geojson) {
					$.each(geojson.features, function(i, feature) {
						boundaryLayer.addGeoJSON(feature);										
					})					
									
				});						
				
				map.addLayer(boundaryLayer1);
				map.addLayer(boundaryLayer);
				
			});	
		}
		
		
		

	