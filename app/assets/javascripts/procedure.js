//* MAP *//
var map;

//* Array[id] = Display name *//
var health_centres_array = null;
var cid_array = null;
var cid_specific_array = null;

//** Data input from filters **//
var data = null;

//** Procedures data **//
var all_procedures;

//** Automatic search **//
var auto, cleaning;

//** Max value for sliders, change with the search result **//
var max_sliders = null;

//** Health Centres icon on map **//
var health_centre_markers;

//** Print vars **//
var filters_text, filters, genders, start_date, end_date, dist_min, dist_max;
var printPlugin;

//** Open Street view vars **//
var heat, cluster, shapes, shape, clean_up_cluster, max, shapes_setor, popup_marker_hash;

var myStyle;

var pixels_cluster, heat_type;

var minimap;

var metadata;

//** Population sectors vars **//
var population_sectors;

//** Called when loading the page, init vars, hide overlay and draw the map **//
function initProcedureMap() {
    auto = false;
    cleaning = false;
    health_centre_markers = [];
    data = null;
    filters_text = [];
    filters = [];
    genders = [];
    start_date = null;
    end_date = null;
    dist_min = null;
    dist_max = null;
    cluster = null;
    heat = null;
    clean_up_cluster = [];

    shapes = {
        'Shape_SP.geojson': null,
        'Shape_CRS.geojson': null,
        'Shape_STS.geojson': null,
        'Shape_PR.geojson': null,
        'Shape_DA.geojson': null,
        'Shape_UBS.geojson': null,
        'Shape_ESF.geojson': null
    };
    shapes_setor = {};

    $('#loading_overlay').hide();
    var tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
    latlng = L.latLng(-23.557296000000001, -46.669210999999997);

    //Popup map menu, may remove buttons from filters.
    menu = "<button type='button' id='print_popup' class='btn btn-dark btn-sm' onclick='print_maps()'> Imprimir </button><br>";
    menu += "<button type='button' id='graphs_popup' class='btn btn-dark btn-sm' onclick='graphs()'> Dados Gerais </button><br>";
    menu += "<button type='button' id='clear_popup' class='btn btn-dark btn-sm' onclick='clearMap()'> Limpar Mapa </button><br>";

    var popup = L.popup().setContent(menu);


    map = L.map('procedure_map', { center: latlng, zoom: 11, layers: [tiles] });
    map.on('contextmenu',function(e){
        popup.setLatLng(e.latlng)
        map.openPopup(popup);
    });

    pixels_cluster = metresToPixels(8000);

    L.control.scale({imperial: false, position: 'bottomright'}).addTo(map);
    
    map.on('zoomend', change_sliders);

    latlng = L.latLng(-23.72, -46.48);
    minimap = L.map('mini_map').setView(latlng, 9);

    tiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(minimap);

    myStyle = {
        "color": "#444444",
        "opacity": 0.6,
        "stroke": true,
        "fill": false,
    };
    $.ajax({
        dataType: "json",
        url: "Shape_SP.geojson",
        success: function(data) {
            shape = new L.geoJson(data,
                {onEachFeature: function(feature, layer) {
                  if (feature.properties && feature.properties.Name) {
                      layer.bindTooltip(feature.properties.Name, {closeButton: false});
                  }
                }}).addTo(minimap);
            shape.setStyle(myStyle);
        }
    });

    $.ajax({
      type: "GET" ,
      url: "metadata.xml" ,
      dataType: "xml" ,
      success: function(xml) {
        metadata = xml;
        updateCompleteness();
      }
    });

    // Loading the file with the information of the population about each sector
    $.getJSON('/Sectors_by_geocodi.json', function(result) {
        population_sectors = result;
    });

    // When the page is loaded, the specific cid_primary filter needs to be disabled
    $('#6').prop('disabled', true);
}

function change_sliders() {
    var cluster_slider = $("#slider_cluster").slider("getValue")
    cluster_pixels = metresToPixels(cluster_slider * 1000);

    cluster_km = (pixels_cluster * (cluster_slider)) / cluster_pixels;

    $("#slider_cluster").slider("setValue", cluster_km.toFixed(2));

    legendscale = document.getElementById("legend-scale")
    if (legendscale !== null) {
        legendscale.innerText = ("Internações num raio de " + $("#slider_heatmap").slider("getValue").toFixed(2) + "Km")
    }
}

function download(dataFilters, clusterDownload) {
    console.log(dataFilters, clusterDownload);
    
    if (clusterDownload == true){
        data_param = getData();
        data_param["latlong"] = dataFilters;
        data_param["ClusterDownload"] = "True";
    }
    else{
        data_param = dataFilters;
    }
    $.ajax({
        type: "POST",
        contentType: 'application/json',
        dataType: 'text',
        url: 'procedure/download.csv',
        data: JSON.stringify(data_param),
        success: function(result) {
            var uri = "data:text/csv;Content-Type:text/csv"
            var today = new Date().toLocaleString("pt-BR", {day: "numeric", month: "numeric", year: "numeric", hour: "numeric", minute: "numeric"})
            download_file(result, "SIH_resultado_busca_" + today + ".csv");
        }
    });
}

function download_file(dataurl, filename) {
    var a = document.createElement("a");
    csvData = new Blob([dataurl], { type: 'text/csv' }); 
    var csvUrl = URL.createObjectURL(csvData);
    a.href = csvUrl;
    a.setAttribute("download", filename);
    var b = document.createEvent("MouseEvents");
    b.initEvent("click", false, true);
    a.dispatchEvent(b);
    return false;
}

//** Called when a visualization shape is selected, remove the selected shape if its already selected or draws a new one **//
function setShape(name, popup) {
    myStyle = {
        "color": "#444444",
        "opacity": 0.6,
        "stroke": true,
        "fill": true,
        "fillOpacity": 0.05,
    };
    if(name === 'Shape_ESF.geojson'){
        // Default Stripes
        var stripes = new L.StripePattern({
            angle:  45,
            weight:  2
        });
        stripes.addTo(map);

        myStyle = {
            "stroke": false,
            "lineCap": "butt",
            "fill": true,
            "fillColor": "#444444",
            "fillRule": "nonzero",
            "fillOpacity": 0.25,
        };
    }

    if (shapes[name] != null) {
        map.removeLayer(shapes[name]);
        shapes[name] = null;

        if (name === 'Shape_DA.geojson') {
            //TODO
            shapes_setor.map(function(setor) {
                map.removeLayer(setor);
            });
            shapes_setor = {};
        }
    }
    else {
        $.ajax({
            dataType: "json",
            url: name,
            success: function(data) {
                shape = new L.geoJson(data,
                    {onEachFeature: function(feature, layer) {
                        if (feature.properties && feature.properties.Name) {
                            layer.bindTooltip(feature.properties.Name, {closeButton: false});
                        }
                        if (name === 'Shape_DA.geojson') {
                            layer.bindTooltip(feature.properties.NM_DISTRIT, {closeButton: false});
                            layer.name_sc = feature.properties.NM_DISTRIT
                            layer.on('click', setor_censitario)
                        }
                        }, style: { fillPattern: stripes }
                    }).addTo(map);
                shape.setStyle(myStyle);
                if (popup != null)
                    shape.bindPopup(popup);
                shapes[name] = shape;
            }
        });
    }
}

