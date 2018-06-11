var SPmap_label = null;
var latlng = null;
var health_centres_var = {};
var health_centre_icon = '/health_centre_icon.png';
var cid_array = null;
var data = null;
var procedure_info_boxes = [];
var procedure_info_box_opened;
var procedureCluster = [];

// Automatic search
var auto, cleaning;

// Health Centres icon on map
var Markers = [];

// Region name
var regions = ['oeste', 'norte', 'leste', 'sul', 'sudeste', 'centro'];

//** Filtros para impressão **//
var filters_text, filters, genders, start_date, end_date, dist_min, dist_max;

var heat = null;
var markers = null;
var shape = null;

var filters_print = ["Estabelecimento de ocorrência", "Faixa etária", "Especialidade do leito", "Caráter do atendimento", "Grupo étnico", "Nível de instrução", "Competência",
      "Grupo do procedimento autorizado", "Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Diagnóstico secundário 3 (CID-10)", "Total geral de diárias", 
      "Diárias UTI", "Diárias UI", "Dias de permanência", "Tipo de financiamento", "Valor Total", "Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", "Complexidade", "Gestão"];

function initProcedureMap() {
    auto = false;
    cleaning = false;
    Markers = [];
    procedure_info_boxes = [];
    data = null;
    filters_text = [];
    filters = [];
    genders = [];
    start_date = null;
    end_date = null;
    dist_min = null;
    dist_max = null;
    markers = null;
    teardown_procedure_markers();

    $('#loading_overlay').hide();
    var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      latlng = L.latLng(-23.557296000000001, -46.669210999999997);
    map = L.map('procedure_map', { center: latlng, zoom: 11, layers: [tiles] });

    SPmap_label = new MapLabel({
                      fontSize: 28,
                      align: 'center'
                  });
}

function setShape(name) {
    var myStyle = {
        "color": "#444444",
        "opacity": 0.55
    };

    if (shape != null)
        map.removeLayer(shape);

    $.ajax({
        dataType: "json",
        url: name,
        success: function(data) {
            shape = new L.geoJson(data, 
                {onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.Name) {
                        layer.bindTooltip(feature.properties.Name, {closeButton: false});
                    }
                }}).addTo(map);
            shape.setStyle(myStyle);
    }});
}

function createLabel(size) {
    return new MapLabel({
                          fontSize: size,
                          align: 'center'
                        });
}

function automatic_search() {
    var checkbox_search = document.getElementById('automatic_search_checkbox');

    if (checkbox_search.checked)
        auto = true;
    else
        auto = false;
}

function change() {
    if (cleaning == false && auto == true)
        buscar();
}

// Show health centres markers on map
function health_centres_makers(health_centres) {
    $.getJSON("procedure/health_centres_procedure", {cnes: health_centres.toString()}, function(result){
        $.each(result, function(index, health_centre){
            create_markers(health_centre, health_centre_icon);
        });
    });
    setMarkersMap(map);
}

