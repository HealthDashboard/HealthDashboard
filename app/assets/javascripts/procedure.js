var SPmap = null;
var SPmap_label = null;
var latlng = null;
var health_centres_var = {};
var health_centre_icon = '/health_centre_icon.png';
var cid_array = null;
var data = null;
var procedure_info_boxes = [];
var procedure_info_box_opened;

// Automatic search
var auto = false;
var cleaning = false;

// Health Centres icon on map
var Markers = [];

//* POLYGONS *//
// Region name
var regions = ['oeste', 'norte', 'leste', 'sul', 'sudeste', 'centro'];
// Drawings representing regions 
var draw_region = {};
// Labels for regions total pacients
var labels_region = {};
// Total pacients in each region
var total_region = {};
// Label points for regions
var label_points = {'oeste' : [-23.562630, -46.734051], 'norte' : [-23.459998, -46.670880], 'sul' : [-23.762625, -46.704525], 'leste' : [-23.552559, -46.443600], 'sudeste' : [-23.557594, -46.569251], 'centro' : [-23.547838, -46.633801] };
//**//

//** Filtros para impressão **//
var filters_text = [];
var filters = [];
var genders = [];
var start_date = null;
var end_date = null;
var dist_min = null;
var dist_max = null;

var filters_print = ["Estabelecimento de ocorrência", "Faixa etária", "Especialidade do leito", "Caráter do atendimento", "Grupo étnico", "Nível de instrução", "Competência",
      "Grupo do procedimento autorizado", "Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Diagnóstico secundário 3 (CID-10)", "Total geral de diárias", 
      "Diárias UTI", "Diárias UI", "Dias de permanência", "Tipo de financiamento", "Valor Total", "Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", "Complexidade", "Gestão"];

function initProcedureMap() {
    SPmap = null;
    SPmap_label = null;
    health_centres_var= {};
    auto = false;
    cleaning = false;
    Markers = [];
    draw_region = {};
    labels_region = {};
    total_region = {};
    procedure_info_boxes = [];

    $('#loading_overlay').hide();
    var lat = -23.557296000000001;
    var lng = -46.669210999999997;
    latlng = new google.maps.LatLng(lat, lng);

    var options = {
                    zoom: 11,
                    center: latlng,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                  };

    map = new google.maps.Map(document.getElementById("procedure_map"), options);
    SPmap_label = new MapLabel({
                      fontSize: 28,
                      align: 'center'
                  });
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

    // Show data 
    $('#loading_overlay').show();
    bounds = [];
    $.each(sp_coordenadas, function(index, point){
        bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])));
    });

    SPmap = new google.maps.Polygon({
        strokeColor: '#CCCCCC',
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: '#CCCCCC',
        fillOpacity: 0.50,
        map: map,
        path: bounds
    });
    TOTAL = 0;
    $.getJSON("procedure/procedures_search", data, function(result) {
        $.each(regions, function(index, region) {
            total_region[region] = 0;
            labels_region[region] = createLabel(24);
            num = parseInt(result[0][region]);
            total_region[region] = num;
            TOTAL += num;
        });
        SPmap_label.set('text', TOTAL.toString());
        SPmap_label.set('position', latlng);
        SPmap_label.set('map', map);
        $('#loading_overlay').hide();
    });

    google.maps.event.addListener(SPmap, 'click', function (event) {
        SPmap.setMap(null);
        SPmap_label.set('map', null);

        // Procedure.count < 100.000 show clusters, otherwise only polygons.
        if (TOTAL < 100000) {
            $('#loading_overlay').show();
            $.getJSON("procedure/procedures_latlong", data, function(procedures) {
                show_procedures_with_info(procedures);
                $('#loading_overlay').hide();
            });
        } else {
            $.each(regions, function(index, region) {
                bounds = [];
                $.each(polygons_region[region], function(index, point) {
                    bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])));
                });
                draw_region[region] = new google.maps.Polygon(makeOptions(bounds));
                labels_region[region].set('text', total_region[region].toString());
                labels_region[region].set('position', new google.maps.LatLng(label_points[region][0], label_points[region][1]));
                labels_region[region].set('map', map);
            });
        }
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
        procedure_info(marker, id, procedure_info_text);
        return marker;
    });

    var options = {
        zoomOnClick: false,
        minimumClusterSize: 3,
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    };
    markerCluster.push(new MarkerClusterer(map, markers, options));
}

function procedure_info(marker, id, generate_infobox_text) {
    procedure_info_boxes[id] = new google.maps.InfoWindow();
    procedure_info_boxes[id].marker = marker;
    procedure_info_boxes[id].id = id;

    procedure_listener(marker, id, generate_infobox_text);
}

function procedure_listener(marker, id, generate_infobox_text) {
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

function procedure_info_text(id) {
    var sexp_var = {};
    sexp_var["M"] = "Masculino";
    sexp_var["F"] = "Feminino";
  
    var procedure_info_path = ["/procedure/procedure_info", id].join("/");
  
    $.getJSON(procedure_info_path, function(result){
        text =  "<strong>Estabelecimento: </strong>" + health_centres_var[parseInt(result[0].cnes_id)] + "<br>";
        text += "<strong>Sexo: </strong>" + sexp_var[result[0].gender] + "<br>";
        text +=  "<strong>Idade: </strong>" + result[0].age_number + "<br>";
        text += "<strong>CID: </strong>" + cid_array[result[0].cid_primary] + "<br>";
        text += "<strong>CRS: </strong>" + result[0].CRS + "<br>";
        text += "<strong>Data: </strong>" + result[0].date + "<br>";
        text += "<strong>Distância: </strong>" + parseFloat(result[0].distance).toPrecision(5) + "Km <br>";
        return text;
    });
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

function clearPolygons(ARRAY, ARRAY_LABELS) {
    $.each(ARRAY, function(index, polygon){
        if (polygon != null)
            polygon.setMap(null);
    });

    $.each(ARRAY_LABELS, function(index, label){
        label.set('map', null);
    });
}

function makeOptions(bounds) {
    return {
            strokeColor: '#CCCCCC',
            strokeOpacity: 1,
            strokeWeight: 2,
            fillColor: '#CCCCCC',
            fillOpacity: 0.55,
            map: map,
            path: bounds
          };
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

    clearMap();
}

function clearMap() {
    teardown_markers();

    $.each(regions, function(index, region) {
        if (draw_region[region] != null)
            draw_region[region].setMap(null);

        if (labels_region[region] != null)
            labels_region[region].set('map', null);
    });
    
    if (SPmap != null)
        SPmap.setMap(null);

    if (SPmap_label != null)
        SPmap_label.set('map', null);

    setMarkersMap(null);
    Markers = [];
    cleaning = false;
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
      if (filters_text[index] != "")
          filters_div_text = filters_div_text.concat("<br />" + value + ": " + filters_text[index]);
    });

    if (genders != null)
      filters_div_text = filters_div_text.concat("<br />Sexo: " + genders.join(", "));

    if (start_date != "")
      filters_div_text = filters_div_text.concat("<br />Data mínima: " + start_date);

    if (end_date != "")
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