function setor_censitario(e) {
    if(shapes_setor[e.target.name_sc] == undefined){
        shapes_setor[e.target.name_sc] = {};
    }
    $.ajax({
        dataType: "json",
        url: `SetorCensitario/Setor_with_pop-${e.target.name_sc}.json`,
        success: function(data) {
            shape = new L.geoJson(data,
                {onEachFeature: function(feature, layer) {
                    layer.bindTooltip(`População Total: ${parseInt(feature.properties.POPULACAO_TOTAL)} </br>
                                       População Feminina: ${parseInt(feature.properties.POPULACAO_MULHER)} </br>
                                       População Masculina: ${parseInt(feature.properties.POPULACAO_HOMEM)} </br>
                                       População Branca: ${parseInt(feature.properties.POPULACAO_BRANCA)} </br>
                                       População Preta: ${parseInt(feature.properties.POPULACAO_PRETA)} </br>
                                       População Amarela: ${parseInt(feature.properties.POPULACAO_AMARELA)} </br>
                                       População Parda: ${parseInt(feature.properties.POPULACAO_PARDA)} </br>
                                       População Indígena: ${parseInt(feature.properties.POPULACAO_INDIGENA)} </br>`, {closeButton: false});
                    if(shapes_setor[e.target.name_sc][feature.properties.CD_GEOCODI] == undefined){
                        shapes_setor[e.target.name_sc][feature.properties.CD_GEOCODI] = [];
                    }
                    shapes_setor[e.target.name_sc][feature.properties.CD_GEOCODI].push(shape);
                    shape.setStyle(myStyle);            
                }
            });
            map.addLayer(shape);
        }
    })
}

//** Called when automatic search checkbox is changed, update auto var accordingly **//
function automatic_search() {
    var checkbox_search = document.getElementById('automatic_search_checkbox');

    if (checkbox_search.checked)
        auto = true;
    else
        auto = false;
}

//** Called when any filter is altered, if automatic search is on it calls "buscar()" **//
function change(element) {
    // if the changed element is the specific cid10 filter, so the function called is cid10_change()
    var ids_to_change = ["slider_cluster", "slider_heatmap", "checkCluster", "checkHeatmap", "checkHeatmapRate", "checkGradient", "slider_opacity"];
    if (element.id == 5){
        cid10_change();
    }
    if (ids_to_change.includes(element.id)) {
        data = getData();
        buscar(data);
    }
    if (cleaning == false && auto == true) {
        data = getData()
        buscar(data);
        filters_value(data);
    }
}

function getData() {
    var sexo_masculino = document.getElementById('sexo_masculino');
    var sexo_feminino = document.getElementById('sexo_feminino');
    genders = [];
    filters = [];
    filters_text = [];

    if(typeof NUM_FILTERS === 'undefined' || NUM_FILTERS === null){
        return null;
    }

    for (i = 0; i < NUM_FILTERS; i++) {
        var aux = [];
        var aux_name = [];
        var select_name = $('#' + i + ' option:selected');
        var options = $(select_name);
        $.each(options, function(index, value){
            aux.push(value.value);
            aux_name.push([value.text]);
        });

        filters_text.push(aux_name.join(","));
        filters.push(aux);
    }

    start_date = $("#intervalStart").datepicker({ dateFormat: 'dd,MM,yyyy' }).val();
    end_date = $("#intervalEnd").datepicker({ dateFormat: 'dd,MM,yyyy' }).val();

    if(sexo_masculino.checked)
        genders.push("M");

    if(sexo_feminino.checked)
        genders.push("F");

    sliders = [];
    for (i = 0; i < 6; i++) {
        var values = $("#slider_" + i.toString()).slider("getValue");
        sliders.push([values[0], values[1]]);
    }

    data_aux = {send_all: "False", filters: filters, genders: genders, start_date: start_date.toString(), end_date: end_date.toString(), sliders: sliders};
    data = {"data": JSON.stringify(data_aux)} // Fix hash to array problem on controller
    return data
}

//** Called when "Buscar" button is clicked, uses the filters to fetch data on procedures **//
function buscar(data) {
    var health_centres = [];

    var hc = $('#0 option:selected');
    aux = []
    $.each(hc, function(index, value) {
        aux.push(value.value);
    });
    health_centres.push(aux);

    data = getData();
    clearMap();

    // Show Data
    $('#loading_overlay').show();

    var metres_bounds_cluster = 1000*$("#slider_cluster").slider("getValue");

    var heatmap_opacity = $("#slider_opacity").slider("getValue");

    // handling all cluster now
    health_centres_makers(health_centres);
    handleLargeCluster(map, "procedure/proceduresClusterPoints", data, metresToPixels(metres_bounds_cluster), heatmap_opacity, CustomMarkerOnClick, "Procedures");

    // Divida tecnica
    checked = $('input[name=optCheckbok]:checked', '#checkbox-list');
    $(checked).attr('checked', true).trigger('click');

    // Show heatmap legend
    if ($("#heatmap-leg").hasClass("hide") && (document.getElementById('checkHeatmap').checked || document.getElementById('checkHeatmapRate').checked)) {
        $("#heatmap-leg").toggleClass("hide");
    }
    else if (!$("#heatmap-leg").hasClass("hide") && (!document.getElementById('checkHeatmap').checked && !document.getElementById('checkHeatmapRate').checked)) {
        $("#heatmap-leg").toggleClass("hide");
    }
    toggleFilters();
}

function metresToPixels(metres) {
    var metresPerPixel = 40075016.686*Math.abs(Math.cos((-23.557296000000001)*Math.PI/180))/Math.pow(2, map.getZoom()+8);
    return metres / metresPerPixel;
}

function pixelsToMetres(pixels) {
    var metresPerPixel = 40075016.686*Math.abs(Math.cos((-23.557296000000001)*Math.PI/180))/Math.pow(2, map.getZoom()+8);
    return pixels * metresPerPixel;
}

// returns distance between two latlong points
function latlongDist(point1, point2) {
    var R = 6371;
    var dLat = (point2[0]-point1[0]) * Math.PI / 180;
    var dLon = (point2[1]-point1[1]) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1[0] * Math.PI / 180 ) * Math.cos(point2[0] * Math.PI / 180 ) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d; 
} 

