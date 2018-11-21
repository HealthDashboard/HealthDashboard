//= require leaflet.js
//= require procedure.js

describe("Tests for procedure.js", function() {

	beforeAll(function() {

		if (document.getElementById("sandbox") == null) {
			document.body.innerHTML += '<div id="sandbox"></div>';
		}
		
		var sandbox = document.getElementById("sandbox");
		sandbox.innerHTML = '<div id="procedure_map"></div>'
		sandbox.innerHTML += '<div class="legend-data"><li class="legend-data-li" id="legend-label-2"><p class="legend-data"></p></li></div>' 

	    var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	        maxZoom: 18,
	        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	    });
    	latlng = L.latLng(-23.557296000000001, -46.669210999999997);
		map = L.map('procedure_map', { center: latlng, zoom: 11, layers: [tiles] });
	})

	afterAll(function() {
		var sandbox = document.getElementById("sandbox");
		sandbox.innerHTML = '';
	});

	it("Metres to pixels", function() {
		expect(metresToPixels(5000)).toBe(71.3604400578994);
	});
        it("Pixels to metres", function(){
                expect(pixelsToMetres(71.3604400578994)).toBe(5000);
        });
        it("Legend", function(){
                var e = {}
                e.max = 1000;
                makeLegend(e);
                expect(document.getElementById("legend-label-2").innerText).toBe('1000');
        });
});
