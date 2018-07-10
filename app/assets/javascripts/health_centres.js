var map;
var circles;
var cluster_status;
var markerCluster;
var hcMarkers;

var radius = [10000, 5000, 1000]
var colors = ['#003300', '#15ff00', '#ff0000', "#f5b979" , "#13f1e8" ,  "#615ac7", "#8e3a06", "#b769ab", "#df10eb"];
var colors_circle = ['#FF4444', '#44FF44', '#4444FF']


function initialize() {
    markers_visible(true, -1);
    circles = [];
    cluster_status = false;
    markerCluster = null;
    hcMarkers = [];

    var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
    latlng = L.latLng(-23.557296000000001, -46.669210999999997);
    map = L.map('map', { center: latlng, zoom: 11, layers: [tiles] });
    load_all_points();
    create_chart();
}

function load_all_points() {
    var health_centre_icon = '/health_centre_icon.png';
    var hcIcon = L.icon({iconUrl: health_centre_icon});
    $.getJSON('/points.json', function(points) {
        $.each(points, function(index, point) {
            marker = L.marker(L.latLng(point.lat, point.long), {icon: hcIcon, point: point});
            text = healthCentreClick(point)
            marker.bindPopup(text);
            marker.addTo(map);
            hcMarkers.push(marker);
        });
    });
}

function healthCentreClick(point) {
    if (point.phone == null) {
        point.phone = "Não Informado";
    }
    latlng = L.latLng(point.lat, point.long);
    text = '<strong>Nome:</strong> ' + point.name + '<br><strong>Telefone:</strong> ' + point.phone
    + '<br><strong>Leitos:</strong> ' + point.beds + '<br><strong>Distrito Administrativo:</strong> ' + point.DA
    + '<br><strong>Prefeitura Regional:</strong> ' + point.PR + '<br><strong>Supervisão Técnica de Saúde:</strong> '
    + point.STS + '<br><strong>Coordenadoria Regional de Saúde:</strong> ' + point.CRS
    + "<br><br><button type='button' id='cluster_info' class='btn btn-info btn-sm' onclick='show_clusters(" + point.id + ", " + point.lat + "," + point.long + ")'>"
    + " Mostrar Detalhes </button>" + '<button type="button" class="btn btn-info btn-sm pull-right" data-toggle="modal" onclick="update_chart('+ point.id +')" data-target="#myModal">Análise</button>';
    return text;
}

function show_clusters(id, lat, long) {
    if (cluster_status === false) {
        setup_cluster(id, lat, long);
        var hospital_path = ["/hospital/", id].join("");

        $.getJSON(hospital_path, function(hospital) {
            document.getElementById("search-name").innerHTML = hospital.name;
        });

        create_homepage_charts(id);
    } else {
        teardown_cluster(id);
        $('#legend').hide();
        create_homepage_charts();
    }
}

function setup_cluster(id, lat, long) {
    markers_visible(false, id);
    var procedure_path = ["/procedures/", id].join("");

    $.getJSON(procedure_path, function(procedures) {
        show_procedures(procedures);
        create_circles(id, lat, long);
    });

    $('#cluster_info').text('Esconder Detalhes');
    cluster_status = true;
}

function show_procedures(procedures) {
    markerCluster = L.markerClusterGroup({ chunkedLoading: true });
    var dotIcon = L.icon({
        iconUrl: "https://storage.googleapis.com/support-kms-prod/SNP_2752125_en_v0",
    });
    markerList = procedures.map(function(procedure, i) {
        var lat = procedure[0];
        var lng = procedure[1];
        var id = procedure[2];
        marker = L.marker(L.latLng(lat, lng), {icon: dotIcon, id: id});
        return marker;
    });
    markerCluster.addLayers(markerList);
    map.addLayer(markerCluster);
}

// Remove clusters
function teardown_cluster(id) {
    markers_visible(true, id);
    $('#cluster_info').text('Mostrar Detalhes');
    cluster_status = false;
    document.getElementById("search-name").innerHTML = "São Paulo";
    teardown_circles();
    teardown_markers()
}

function create_circles(id, lat, long) {
    var distance_quartis_path = ["/distance_quartis/", id].join("");
    $.getJSON(distance_quartis_path, function(data) {
        radius = data;
        for (var i = 0; i < 3; i++) {
            var circle = L.circle([lat, long], {
                color: colors_circle[i],
                fillColor: colors_circle[i],
                fillOpacity: 0.4,
                radius: radius[i] * 1000
            }).addTo(map);
            circle.bindTooltip("Raio de " + radius[i] + " Km<br>" + (100 - (25 + 25 * i)).toString() + "% das internações hospitalares")
            circles.push(circle);
        }
    });
}