function setHeatmapData(source, heat_type) {
    var heatmap_procedures = [];
    var max_value_heatmap = 0.0;
    var heatmap_opacity = $("#slider_opacity").slider("getValue");
    var radius_km = $("#slider_heatmap").slider("getValue");
    var scale = Math.pow(2, map.getZoom());
    var radius = metresToPixels(1000 * radius_km) / scale;

    if (document.getElementById('checkGradient').checked) {
        gradient = { 0.25: "#D3C9F8", 0.55: "#7B5CEB", 0.85: "#4E25E4", 1.0: "#3816B3"}
        $("#gradient").addClass("dalt");
    } else {
        gradient = { 0.25: "#2bffd3", 0.62: "#fffd57", 1.0: "#f93434"}
        $("#gradient").removeClass("dalt");
    }

    if(source === "Procedures"){
        if (heat_type === "default") {
            $.each(all_procedures, function(index, centerProcedure) {
                if (!centerProcedure[4]) {
                    totalCount = 0;
                    $.each(all_procedures, function(index, procedure) {
                        if (latlongDist(centerProcedure, procedure) <= radius_km) {
                            totalCount += procedure[3]
                            procedure.push(true)
                        }
                    });
                    heatmap_procedures.push({lat: centerProcedure[0], lng: centerProcedure[1], count: totalCount})
                    if (totalCount > max_value_heatmap)
                        max_value_heatmap = totalCount
                }
            });
        }    
        else if(heat_type === "rate") {
            // hate heatmap gradient is different
            if (document.getElementById('checkGradient').checked) {
                gradient = { 0.1: "#D3C9F8", 0.2: "#7B5CEB", 0.3: "#4E25E4", 1.0: "#3816B3"}
                $("#gradient").addClass("dalt");
            } else {
                gradient = { 0.1: "#2bffd3", 0.2: "#fffd57", 0.3: "#f93434"}
                $("#gradient").removeClass("dalt");
            }

            $.each(all_procedures, function(index, centerProcedure) {
                if (!centerProcedure[4]) {
                    totalRate = 0.0;
                    numRate = 0;
                    $.each(all_procedures, function(index, procedure) {
                        if (latlongDist(centerProcedure, procedure) <= radius_km) {
                            rate = 1000*1.0*procedure[3]/parseInt(population_sectors[procedure[2]]["POPULACAO_TOTAL"]);
                            if (!isFinite(rate)){
                                rate = 0;
                            }
                            totalRate += rate
                            numRate += 1
                            procedure.push(true)
                        }
                    });
                    heatmap_procedures.push({lat: centerProcedure[0], lng: centerProcedure[1], count: totalRate/numRate})
                    if (totalRate > max_value_heatmap)
                        max_value_heatmap = totalRate
                }
            });
        }
    }
    else if(source === "HealthCentres"){
        radius = 30;
        heatmap_opacity = 60;
        $.each(all_procedures, function(index, procedure) {
            heatmap_procedures.push({lat: procedure[0], lng: procedure[1], count: procedure[2]})
            if (procedure[2] > max_value_heatmap)
                max_value_heatmap = procedure[2]
        });
    }
    
    var cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        "radius": radius,
        "scaleRadius": (source === "Procedures"), 
        // if activated: uses the data maximum within the current map boundaries
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": true,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'count',
        //gradient: { 0.25: "#D3C9F8", 0.55: "#7B5CEB", 0.85: "#4E25E4", 1.0: "#3816B3"},
        gradient: gradient,
        opacity: heatmap_opacity / 100,
        onExtremaChange: makeLegend,
    };

    heatdata = {max: max_value_heatmap, data: heatmap_procedures}
    heat = new HeatmapOverlay(cfg);
    heat.setData(heatdata);
    map.addLayer(heat);

    // set legend text
    legendscale = document.getElementById("legend-scale")
    if (legendscale !== null) {
        legendscale.innerText = ("Internações num raio de " + $("#slider_heatmap").slider("getValue").toFixed(2) + "Km")
    }
}

