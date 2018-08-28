//* MAP *//
var map;

//* Array[id] = Display name *//
var health_centres_array = null;
var cid_array = null;

//** Data input from filters **//
var data = null;

//** Automatic search **//
var auto, cleaning;

//** Max value for sliders, change with the search result **//
var max_sliders = null

//** Health Centres icon on map **//
var health_centre_markers;

//** Print vars **//
var filters_text, filters, genders, start_date, end_date, dist_min, dist_max;

//** Open Street view vars **//
var heat, cluster, shape, clean_up_cluster, max;

var id;

NUM_FILTERS = 19;

//** Display name for printing **//
var filters_print = ["Estabelecimento de ocorrência", "Faixa etária", "Especialidade do leito", "Caráter do atendimento", "Grupo étnico", "Nível de instrução", "Competência",
      "Grupo do procedimento autorizado", "Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Diagnóstico secundário 3 (CID-10)", "Total geral de diárias",
      "Diárias UTI", "Diárias UI", "Dias de permanência", "Tipo de financiamento", "Valor Total", "Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", "Complexidade", "Gestão"];

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
    shape = null;
    clean_up_cluster = [];
    id = "Procedure"

    $('#loading_overlay').hide();
    var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

    L.control.scale({imperial: false, position: 'bottomright'}).addTo(map);
}

//** Called when a visualization shape is selected, remove any previous selected shape and draws a new one **//
function setShape(name, popup) {
    var myStyle = {
        "color": "#444444",
        "opacity": 0.9,
        "stroke": true,
        "fill": false,
    };

    if(name === 'Shape_ESF.geojson'){
        myStyle = {
            "color": "#444444",
            "stroke": true,
            "lineCap": "butt",
            "fillColor": "#4e4e4e",
            "fillRule": "nonzero",
            "fill": false,
            "opacity": 0.4,
        };
    }

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
            if (popup != null)
                shape.bindPopup(popup);
    }});
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
function change() {
    if (cleaning == false && auto == true) {
        data = getData()
        buscar(data);
        filters_value(data);
    }
}