// Search button
function buscar() {
    var sexo_masculino = document.getElementById('sexo_masculino');
    var sexo_feminino = document.getElementById('sexo_feminino');
    var residencia_paciente = document.getElementById('checkbox_residencia_paciente');
    var hc = document.getElementById('checkbox_health_centre');

    genders = [];
    filters = [];
    filters_text = [];
    var health_centres = [];

    for (i = 0; i < 24; i++) {
        var aux = [];
        var aux_name = [];
        var select_name = $('#' + i + ' option:selected');
        var options = $(select_name);
        $.each(options, function(index, value){
            aux.push(value.value);
            aux_name.push([value.text]);
        });
        if (i == 0)
            health_centres.push(aux);

        filters_text.push(aux_name.join(", "));
        filters.push(aux.join(";"));
    }

    start_date = $("#intervalStart").datepicker({ dateFormat: 'dd,MM,yyyy' }).val();
    end_date = $("#intervalEnd").datepicker({ dateFormat: 'dd,MM,yyyy' }).val();

    if(sexo_masculino.checked)
        genders.push("M");

    if(sexo_feminino.checked)
        genders.push("F");

    var distance_max = document.getElementById('slider_distance_max');
    var distance_min = document.getElementById('slider_distance_min');
    dist_min = parseFloat(distance_min.textContent);
    dist_max = parseFloat(distance_max.textContent);

    data = {gender: genders.toString(), start_date: start_date.toString(), end_date: end_date.toString(), 
            dist_min: dist_min.toString(), dist_max: dist_max.toString(), filters: filters};

    clearMap();

          // if (TOTAL < 50000) {
            $('#loading_overlay').show();
            markerList = []
            markers = L.markerClusterGroup({ chunkedLoading: true });
            var greenIcon = L.icon({
              iconUrl: "https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0",
            });
            $.getJSON("procedure/procedures_latlong", data, function(procedures) {
                    var locations = procedures.map(function(procedure) {
                        var location = L.latLng(procedure[0], procedure[1]);
                        return location;
                    });

                    heat = L.heatLayer(locations, { radius: 35 });
                    map.addLayer(heat);


                markerList = procedures.map(function(procedure, i) {
                    var lat = procedure[0];
                    var lng = procedure[1];
                    var id = procedure[2];
                    marker = L.marker(L.latLng(lat, lng), {icon: greenIcon});

                  // marker.bindPopup(id.toString());
                  return marker;
                });
                markers.addLayers(markerList);
                map.addLayer(markers);
                $('#loading_overlay').hide();
            });

          // }

    // Show data 
    // $('#loading_overlay').show();
    // TOTAL = 0;
    // $.getJSON("procedure/procedures_total", data, function(result) {
    //     TOTAL = parseInt(result)
    //     SPmap_label.set('text', TOTAL.toString());
    //     SPmap_label.set('position', latlng);
    //     SPmap_label.set('map', map);
    //     $('#loading_overlay').hide();
    // });
    
    // map.data.setStyle({
    //     strokeColor: '#000000',
    //     strokeOpacity: 1,
    //     strokeWeight: 2,
    //     fillColor: '#888888',
    //     fillOpacity: 0.50,
    //     visible: true
    // });

    // map.data.addListener('click', function(event) {
    //     // Procedure.count < 100.000 show clusters, otherwise only polygons.
    //     if (TOTAL < 50000) {
    //         $('#loading_overlay').show();
    //         $.getJSON("procedure/procedures_latlong", data, function(procedures) {
    //           for (var i = 0; i < procedures.length; i++) {
    //             // var a = addressPoints[i];
    //             var title = a[2];
    //             var marker = L.marker(L.latLng(procedures[i][0], procedures[i][1]), { id: procedures[i][2] });
    //             marker.bindPopup(title);
    //             markerList.push(marker);
    //             markers.addLayers(markerList);
    //             map.addLayer(markers);
    //           }
    //             // show_procedures_with_info(procedures);
    //             // $('#loading_overlay').hide();
    //         });
    //         SPmap_label.set('map', null);
    //         map.data.setStyle({visible: false});
    //     } else {
    //        // Do something
    //     }
    // });
}

function popup_value(id) {
    var sexp_var = {};
    sexp_var["M"] = "Masculino";
    sexp_var["F"] = "Feminino";

    var procedure_info_path = ["/procedure/procedure_info", id].join("/");
    $.getJSON(procedure_info_path, function(result) {
        cnes = result[0].cnes_id;
        text =  "Estabelecimento: " + health_centres_var[parseInt(cnes)];
        text += "Sexo: " + sexp_var[result[0].gender];
        text +=  "Idade: " + result[0].age_number;
        text += "CID: " + cid_array[result[0].cid_primary];
        text += "CRS: " + result[0].CRS ;
        text += "Data: " + result[0].date;
        text += "Distância: " + parseFloat(result[0].distance).toPrecision(4) + " Km";
    });
}

function show_procedures_with_info(procedures) {
    var markers = procedures.map(function(procedure, i) {
        var lat = procedure[0];
        var lng = procedure[1];
        var id = procedure[2];

        marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            icon: "https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0"
        });
        procedure_info(marker, id);
        return marker;
    });

    var options = {
        zoomOnClick: false,
        minimumClusterSize: 3,
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    };
    procedureCluster.push(new MarkerClusterer(map, markers, options));
}

function procedure_info(marker, id) {
    procedure_info_boxes[id] = new google.maps.InfoWindow();
    procedure_info_boxes[id].marker = marker;
    procedure_info_boxes[id].id = id;

    procedure_listener(marker, id);
}

function procedure_listener(marker, id) {
    procedure_info_boxes[id].listener = google.maps.event.addListener(marker, 'click', function(e) {
        var sexp_var = {};
        sexp_var["M"] = "Masculino";
        sexp_var["F"] = "Feminino";
    
        var procedure_info_path = ["/procedure/procedure_info", id].join("/");
    
        $.getJSON(procedure_info_path, function(result) {
            cnes = result[0].cnes_id;
            text =  "<strong>Estabelecimento: </strong>" + health_centres_var[parseInt(cnes)] + "<br>";
            text += "<strong>Sexo: </strong>" + sexp_var[result[0].gender] + "<br>";
            text +=  "<strong>Idade: </strong>" + result[0].age_number + "<br>";
            text += "<strong>CID: </strong>" + cid_array[result[0].cid_primary] + "<br>";
            text += "<strong>CRS: </strong>" + result[0].CRS + "<br>";
            text += "<strong>Data: </strong>" + result[0].date + "<br>";
            text += "<strong>Distância: </strong>" + parseFloat(result[0].distance).toPrecision(4) + " Km <br>";
            procedure_info_boxes[id].setContent(text);
            procedure_open_info_box(id, marker, cnes);
        });
    });
}