function handleLargeCluster(map, path, data, cluster_pixels, heatmap_opacity, function_maker, source) {
    cluster = L.markerClusterGroup({
        maxClusterRadius: cluster_pixels,
        chunkedLoading: true,
        iconCreateFunction: function(cluster) {
            var markers = cluster.getAllChildMarkers();
            var n = 0;
            for (var i = 0; i < markers.length; i++) {
                n += markers[i].number;
            }

            if (n < 5000) {
                className = 'map-marker marker-5k a-class';
                size = 44;
            } else if (n < 100000) {
                className = 'map-marker marker-10k a-class';
                size = 64;
            } else if (n >= 100000) {
                className = 'map-marker marker-100k a-class';
                size = 84;
            }

            //Changes values in legend
            change_sliders();
            cluster.on('contextmenu',function(e){
                var button = document.createElement('button');
                button.type = "button"
                button.id = markers.id;
                button.className = 'btn btn-dark btn-sm';
                button.innerText = 'Download';
                if(source === "Procedures"){                
                    button.addEventListener('click', function(){
                        var latlong = [];
                        $.each(markers, function(index, m){
                            latlong.push(m.latlong[0], m.latlong[1]);
                        })
                        download(latlong, true);
                    });
                    var popup_cluster = L.popup().setContent(button);
                    popup_cluster.setLatLng(e.latlng)
                    map.openPopup(popup_cluster);
                }
            });
            return L.divIcon({ html: n, className: className, iconSize: L.point(size, size) });
        },
    });

    $.ajax({
        type: "GET",
        dataType: 'json',
        contentType: 'application/json',
        data: data,
        url: path,
        success: function(procedures) {
            all_procedures = procedures.slice(0);
            markerList = [];
            popup_marker_hash = {};
            var proceduresPop;
            if(source === "Procedures"){
                $.ajax({
                    type: "GET",
                    dataType: 'json',
                    contentType: 'application/json',
                    data: data,
                    async: false,
                    url: "procedure/proceduresPop",
                    success: function(result) {
                        proceduresPop = result;
                    }
                });
            }
            clusterElement = document.getElementById('checkCluster');
            if ((clusterElement && clusterElement.checked) || source === "HealthCentres") {
                $.each(procedures, function(index, latlong){
                    // the index used in latlong to represent the procedures counter depends on the source
                    // so if the source is "Procedures", the latlong variable has a cd_geocodi field
                    // if the source is "HealthCentres", the latlong variable does not have a cd_geocodi field.
                    icon = L.divIcon({ html: latlong[3], className: 'map-marker marker-single a-class', iconSize: L.point(34, 34) });
                    marker = L.marker(L.latLng(latlong[0], latlong[1]), {icon: icon})
                    marker.number = latlong[3];
                    marker.cd_geocodi = latlong[2];
                    marker.id = latlong[3];
                    if(source === "HealthCentres"){
                        icon = L.divIcon({ html: latlong[2], className: 'map-marker marker-single a-class', iconSize: L.point(34, 34) });
                        marker = L.marker(L.latLng(latlong[0], latlong[1]), {icon: icon})
                        marker.number = latlong[2];
                        marker.id = latlong[2];
                    }
                    marker.latlong = [latlong[0], latlong[1]];
                    marker.clusterOpen = false;
                    marker.cluster = null;
                    marker.on('click', function_maker);
                    marker.on('contextmenu',function(e){
                        if (source === "Procedures"){
                            if(shapes_cd_geocodi[e.target.cd_geocodi] == null){
                                menu = "<button type='button' id='button-download_" + marker.id + "' class='btn btn-dark btn-sm' onclick='download(["
                                + e.latlng.lat + "," + e.latlng.lng + "]" + ", true)'> Download </button></br>";
                                var popup_cluster = L.popup().setContent(menu);
                                popup_cluster.setLatLng(e.latlng);
                                map.openPopup(popup_cluster);     
                            }     
                            else{
                                menu = "<button type='button' id='button-download_" + marker.id + "' class='btn btn-dark btn-sm' onclick='download(["
                                + e.latlng.lat + "," + e.latlng.lng + "]" + ", true)'> Download </button></br>";
                                menu += "<button type='button' id='button-shape_" + marker.id + "' class='btn btn-dark btn-sm' onclick='handlePopupMarker(" 
                                    + e.latlng.lat + "," + e.latlng.lng + "," + e.target.cd_geocodi + ", \"Shape\", " + marker.id + ")'> Ocultar Contorno </button>";
                                var popup_cluster = L.popup().setContent(menu);
                                popup_cluster.setLatLng(e.latlng);
                                map.openPopup(popup_cluster);     
                            }                                                 
                        }                       
                    });
                    markerList.push(marker);
                    if(source === "Procedures"){
                        // population data about each marker to show in the tooltip
                        var value_pop_mulher = proceduresPop["gender"]['[\"' + marker.cd_geocodi + '\", \"F\"]'];
                        var value_pop_homem = proceduresPop["gender"]['[\"' + marker.cd_geocodi + '\", \"M\"]'];
                        var value_pop_branca = proceduresPop["race"]['[\"' + marker.cd_geocodi + '\", \"01\"]'];
                        var value_pop_preta = proceduresPop["race"]['[\"' + marker.cd_geocodi + '\", \"02\"]'];
                        var value_pop_amarela = proceduresPop["race"]['[\"' + marker.cd_geocodi + '\", \"03\"]'];
                        var value_pop_indigena = proceduresPop["race"]['[\"' + marker.cd_geocodi + '\", \"04\"]'];
                        var str_percentage_pop_total = 100*marker.number/parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_TOTAL"]);
                        var str_percentage_pop_mulher = 100*value_pop_mulher/parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_MULHER"]);
                        var str_percentage_pop_homem = 100*value_pop_homem/parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_HOMEM"]);
                        var str_percentage_pop_branca = 100*value_pop_branca/parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_BRANCA"]);
                        var str_percentage_pop_preta = 100*value_pop_preta/parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_PRETA"]);
                        var str_percentage_pop_amarela = 100*value_pop_amarela/parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_AMARELA"]);
                        var str_percentage_pop_indigena = 100*value_pop_indigena/parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_INDIGENA"]);
                        if(value_pop_mulher == undefined) value_pop_mulher = 0;
                        if(value_pop_homem == undefined) value_pop_homem = 0;
                        if(value_pop_branca == undefined) value_pop_branca = 0;
                        if(value_pop_preta == undefined) value_pop_preta = 0;
                        if(value_pop_amarela == undefined) value_pop_amarela = 0;
                        if(value_pop_indigena == undefined) value_pop_indigena = 0;
                        if(isNaN(str_percentage_pop_total) || !isFinite(str_percentage_pop_total)) str_percentage_pop_total = 0;
                        if(isNaN(str_percentage_pop_mulher) || !isFinite(str_percentage_pop_mulher)) str_percentage_pop_mulher = 0;
                        if(isNaN(str_percentage_pop_homem) || !isFinite(str_percentage_pop_homem)) str_percentage_pop_homem = 0;
                        if(isNaN(str_percentage_pop_branca) || !isFinite(str_percentage_pop_branca)) str_percentage_pop_branca = 0;
                        if(isNaN(str_percentage_pop_preta) || !isFinite(str_percentage_pop_preta)) str_percentage_pop_preta = 0;
                        if(isNaN(str_percentage_pop_amarela) || !isFinite(str_percentage_pop_amarela)) str_percentage_pop_amarela = 0;
                        if(isNaN(str_percentage_pop_indigena) || !isFinite(str_percentage_pop_indigena)) str_percentage_pop_indigena = 0;
                        var string_popup = ("População Total: " + marker.number + "/" + parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_TOTAL"])
                            + ' (' + str_percentage_pop_total.toFixed(2).replace(".", ",") + '%)' + '</br>'
                            + "População Feminina: " + value_pop_mulher + "/" + parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_MULHER"])
                            + ' (' + str_percentage_pop_mulher.toFixed(2).replace(".", ",") + '%)' + '</br>'
                            + "População Masculina: " + value_pop_homem + "/" + parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_HOMEM"])
                            + ' (' + str_percentage_pop_homem.toFixed(2).replace(".", ",") +  '%)' + '</br>'
                            + "População Branca: " + value_pop_branca + "/" + parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_BRANCA"])
                            + ' (' + str_percentage_pop_branca.toFixed(2).replace(".", ",") + '%)' + '</br>'
                            + "População Preta: " + value_pop_preta + "/" + parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_PRETA"])
                            + ' (' + str_percentage_pop_preta.toFixed(2).replace(".", ",") + '%)' + '</br>'
                            + "População Amarela: " + value_pop_amarela + "/" + parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_AMARELA"])
                            + ' (' + str_percentage_pop_amarela.toFixed(2).replace(".", ",") + '%)' + '</br>'
                            + "População Indígena: " + value_pop_indigena + "/" + parseInt(population_sectors[marker.cd_geocodi]["POPULACAO_INDIGENA"])
                            + ' (' + str_percentage_pop_indigena.toFixed(2).replace(".", ",") + '%)' + '</br>');
                        //In this case, the index of the marker on markerList array is his id.
                        var string_button_popup_one_shape = ("<button type='button' id='button-shape_" + markerList.length + "' class='btn btn-dark btn-sm' onclick='showHideShape(\"" + string_popup + "\"" + "," + marker.cd_geocodi + ", " + population_sectors[marker.cd_geocodi]["CD_GEOCODD"] + ", " + markerList.length + ", \"Sector\")'> Exibir setor </button>  ");
                        var string_button_popup_all_shapes = ("<button type='button' id='button-all_shapes_" + markerList.length + "' class='btn btn-dark btn-sm' onclick='showHideShape(\"" + string_popup + "\"" + "," + marker.cd_geocodi + ", " + population_sectors[marker.cd_geocodi]["CD_GEOCODD"] + "," + markerList.length + ", \"All Sectors\")'> Exibir setores do distrito </button>");
                        var popup = L.popup().setLatLng(marker.latlong).setContent(string_popup + string_button_popup_one_shape + string_button_popup_all_shapes);
                        if(popup_marker_hash[population_sectors[marker.cd_geocodi]["CD_GEOCODD"]] == undefined) {
                            popup_marker_hash[population_sectors[marker.cd_geocodi]["CD_GEOCODD"]] = {};
                        }
                        popup_marker_hash[population_sectors[marker.cd_geocodi]["CD_GEOCODD"]][marker.cd_geocodi] = popup;
                        marker.on('mouseover', function(e) {
                            popup.openOn(map);
                        });
                    }
                });
                cluster.addLayers(markerList);
                map.addLayer(cluster);
                
                if (clusterElement && clusterElement.checked) {
                    document.getElementById("clusterRadius").classList.remove("hidden");
                    document.getElementById("radiusDiv").classList.remove("hidden");
                }
            }
            else if (clusterElement) {
                document.getElementById("clusterRadius").className+=" hidden";
            }

            heatmapElement = document.getElementById('checkHeatmap')
            if ((heatmapElement && heatmapElement.checked) || source === "HealthCentres") {
                
                // create default heatmap
                heat_type = "default";
                setHeatmapData(source, heat_type);

                //inserting the first and last values
                legendlabel1 = document.getElementById("legend-label-1")
                if (legendlabel1 !== null)
                    legendlabel1.innerText = 0.0;

                //changing legend opacity
                X = document.getElementsByClassName("span-normal")
                X[0].style["opacity"] = heatmap_opacity / 100;

                if (heatmapElement && heatmapElement.checked) {
                    document.getElementById("heatmapRadius").classList.remove("hidden");

                    document.getElementById("radiusDiv").classList.remove("hidden");
                    document.getElementById("heatmapOptions").classList.remove("hidden");
                }
            }
            else if (heatmapElement) {
                document.getElementById("heatmapRadius").className+=" hidden";
                
                document.getElementById("heatmapOptions").className+=" hidden";
                
                // if both are hidden (heatmap and cluster)
                if (document.getElementById("clusterRadius").classList.contains("hidden")) {
                    document.getElementById("radiusDiv").className+=" hidden";
                }
            }

            rateHeatmapElement = document.getElementById('checkHeatmapRate');
            if (rateHeatmapElement && rateHeatmapElement.checked) {
                
                // create rate heatmap
                heat_type = "rate";
                setHeatmapData(source, heat_type);

                //inserting the first and last values
                legendlabel1 = document.getElementById("legend-label-1")
                if (legendlabel1 !== null)
                    legendlabel1.innerText = 0.0;

                //changing legend opacity
                X = document.getElementsByClassName("span-normal")
                X[0].style["opacity"] = heatmap_opacity / 100;

                if (rateHeatmapElement && rateHeatmapElement.checked) {
                    document.getElementById("heatmapRadius").classList.remove("hidden");

                    document.getElementById("radiusDiv").classList.remove("hidden");
                    document.getElementById("heatmapOptions").classList.remove("hidden");
                }
            }
            else if (rateHeatmapElement && !heatmapElement) {
                document.getElementById("heatmapRadius").className+=" hidden";
                
                document.getElementById("heatmapOptions").className+=" hidden";
                
                // if both are hidden (heatmap and cluster)
                if (document.getElementById("clusterRadius").classList.contains("hidden")) {
                    document.getElementById("radiusDiv").className+=" hidden";
                }
            }

            $('#loading_overlay').hide();
        }
    });
}