// Remove radius circles
function teardown_circles() {
    $.each(circles, function(index, circle) {
        circle.remove()
    });
    circles = [];
}

// Remove pacients markers
function teardown_markers() {
    if (markerCluster != null) {
        map.removeLayer(markerCluster)
        markerCluster = null;
    }
}

function markers_visible(visibility, id) {
    $.each(hcMarkers, function(index, marker) {
        if (id != null && marker.options.point.id != id) {
            if (visibility == false)
                marker.remove();
            else
                marker.addTo(map);
        }
    });
}

function update_chart(id) {
    var specialty_path = ["/specialties/", id].join("");
    $.getJSON(specialty_path, function(specialties) {
        var values = [];
        var i = 0;
        $.each(specialties, function(name, number) {
            values.push([name, number, colors[i]]);
            i += 1;
        });
        var header = ["Elementos", "Número de Procedimentos", {role: "style"}];

        values.unshift(header);
        var data = google.visualization.arrayToDataTable(values);

        var view = new google.visualization.DataView(data);
        view.setColumns([0, 1, {calc: "stringify", sourceColumn: 1, type: "string", role: "annotation" }, 2]);

        var options = {
            bar: {groupWidth: "70%"},
                chartArea: {left: 100},
            legend: {position: "none"}
        };

        var chart = new google.visualization.BarChart(document.getElementById("chart_div"));
        chart.draw(view, options);
    });
}

function create_chart() {
    google.charts.setOnLoadCallback(create_homepage_charts);
}

function create_homepage_charts(id) {
    create_right_graph(id);

    if (id == undefined) {
      var path = '/specialties_distance_metric.json';
      $.getJSON(path, function(data) {
          create_bottom_graphs("bt-graph2", data);
      });
    }
    else {
      var path = ["/specialty_distance/", id].join("");
      $.getJSON(path, function(data) {
          for (i = 0; i < Object.keys(data).length; i++) {
            for (j = 1; j < 5; j++) {
              data[i][j] = parseInt(data[i][j]);
            }
            data[i] = Object.values(data[i]);
          }
          data = Object.values(data);

          create_bottom_graphs("bt-graph2", data);
      });
    }
}

function create_right_graph(id) {
    var header = ["Especialidades", "Número de Procedimentos", {role: "style"}];
    var chart = new google.visualization.PieChart(document.getElementById("general-right-graph"));
    var options = {
        width: '100%',
        height:'100%',
        title: "",
        pieHole: 0.8,
        pieSliceBorderColor: "none",
        colors: ['green', 'yellow', 'orange', 'red'],
        pieSliceText: "none",
        backgroundColor: { fill:'transparent'},
        chartArea: {'width': '90%', 'height': '90%'}
    };

    if (id == undefined) {
      var path = '/distance_metric.json'
    }
    else {
      var path = ["/distances/", id].join("");
    }
    $.getJSON(path, function(data) {
        draw_chart(header, data, chart, options, null);
        update_right_graph_text(data);
    });
}


function create_bottom_graphs(id, data) {
    var chart = new google.visualization.BarChart(document.getElementById(id));
    var header = ['Genre', ' < 1 Km', '> 1 Km e < 5 Km',
                  '> 5 Km e  < 10 Km', '> 10 Km', {role: 'annotation' }];
    var options = {
        height :"100%",
        legend: { position: 'none'},
        isStacked: 'percent',
        chartArea: {  width: "80%", height: "70%", left:"20%" },
        vAxis: {minValue: 0,
                ticks: [0, .2, .4, .6, .8, 1],
                textStyle: {fontName: 'Arial',
                            fontSize: '18'
                           }
        },
        hAxis: {
              textStyle: {fontName: 'Arial',
                          fontSize: '18'
                         }
        },
        bar: {groupWidth: '35%'},
        series: {0:{color:'green'},
                 1:{color:'yellow'},
                 2:{color:'orange'},
                 3:{color:'red'}
                }
    };
    draw_bottom_graph(header, data, chart, options);
}

function draw_bottom_graph(header, data, chart, options) {
    var values = data;

    values.unshift(header);
    var data_table = google.visualization.arrayToDataTable(values);
    var view = new google.visualization.DataView(data_table);
    chart.draw(view, options);
}

function update_right_graph_text(data) {
    var $graph_text1 = $('#labelOverlay .n_procedures');
    var $graph_text2 = $('#labelOverlay .atendimentos');
    sum = 0;
    $.each(data,function(key, value) {
        sum += parseInt(value, 10);
    });
    $graph_text1.html("<br><br><br> " + sum);
    $graph_text2.html("Procedimentos");
}

function about() {
    window.open("about");
}

// $(window).resize(function(){
//   create_homepage_charts();
// });