function procedure_open_info_box(id, marker, cnes) {
    if ((typeof(procedure_info_box_opened) === 'number' && typeof(procedure_info_boxes[procedure_info_box_opened]) === 'object'))
        procedure_info_boxes[procedure_info_box_opened].close();

    setMarkersMap(null);
    Markers = [];

    if (procedure_info_box_opened !== id) {
        procedure_info_boxes[id].open(map, marker);
        procedure_info_box_opened = id;
        health_centres_makers(cnes);
    } else {
        procedure_info_box_opened = -1;
    }
}

function create_markers(procedure, icon_path) {
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(procedure.lat, procedure.long),
        map: map,
        icon: icon_path
    });
    Markers.push(marker);
}

function setMarkersMap(map) {
    for (var i = 0; i < Markers.length; i++)
        Markers[i].setMap(map);
}

// May use it to remove polygon labels 
function attachPolygonInfoWindow(polygon) {
    var infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(polygon, 'mouseover', function (e) {
        infoWindow.setContent("Polygon Name");
        var latLng = e.latLng;
        infoWindow.setPosition(latLng);
        infoWindow.open(map);
    });
}

function limpar() {
    cleaning = true;
    $("#slider_distance").slider('refresh');
    $("#slider_distance_min").html('0');
    $("#slider_distance_max").html('30+');

    for (i = 0; i < 24; i++) {
        name = ".select-" + i;
        $(name).val('').trigger('change');
    }
    $("#intervalStart").val('').datepicker('destroy').datepicker();
    $("#intervalEnd").val('').datepicker('destroy').datepicker();
    $("#sexo_masculino").prop("checked", true);
    $("#sexo_feminino").prop("checked", true);
    cleaning = false;
    clearMap();
}

// Remove pacients markers
function teardown_procedure_markers() {
    if (procedureCluster != null) {
        $.each(procedureCluster, function(index, cluster){
            cluster.clearMarkers();
        });
        procedureCluster = [];
    }
}

function clearMap() {
    if (markers != null)
        map.removeLayer(markers)

    if (heat != null)
        map.removeLayer(heat)
    heat = null
    markers = null
    // teardown_procedure_markers();
    // map.data.setStyle({visible: false});
    // SPmap_label.set('map', null);
    // setMarkersMap(null);
    // Markers = [];
}

function graphs() {
    var w = window.open('dados-gerais');
    w._data_filters = data;
}

function print_maps() {
    const $body = $('body');
    const $mapContainer = $('.map-wrapper');
    const $mapContainerParent = $mapContainer.parent();
    const $printContainer = $('<div style="position:relative;">');
    mapSize = $mapContainer.height();
    const $info = $('<div style="position: relative"><h4>Autorizações de Internação Hospitalar, AIH - tipo 1 (Normal),' +
                    ' mapeadas pelo endereço de residência do paciente deslocadas para o centróide do setor censitário ' + 
                    'correspondente.</h4></div>');
    const $space_map = $('<div style="height: ' + (mapSize + 150) + 'px;"></div>');

    var filters_div_text = '<div style="position: relative">';
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

    filters_div_text = filters_div_text.concat("</div>");
    const $filters_div = $(filters_div_text);

    $printContainer
      .height(mapSize + 100)
      .append($mapContainer)
      .append($space_map)
      .append($info)
      .append($filters_div)
      .prependTo($body);

    const $content = $body
      .children()
      .not($printContainer)
      .not('script')
      .detach();

    /**
     * Needed for those who use Bootstrap 3.x, because some of
     * its @media print styles ain't play nicely when printing.
     */
    const $patchedStyle = $('<style media="print">')
      .text('img { max-width: none !important; } a[href]:after { content: ""; }')
      .appendTo('head');

    window.print();

    $body.prepend($content);
    $mapContainerParent.prepend($mapContainer);

    $printContainer.remove();
    $patchedStyle.remove();
}

function dadosInput() {
    $('#datepicker').datepicker({
        format: "dd/mm/yyyy",
        language: "pt-BR",
        container:'#datepicker',
    });

    $("#slider_distance").slider({
        min: 0,
        max: 30,
        step: 1,
        value: [0,30],
    });

    $("#slider_distance").on("slide", function(slideEvt) {
        $("#slider_distance_min").html(slideEvt.value[0]);
        $("#slider_distance_max").html(slideEvt.value[1] + (slideEvt.value[1] >= 30 ? "+" : ""));
    });

    for (i = 0; i < 24; i++) {
        name = "#" + i;
        $(name).select2({
            placeholder: "Todos",
            allowClear: true,
            tags: true
        });
    }

    if (cid_array == null) {
        $.getJSON('/CID_hash.json', function(data) {
            cid_array = data;
        });
    }

    if (Object.keys(health_centres_var).length == 0) {
        $.getJSON('/health_centres.json', function(data) {
            $.each(data, function(index, value) {
                health_centres_var[value.id] = value.text;
            });
        });
    }
}