function makeLegend(e) {
    legendlabel2 = document.getElementById("legend-label-2")
    if(!Number.isInteger(e.max)){
        e.max = parseFloat(e.max.toFixed(2)).toLocaleString('pt-BR');
    }
    legendlabel2.innerText = e.max
}

function CustomMarkerOnClick(e) {
    marker = e.target
    if (marker.cluster == null) { //Happens only once per cluster
        marker.cluster = L.markerClusterGroup({
            chunkedLoading: true,
            iconCreateFunction: function(cluster) {
                return L.divIcon({ html: "", className: "Invisible Cluster", iconSize: L.point(0, 0) });
            }
        });
        var dotIcon = L.divIcon({
            iconAnchor: [5, 0],
            className: "marker-dot",
            bgPos: L.point(-5, -5)
        });

        path = "procedure/proceduresSetorCensitario"

        list = []
        data = getData()
        data["lat"] = marker.latlong[0]
        data["long"] = marker.latlong[1]
        $.ajax({
            contentType: 'json',
            url: path,
            data: data,
            success: function(procedures) {
                $.each(procedures, function(index, id){
                    single_point_marker = L.marker(L.latLng(marker.latlong[0], marker.latlong[1]), {icon: dotIcon, id: id}).on('click', markerOnClick);
                    list.push(single_point_marker)
                });
                marker.cluster.addLayers(list);
                marker.cluster.addTo(map);
                clean_up_cluster.push(marker.cluster);

                $.each(marker.cluster.getLayers(), function(index, layer) {
                    layer.__parent.spiderfy();
                });
                marker.clusterOpen = true;
            }
        });
    }

    if (!marker.clusterOpen) {
        $.each(marker.cluster.getLayers(), function(index, layer) {
            layer.__parent.spiderfy();
        });
        marker.clusterOpen = true;
    } else {
        $.each(marker.cluster.getLayers(), function(index, layer) {
            layer.__parent.unspiderfy();
        });
        marker.clusterOpen = false;
    }
}

//** Called when a procedure marker is clicked, fetch the specific proprieties of the selected procedure
//   such as health centre, cid, distance and more. Also draws on map the associated health centre **//
function markerOnClick(e) {
    id = e.target.options.id
    var sexp_var = {};
    sexp_var["M"] = "Masculino";
    sexp_var["F"] = "Feminino";
    var proceduresInfo_path = ["/procedure/proceduresInfo", id].join("/");

    setVisible(false);

    //Only get the data the first time its clicked
    if (e.target.getPopup() === undefined) {
        $.getJSON(proceduresInfo_path, function(procedure) {
            cnes = procedure[0].cnes_id;
            $.getJSON("procedure/healthCentresCnes", {cnes: cnes.toString()}, function(hc_latlong) {
                path_distance_real = "http:\/\/router.project-osrm.org\/route\/v1\/driving\/"
                + hc_latlong[0][1] + "," + hc_latlong[0][0] + ";" + procedure[0].long + ","
                + procedure[0].lat + "?overview=false";

                $.getJSON(path_distance_real, function(distance) { //get Real distance usign router.project-osrm.org
                    v_distance = parseFloat(distance.routes[0].distance);
                    v_distance = v_distance / 1000; // m -> km
                    var index_cid_specific;
                    var cid_descric;
                    if(procedure[0].cid_primary.length > 3){
                        index_cid_specific = cid_specific_array[procedure[0].cid_primary.substring(0, procedure[0].cid_primary.length-1)].findIndex(function(file_item){
                            return file_item["SUBCAT"] == procedure[0].cid_primary;
                        });
                        cid_descric = cid_specific_array[procedure[0].cid_primary.substring(0, procedure[0].cid_primary.length-1)][index_cid_specific]["DESCRIC"];
                    }
                    else{
                        index_cid_specific = cid_specific_array[procedure[0].cid_primary].findIndex(function(file_item){
                            return file_item["SUBCAT"] == procedure[0].cid_primary;
                        });
                        cid_descric = cid_specific_array[procedure[0].cid_primary][index_cid_specific]["DESCRIC"];
                    }
                    text =  "<strong>Estabelecimento: </strong>" + health_centres_array[parseInt(cnes)] + "<br>";
                    text += "<strong>Sexo: </strong>" + sexp_var[procedure[0].gender] + "<br>";
                    text +=  "<strong>Idade: </strong>" + procedure[0].age_number + "<br>";
                    text += "<strong>CID: </strong>" + cid_descric + "<br>";
                    text += "<strong>CRS: </strong>" + procedure[0].CRS + "<br>";
                    text += "<strong>Data: </strong>" + procedure[0].date + "<br>";
                    text += "<strong>Distância: </strong>" + parseFloat(procedure[0].distance).toFixed(1).replace(".", ",") + " Km <br>";
                    text += "<strong>Distância viária: </strong>" + v_distance.toFixed(1).replace(".", ",") + " Km <br>";

                    e.target.bindPopup(text, {direction:'top', cnes: cnes});
                    e.target.openPopup();
                    health_centres_makers(cnes);
                });
            });
        });
    } else {
        cnes = e.target.getPopup().options.cnes;
        if (e.target.getPopup().isOpen() != true)
            health_centres_makers(cnes);
    }
}