function getData() {
    var sexo_masculino = document.getElementById('sexo_masculino');
    var sexo_feminino = document.getElementById('sexo_feminino');
    var genders = [];
    var filters = [];
    var filters_text = [];

    for (i = 0; i < NUM_FILTERS; i++) {
        var aux = [];
        var aux_name = [];
        var select_name = $('#' + i + ' option:selected');
        var options = $(select_name);
        $.each(options, function(index, value){
            aux.push(value.value);
            aux_name.push([value.text]);
        });

        filters_text.push(aux_name.join(", "));
        filters.push(aux.join(";"));
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

    data = {send_all: "False", data: 1, filters: filters, genders: genders.toString(), start_date: start_date.toString(), end_date: end_date.toString(), sliders: sliders};
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

    var pixels_bounds_cluster = $("#slider_cluster").slider("getValue");
    var pixels_bounds_heatmap = $("#slider_heatmap").slider("getValue");

    var heatmap_opacity = $("#slider_opacity").slider("getValue");

    // handling all cluster now
    health_centres_makers(health_centres);
    handleLargeCluster(map, "procedure/procedure_large_cluster", data, pixels_bounds_cluster, pixels_bounds_heatmap, heatmap_opacity, CustomMarkerOnClick);

    // Divida tecnica
    checked = $('input[name=optRadio]:checked', '#radio-list');
    $('input[name=optRadio][value=6]', '#radio-list').trigger('click');
    $(checked).attr('checked', true).trigger('click');
}

function handleLargeCluster(map, path,data, max_cluster, max_heatmap, heatmap_opacity, function_maker) {
    max = 0;
    cluster = L.markerClusterGroup({
        maxClusterRadius: max_cluster,
        chunkedLoading: true,
        iconCreateFunction: function(cluster) {
            var markers = cluster.getAllChildMarkers();
            var n = 0;
            for (var i = 0; i < markers.length; i++) {
                n += markers[i].number;
            }
            if (n < 5000) {
                className = 'map-marker marker-5k a-class';
                size = 40;
            } else if (n < 100000) {
                className = 'map-marker marker-10k a-class';
                size = 60;
            } else if (n >= 100000) {
                className = 'map-marker marker-100k a-class';
                size = 80;
            }
            if (n > max) {
                max = n;
            }
            document.getElementById("legend-label-6").innerText = (max);

            return L.divIcon({ html: n, className: className, iconSize: L.point(size, size) });
        }
    });

    $.getJSON(path, data, function(procedures) {
        markerList = [];
        heatmap_procedure = [];
        Num_procedures = 0;

        $.each(procedures, function(index, latlong){
            icon = L.divIcon({ html: latlong[2], className: 'map-marker marker-single a-class', iconSize: L.point(30, 30) });
            marker = L.marker(L.latLng(latlong[0], latlong[1]), {icon: icon})
            marker.latlong = [latlong[0], latlong[1]];
            marker.number = latlong[2];
            marker.clusterOpen = false;
            marker.cluster = null;
            marker.on('click', function_maker);
            markerList.push(marker);
            Num_procedures += latlong[2]
        });
        cluster.addLayers(markerList);
        map.addLayer(cluster);

        $.each(procedures, function(index, procedure) {
            heatmap_procedure.push([procedure[0], procedure[1], (procedure[2] / Num_procedures) * 100]);
        });

        heat = L.heatLayer(heatmap_procedure, {maxZoom: 11, radius: max_heatmap, blur: 50, gradient: {.4:"#F8A5B2",.6:"#F97C85",.7:"#FB5459",.8:"#FC2C2D",1:"#FE0401"}}); // Add heatmap

        //inserting the first and last values
        document.getElementById("legend-label-1").innerText = 0.0;
        map.addLayer(heat);

        X = document.getElementsByClassName("leaflet-heatmap-layer")
        X[0].style["opacity"] = heatmap_opacity / 100;
    
        $('#loading_overlay').hide();
    });
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
        var dotIcon = L.icon({
            iconUrl: "https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0", iconAnchor: [5, 0]
        });

        path = "procedure/procedure_setor"

        list = []
        $.getJSON(path, {lat: marker.latlong[0], long: marker.latlong[1]}, function(procedures){
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
    var procedure_info_path = ["/procedure/procedure_info", id].join("/");

    setVisible(false);

    //Only get the data the first time its clicked
    if (e.target.getPopup() === undefined) {
        $.getJSON(procedure_info_path, function(procedure) {
            cnes = procedure[0].cnes_id;
            $.getJSON("procedure/health_centres_procedure", {cnes: cnes.toString()}, function(hc_latlong) {
                path_distance_real = "http:\/\/router.project-osrm.org\/route\/v1\/driving\/" 
                + hc_latlong[0][1] + "," + hc_latlong[0][0] + ";" + procedure[0].long + "," 
                + procedure[0].lat + "?overview=false";
                
                $.getJSON(path_distance_real, function(distance) { //get Real distance usign router.project-osrm.org
                    v_distance = parseFloat(distance.routes[0].distance);
                    v_distance = v_distance / 1000; // m -> km

                    text =  "<strong>Estabelecimento: </strong>" + health_centres_array[parseInt(cnes)] + "<br>";
                    text += "<strong>Sexo: </strong>" + sexp_var[procedure[0].gender] + "<br>";
                    text +=  "<strong>Idade: </strong>" + procedure[0].age_number + "<br>";
                    text += "<strong>CID: </strong>" + cid_array[procedure[0].cid_primary] + "<br>";
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
    $.getJSON("procedure/health_centres_procedure", {cnes: health_centres.toString()}, function(result){
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
    filters_value({send_all: "True"});
    for (i = 0; i < 24; i++) {
        name = ".select-" + i;
        $(name).val('').trigger('change');
    }
    $("#intervalStart").val('').datepicker('destroy').datepicker();
    $("#intervalEnd").val('').datepicker('destroy').datepicker();
    $("#sexo_masculino").prop("checked", true);
    $("#sexo_feminino").prop("checked", true);
    cleaning = false;
    for(var i=1; i < 7; i++){
        document.getElementById("legend-label-" + i).innerText = "";
    }
    $('input[name=optRadio][value=6]', '#radio-list').trigger('click');
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
}

//** Called when "Dados Gerais" button is clicked, open "Dados Gerais" page and passes filter values to it **//
function graphs() {
    var w = window.open('dados-gerais');
    w._data_filters = data;
}

//** Called when "Imprimir" butotn is clicked, opens a print dialog **//
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

function filters_value(data) {
    var max_hash = {}
    $.getJSON('/procedure/max_values', data, function(result) {
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
        $.getJSON('/procedure/procedure_quartiles', data, function(quartiles) {
            for (i = 0; i < 6; i++) {
                slider = "slider_" + i.toString();
                if(quartiles[i][1] != parseInt(quartiles[i][1], 10)){
                    //*The follow commands will catch 1 decimal places of median withour rouding and the number 1 (1||0) represents the number of decimal places*//
                    var fixed = 1 || 0;
                    fixed = Math.pow(10, fixed);
                    const medianAux = Math.floor(quartiles[i][1] * fixed) / fixed;
                    //the last field has a float number, so it is a special case
                    //this commands will position the label in the correct place
                    //const lastText = document.getElementById("label_slider_" + i.toString()).innerText;
                    //document.getElementById("label_slider_" + i.toString()).setAttribute("title", lastText + " [ Mediana: " + medianAux.toLocaleString('pt-BR') + " ]");
                    //document.getElementById("label_median_slider_" + i.toString()).innerText = medianAux.toLocaleString('pt-BR');
                    //$("#label_median_slider_" + i.toString()).css('margin-left', (13+(75*median[i]/max_hash[slider])) + "%");
                    //OBS: the number '13' represents a correct position of label
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
                    const lastText = document.getElementById("label_slider_" + i.toString()).innerText;
                    //document.getElementById("label_slider_" + i.toString()).setAttribute("title", lastText + " [ Mediana: " + median[i] + " ]");
                    //document.getElementById("label_median_slider_" + i.toString()).innerText = median[i];
                    //$("#label_median_slider_" + i.toString()).css('margin-left', (15+(75*median[i]/max_hash[slider])) + "%");
                    //OBS: the number '15' represents the initil value of label position (look margin-left of cl)
                    //OBS: this is not totally correct because it is not possible explain why the value '75' was choose, it just works
                    //OBS: if another field with different characteristics needs to be represented in that way, possibly the label will be in a wrong position
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
                $("#slider_" + i.toString()).on("slide", function(slideEvt) {
                    slider_min  = "input_" + slideEvt.currentTarget.id + "_min";
                    slider_max  = "input_" + slideEvt.currentTarget.id + "_max";
                    document.getElementById(slider_min).value = slideEvt.value[0];
                    document.getElementById(slider_max).value = slideEvt.value[1];
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
            slider_fix()
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

    $("#slider_cluster").slider({min: 0, max: 500, step: 1, value: 80});

    $("#slider_heatmap").slider({min: 0, max: 500, step: 1, value: 25});

    $("#slider_opacity").slider({min: 0, max: 100, step: 1, value: 40});

    filters_value({send_all: "True"});

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