//** Called when a procedure marker is clicked. Show health centres markers on map **//
function health_centres_makers(health_centres) {
    var health_centre_icon = '/health_centre_icon.png';
    $.getJSON("procedure/healthCentresCnes", {cnes: health_centres.toString()}, function(result){
        $.each(result, function(index, health_centre){
            create_markers(health_centre, health_centre_icon);
        });
        setVisible(true);
    });
}

//** Creates health centres markers **//
function create_markers(health_centre, icon_path) {
    var hcIcon = L.icon({
        iconUrl: icon_path,
    });
    var marker = L.marker(L.latLng(health_centre[0], health_centre[1]), {icon: hcIcon});
    health_centre_markers.push(marker);
}

//** Changes the visibility of health centres markers **//
function setVisible(visibility) {
    for (var i = 0; i < health_centre_markers.length; i++){
        if (visibility == true)
            health_centre_markers[i].addTo(map);
        else
            health_centre_markers[i].remove();
    }
    if (visibility != true)
        health_centre_markers = [];
}

//* Called when "limpar" button is clicked, restore the page to its initial state *//
function limpar() {
    cleaning = true;
    $("#slider_distance").slider('refresh');
    filters_value({"data": JSON.stringify({send_all: "True"})});
    for (i = 0; i < 24; i++) {
        name = ".select-" + i;
        $(name).val('').trigger('change');
    }
    $("#intervalStart").val('').datepicker('destroy').datepicker();
    $("#intervalEnd").val('').datepicker('destroy').datepicker();
    $("#sexo_masculino").prop("checked", true);
    $("#sexo_feminino").prop("checked", true);
    cleaning = false;
    for(var i=1; i < 3; i++){
        document.getElementById("legend-label-" + i).innerText = "";
    }
    document.getElementById("legend-scale").innerText = "";
    checked = $('input[name=optCheckbok]:checked', '#checkbox-list');
    $(checked).attr('checked', true).trigger('click');

    /* Hide heatmap legend when map is cleaned*/
    if ($("#heatmap-leg").hasClass("active")) {
        $("#heatmap-leg").removeClass("active");
    }

    $("#heatmap-leg").toggleClass("hide");

    clearMap();
}

//** Clears features on the map **//
function clearMap() {
    if (cluster != null)
        map.removeLayer(cluster);

    if (heat != null)
        map.removeLayer(heat);

    $.each(clean_up_cluster, function(index, point){
        map.removeLayer(point)
    });

    setVisible(false);
    heat = null;
    cluster = null;
    clean_up_cluster = [];

    for(cd_geocodd in shapes_setor){
        for(cd_geocodi in shapes_setor[cd_geocodd]){
            map.removeLayer(shapes_setor[cd_geocodd][cd_geocodi].shape);
            shapes_setor[cd_geocodd][cd_geocodi].state = false;
        }
    }
}

//** Called when "Dados Gerais" button is clicked, open "Dados Gerais" page and passes filter values to it **//
function graphs() {
    var w = window.open('dados-gerais');
    w._data_filters = getData();
    w._filters_text = filters_text;
    w._genders = genders;
    w._start_date = start_date;
    w._end_date = end_date;
}

//** Called when "Imprimir" butotn is clicked, opens a print dialog **//
function print_maps() {
    $('#loading_overlay').show();
    $(".container").css('margin-top', 0);
    $(".collapsible.active").each(function() {
      $(this).click();
    });

    center = map.getCenter()
    h = pixelsToMetres($("#procedure_map").height())/2;
    w = h * 0.69;
    h = h/111111
    w = w/111111
    var bounds = [[center.lat - h, center.lng - w], [center.lat + h, center.lng + w]];

    minimap.setZoom(map.getZoom(), {animate: false, noMoveStart: true});
    var rectangle = L.rectangle(bounds, {color: "rgb(83, 83, 83)", fillColor: 'rgba(56, 22, 179, 0)', weight: 3}).addTo(minimap);
    minimap.setZoom(9);



    var node = document.getElementById('map-affix');

    domtoimage.toPng(node)
        .then(function (dataUrl) {
            var img = new Image();
            img.src = dataUrl;
            document.getElementById("print-map").appendChild(img);

            $('#mini_map-container').contents().appendTo('#mini_map_div')
            $('#heatmap-leg').contents().appendTo('#print-leg')

            var filters_div_text = '<p>';
            $.each(filters_print, function(index, value){
              if (filters_text[index] != null && filters_text[index] != "")
                filters_div_text = filters_div_text.concat("<br />" + value + ": " + filters_text[index]);
            });
            if (genders[0] != null)
              filters_div_text = filters_div_text.concat("<br />Sexo: " + genders.join(", "));
            if (start_date != null && start_date != "")
              filters_div_text = filters_div_text.concat("<br />Data mínima: " + start_date);
            if (end_date != null && end_date != "")
              filters_div_text = filters_div_text.concat("<br />Data máxima: " + end_date);
            if (dist_min != null)
              filters_div_text = filters_div_text.concat("<br />Distância mínima: " + dist_min);
            if (dist_max != null)
              filters_div_text = filters_div_text.concat("<br />Distância máxima: " + dist_max);
            filters_div_text = filters_div_text.concat("</p>");

            $("#active-filters-div").html(filters_div_text);
        })
        .catch(function (error) {
            console.error('oops, something went wrong!', error);
            $('#loading_overlay').hide();
        })
        .then(function () {
            window.print();
            document.getElementById("print-map").innerHTML = "";
            $(".container").css('margin-top', "50px");
            $('#mini_map_div').contents().appendTo('#mini_map-container')
            $('#print-leg').contents().appendTo('#heatmap-leg')
            minimap.removeLayer(rectangle);
            $('#loading_overlay').hide();
        });

}

function filters_value(data) {
    var max_hash = {}
    $.getJSON('/procedure/proceduresMaxValues', data, function(result) {
        max_sliders = result;
        $.each(result, function(index, max) {
            slider = "slider_" + index.toString();
            max_hash[slider] = max;
            //it changes the possible maximum and minimum value of each slider
            document.getElementById("input_slider_" + index.toString() + "_min").setAttribute("max", max_hash[slider]);
            document.getElementById("input_slider_" + index.toString() + "_max").setAttribute("max", max_hash[slider]);
            $("#" + slider).slider({
                min: 0,
                max: max_hash[slider],
                step: 1,
                value: [0, max_hash[slider]],
            });

            $("#slider_" + index.toString()).on("slide", function(slideEvt) {
                slider_min  = "input_" + slideEvt.currentTarget.id + "_min";
                slider_max  = "input_" + slideEvt.currentTarget.id + "_max";
                document.getElementById(slider_min).value = slideEvt.value[0];
                document.getElementById(slider_max).value = slideEvt.value[1];
            });
        });
        $.getJSON('/procedure/proceduresQuartiles', data, function(quartiles) {
            for (i = 0; i < 6; i++) {
                slider = "slider_" + i.toString();
                if(quartiles[i][1] != parseInt(quartiles[i][1], 10)){
                    //*The follow commands will catch 1 decimal places of median withour rouding and the number 1 (1||0) represents the number of decimal places*//
                    var fixed = 1 || 0;
                    fixed = Math.pow(10, fixed);
                    $("#" + slider).slider({
                        min: 0,
                        max: max_hash[slider],
                        step: 1,
                        value: [0, max_hash[slider]],
                        //highlight the [quartile1, quartile3] interval
                        rangeHighlights: [{ "start": quartiles[i][0], "end": quartiles[i][2]}],
                        tooltip: 'show',
                    });
                }
                else{
                    $("#" + slider).slider({
                        min: 0,
                        max: max_hash[slider],
                        step: 1,
                        value: [0, max_hash[slider]],
                        //highlight the [quartile1, quartile3] interval
                        rangeHighlights: [{ "start": quartiles[i][0], "end": quartiles[i][2]}],
                        tooltip: 'show',
                    });
                }
                $("#slider_" + i.toString()).on("change", function(slideEvt) {
                    slider_min  = "input_" + slideEvt.currentTarget.id + "_min";
                    slider_max  = "input_" + slideEvt.currentTarget.id + "_max";
                    document.getElementById(slider_min).value = slideEvt.value.newValue[0];
                    document.getElementById(slider_max).value = slideEvt.value.newValue[1];
                });
            }
            $("#slider_0").slider({
                formatter: function(value) {
                    return 'Mediana: ' + quartiles[0][1];
                },
            });
            $("#slider_1").slider({
                formatter: function(value) {
                    return 'Mediana: ' + quartiles[1][1];
                }
            });
            $("#slider_2").slider({
                formatter: function(value) {
                    return 'Mediana: ' + quartiles[2][1];
                },
            });
            $("#slider_3").slider({
                formatter: function(value) {
                    return 'Mediana: ' + quartiles[3][1];

                },
            });
            $("#slider_4").slider({
                formatter: function(value) {
                    return 'Mediana: ' + quartiles[4][1];
                },
            });
            $("#slider_5").slider({
                formatter: function(value) {
                    var fixed = 1 || 0;
                    fixed = Math.pow(10, fixed);
                    const medianAux = Math.floor(quartiles[5][1] * fixed) / fixed;
                    return 'Mediana: ' + medianAux.toLocaleString('pt-BR');;
                },
            });
            // inputSlider();
            // slider_fix()
        });
    });
}

//** Called when loading the page, init filters **//
function dadosInput() {
    $('#datepicker').datepicker({
        format: "dd/mm/yyyy",
        language: "pt-BR",
        container:'#datepicker',
    });

    $("#slider_cluster").slider({min: 0, max: 22, step: 0.01, value: 8});
    $("#slider_cluster").on("change", function(slideEvt) {
        pixels_cluster = metresToPixels(slideEvt.value.newValue * 1000);
    });


    $("#slider_heatmap").slider({min: 0, max: 22, step: 0.01, value: 5});

    $("#slider_opacity").slider({min: 0, max: 100, step: 1, value: 40});

    filters_value({"data": JSON.stringify({send_all: "True"})});

    for (i = 0; i < 24; i++) {
        name = "#" + i;
        $(name).select2({
            placeholder: "Todos",
            allowClear: true,
            tags: true
        });
    }

    if (cid_array == null) {
        $.getJSON('/CID_hash.json', function(cids) {
            cid_array = cids;
        });
    }

    if (cid_specific_array == null){
        $.getJSON('/CID-10-subcategorias.json', function(file) {    
            cid_specific_array = file;
        });
    }

    if (health_centres_array == null) {
        health_centres_array = {}
        $.getJSON('/health_centres.json', function(hc) {
            $.each(hc, function(index, value) {
                health_centres_array[value.id] = value.text;
            });
        });
    }
}

//*Called when the textbox slider reads a new value*//
function inputSlider(){
    var fields = max_sliders;
    //fields are the maximum value of each slider
    for (var i = 0; i < 6; i++) {
        var minValue = parseInt(document.getElementById("input_slider_" + i.toString() + "_min").value);
        var maxValue = parseInt(document.getElementById("input_slider_" + i.toString() + "_max").value);
        //Treating some corner cases
        if(minValue < 0){
            minValue = 0;
        }
        if(maxValue < 0){
            maxValue = 0;
        }
        if(minValue > parseInt(fields[i])){
            minValue = parseInt(fields[i]);
        }
        if(maxValue > parseInt(fields[i])){
            maxValue = parseInt(fields[i]);
        }
        if(minValue < maxValue) {
            $("#slider_" + i.toString()).slider("setValue", [minValue, maxValue]);
            document.getElementById("input_slider_" + i + "_min").value = minValue;
            document.getElementById("input_slider_" + i + "_max").value = maxValue;
        }
        else {
            document.getElementById("input_slider_" + i + "_min").value = maxValue;
            document.getElementById("input_slider_" + i + "_max").value = minValue;
            $("#slider_" + i.toString()).slider("setValue", [maxValue, minValue]);
        }
    }
}

function updateCompleteness(data){
    if (!data) {
        data = { "data": JSON.stringify({ send_all: "True" }) };
    }
    $.ajax({
        dataType: "json",
        url: "procedure/proceduresCompleteness",
        contentType: 'application/json',
        data: data,
        success: function(data) {
            source = {
              name: $(metadata).find('provider name value').text(),
              initials: $(metadata).find('provider initials value').text(),
              url: $(metadata).find('provider url value').text()
            };
            for (var key in data) {
                data_key = data[key];
                for(var id in data_key){
                    var html_elmt = $("#" + key + "_" + id);
                    html_elmt.html(data_key[id] + "%<div class='tip'><p>" + data_key[id] + "% dos dados possuem esta informação</p><p>Fonte: <a href='" + source.url + "' target='_newtab'>" + source.name + "</a></p></div>");
                    $("#source").html("<a href='" + source.url + "' target='_newtab'>" + source.name + "</a></p></div>");
                    // html_elmt.prop("title", data_key[id] + "% dos dados possuem esta informação\u000AFonte: " + source);
                }
            }
            $("#print-source").html(source);
        }
    });
}

function toggleFilters() {
  $("#filters").toggleClass("active");
  $("#fab").toggleClass("active");
}

function cid10_change(){
    data = getData();
    $("#6").empty(); //#6 is the id of the specific cid10 multiselect
    $.getJSON('/procedure/proceduresCid10Specific', data, function(result) {
        if (Object.keys(result).length > 0){
            $('#6').prop('disabled', false);
        }
        else{
            $('#6').prop('disabled', true);
        }
        $.each(result, function(index, value){
            $.each(cid_specific_array[index], function(index_cid, value_cid){
                if(Object.keys(result[index]).includes(value_cid["SUBCAT"])){
                    $("#6").append(new Option(value_cid["DESCRIC"], value_cid["SUBCAT"]));
                }
                else{
                    option = new Option(value_cid["DESCRIC"], value_cid["SUBCAT"])
                    option.disabled = true;
                    $("#6").append(option);
                }
            });
        });
    });
}

function showHideShape(string_popup, cd_geocodi, cd_geocodd, id, action){
    var DA;
    $.ajax({
        dataType: "json",
        url: "procedure/getSectorByCd_geocodi/",
        async: false,
        data: {data: cd_geocodi, var: "DA"},
        success: function(result){
            DA = result[0]["DA"];
        }
    });
    if(shapes_setor[cd_geocodd] == undefined){
        shapes_setor[cd_geocodd]= {};
        shapes_setor[cd_geocodd][cd_geocodi] = {shape: null, state: false};
    }
    else if(shapes_setor[cd_geocodd][cd_geocodi] == undefined){
        shapes_setor[cd_geocodd][cd_geocodi] = {shape: null, state: false};
    }
    if(action == "Sector"){
        if(shapes_setor[cd_geocodd][cd_geocodi].state == false){
            if(shapes_setor[cd_geocodd][cd_geocodi].shape == null){
                $.ajax({
                    dataType: "json",
                    url: "procedure/getSectorByCd_geocodi/",
                    async: false,
                    data: {data: cd_geocodi, var: "coordinates"},
                    success: function(result){
                        var polygon = {
                            "type": "Feature",
                                "properties": {
                                },
                                "geometry": {
                                "type": "Polygon",
                                    "coordinates": [
                                        JSON.parse(result[0]["coordinates"])["coordinates"][0],
                                ]
                            }
                        };
                        var geojsonLayer = new L.GeoJSON(polygon);
                        map.addLayer(geojsonLayer);
                        shapes_setor[cd_geocodd][cd_geocodi].shape = geojsonLayer.setStyle(myStyle);
                    }
                });
            }
            else{
                map.addLayer(shapes_setor[cd_geocodd][cd_geocodi].shape);                
            }
            shapes_setor[cd_geocodd][cd_geocodi].state = true;
            const string_button_popup = ("<button type='button' id='button-shape_" + id + "' class='btn btn-dark btn-sm' onclick='showHideShape(\"" + string_popup + "\"" + "," + cd_geocodi + ", " + cd_geocodd + ", " + id + ", \"Sector\")'> Ocultar setor </button> ");
            const string_button_popup_all_shapes = ("<button type='button' id='button-all_shapes_" + id + "' class='btn btn-dark btn-sm' onclick='showHideShape(\"" + string_popup + "\"" + "," + cd_geocodi + ", " + cd_geocodd + "," + id + ", \"All Sectors\")'>" + document.getElementById("button-all_shapes_" + id).innerText + "</button>");
            popup_marker_hash[cd_geocodd][cd_geocodi].setContent(string_popup + string_button_popup + string_button_popup_all_shapes);
            popup_marker_hash[cd_geocodd][cd_geocodi].update();                     
        }
        else{
            map.removeLayer(shapes_setor[cd_geocodd][cd_geocodi].shape);
            shapes_setor[cd_geocodd][cd_geocodi].state = false;
            const string_button_popup = ("<button type='button' id='button-shape_" + id + "' class='btn btn-dark btn-sm' onclick='showHideShape(\"" + string_popup + "\"" + "," + cd_geocodi + "," + cd_geocodd + ", " + id + ", \"Sector\")'> Exibir setor </button> ");
            const string_button_popup_all_shapes = ("<button type='button' id='button-all_shapes_" + id + "' class='btn btn-dark btn-sm' onclick='showHideShape(\"" + string_popup + "\"" + "," + cd_geocodi + ", " + cd_geocodd + ", " + id + ", \"All Sectors\")'>" + document.getElementById("button-all_shapes_" + id).innerText + "</button>");
            popup_marker_hash[cd_geocodd][cd_geocodi].setContent(string_popup + string_button_popup + string_button_popup_all_shapes);
            popup_marker_hash[cd_geocodd][cd_geocodi].update();                     
        }
    }
    else if(action == "All Sectors"){
        if(document.getElementById("button-all_shapes_" + id).innerText == "Exibir setores do distrito"){
            $.ajax({
                dataType: "json",
                url: `SetorCensitario/Setor_with_pop-${DA}.json`,
                success: function(data) {
                    shape = new L.geoJson(data,
                        {onEachFeature: function(feature, layer) {
                            // layer.bindTooltip(`População Total: ${parseInt(feature.properties.POPULACAO_TOTAL)} </br>
                            //                    População Feminina: ${parseInt(feature.properties.POPULACAO_MULHER)} </br>
                            //                    População Masculina: ${parseInt(feature.properties.POPULACAO_HOMEM)} </br>
                            //                    População Branca: ${parseInt(feature.properties.POPULACAO_BRANCA)} </br>
                            //                    População Preta: ${parseInt(feature.properties.POPULACAO_PRETA)} </br>
                            //                    População Amarela: ${parseInt(feature.properties.POPULACAO_AMARELA)} </br>
                            //                    População Parda: ${parseInt(feature.properties.POPULACAO_PARDA)} </br>
                            //                    População Indígena: ${parseInt(feature.properties.POPULACAO_INDIGENA)} </br>`, {closeButton: false});
                            var feature_cd_geocodi = feature.properties.CD_GEOCODI;
                            if(shapes_setor[cd_geocodd][feature_cd_geocodi] == undefined){
                                shapes_setor[cd_geocodd][feature_cd_geocodi] = {shape: null, state: false};
                            }
                            if(shapes_setor[cd_geocodd][feature_cd_geocodi].shape == null){
                                shapes_setor[cd_geocodd][feature_cd_geocodi].shape = layer;
                            }
                            if(shapes_setor[cd_geocodd][feature_cd_geocodi].state == false){
                                shapes_setor[cd_geocodd][feature_cd_geocodi].shape.setStyle(myStyle);
                                map.addLayer(shapes_setor[cd_geocodd][feature_cd_geocodi].shape);
                                shapes_setor[cd_geocodd][feature_cd_geocodi].state = true;
                            }                            
                        }
                    });
                    
                }
            });
            $.each(popup_marker_hash[cd_geocodd], function(index, popup){
                content = popup.getContent();
                popup_marker_hash[cd_geocodd][index].setContent(content.replace("Exibir setores do distrito", "Ocultar setores do distrito").replace("Exibir setor", "Ocultar setor"));
                popup_marker_hash[cd_geocodd][index].update();  
            });                   
        }
        else{
            for(cd_geocodi_DA in shapes_setor[cd_geocodd]){
                if(shapes_setor[cd_geocodd][cd_geocodi_DA].state == true){
                    map.removeLayer(shapes_setor[cd_geocodd][cd_geocodi_DA].shape);
                    shapes_setor[cd_geocodd][cd_geocodi_DA].state = false;
                }  
            }
            $.each(popup_marker_hash[cd_geocodd], function(index, popup){
                    content = popup.getContent();
                    popup_marker_hash[cd_geocodd][index].setContent(content.replace("Ocultar setores do distrito", "Exibir setores do distrito").replace("Ocultar setor", "Exibir setor"));
                    popup_marker_hash[cd_geocodd][index].update();  
            });
        }
    }
}