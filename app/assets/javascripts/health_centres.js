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
    latlng = L.latLng(-23.56, -46.58);
    map = L.map('map', { center: latlng, zoom: 11, layers: [tiles] });
    L.control.scale({imperial: false, position: 'bottomright'}).addTo(map);
    $('#loading_overlay').hide();
}

function load_all_points() {
    $.getJSON('/points.json', function(points) {
        $.each(points, function(index, point) {
            var health_centre_icon;
            //the icon will be different for each administration type
            if(point.adm === 'MUNICIPAL'){
                health_centre_icon = '/health_centre_icon2.png';
            }
            if(point.adm === 'ESTADUAL'){
                health_centre_icon = '/health_centre_icon.png';
            }
            var hcIcon = L.icon({iconUrl: health_centre_icon, iconAnchor: [25, 0]});
            marker = L.marker(L.latLng(point.lat, point.long), {icon: hcIcon, point: point, alt: point.name, riseOnHover:true, interactive: true});
            marker.bindTooltip(point.name, {direction:'top'});
            marker.on('click', onClick);
            function onClick(e) {
                healthCentreClick(point);
                show_clusters(point.id, point.lat, point.long);
            }
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
    text = '<div id="hosp-info-text">'
    + '<strong>Telefone:</strong> ' + point.phone
    + '<br><strong>Leitos:</strong> ' + point.beds
    + '<br><strong>Distrito Administrativo:</strong> ' + point.DA
    + '<br><strong>Prefeitura Regional:</strong> ' + point.PR
    + '<br><strong>Supervisão Técnica de Saúde:</strong> ' + point.STS
    + '<br><strong>Coordenadoria Regional de Saúde:</strong> ' + point.CRS
    + '<br></div><div class="btn-row">'
    + '<button type="button" class="button" data-toggle="modal" onclick="update_chart('+ point.id +')" data-target="#myModal">Análise</button>'
    + '<button type="button" class="button" onclick="show_clusters(' + point.id + ', ' + point.lat + ',' + point.long + ')">Esconder Detalhes</button>'
    + '<button type="button" id="hide_btn" class="button" onclick="hide_info()">Esconder info</button>'
    + '</div>';
    document.getElementById("hosp-info").innerHTML = text;
}

function hide_info() {
  var x = document.getElementById("hosp-info-text");
  if (x.style.display === "none") {
      x.style.display = "block";
      document.getElementById("hide_btn").innerHTML = "Esconder info";
  } else {
      x.style.display = "none";
      document.getElementById("hide_btn").innerHTML = "Mostrar info";
  }
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
        create_homepage_charts();
    }
}

function setup_cluster(id, lat, long) {
    $('#loading_overlay').show();
    markers_visible(false, id);
    var procedure_path = ["/procedures/", id].join("");

    $.getJSON(procedure_path, function(procedures) {
        show_procedures(procedures);
        create_circles(id, lat, long);
    });

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
    $('#loading_overlay').hide();
}

// Remove clusters
function teardown_cluster(id) {
    markers_visible(true, id);
    cluster_status = false;
    document.getElementById("search-name").innerHTML = "SÃO PAULO";
    document.getElementById("hosp-info").innerHTML = "";
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
            circle.bindTooltip("Raio de " + radius[i] + " Km<br>" + (100 - (25 + 25 * i)).toString() + "% das internações hospitalares", {direction:'top'})
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

function LowerCase(data) {
  for (i = 0; i < data.length; i++) {
    data[i][0] = data[i][0].toLowerCase();
    data[i][0] = data[i][0].substring(0,1).toLocaleUpperCase() + data[i][0].substring(1);
  }
  return data;
}

function create_homepage_charts(id) {
    /*create_right_graph(id);*/
    var dataSpecialty, dataTotal, pathSpecialty, pathTotal, n, i

    if (id == undefined) {
      pathTotal = '/distance_metric.json';
      pathSpecialty = '/specialties_distance_metric.json'
      $.when (
        $.getJSON(pathTotal, function(data) {
            update_right_graph_text(data)
            dataTotal = data;
        }),
        $.getJSON(pathSpecialty, function(data) {
          dataSpecialty = data;
          dataSpecialty = LowerCase(dataSpecialty);
        })
      ).then(function(){
          n = dataSpecialty.length;
          dataSpecialty[n] = ["Total", 0, 0, 0, 0, ""];

          i = 1;
          for (d in dataTotal) {
            dataSpecialty[n][i] = dataTotal[d];
            i++;
          }

          create_bottom_graphs("bt-graph2", dataSpecialty);
      });
    }
    else {
      pathTotal = ["/distances/", id].join("");
      pathSpecialty = ["/specialty_distance/", id].join("");
      $.when (
        $.getJSON(pathTotal, function(data) {
            update_right_graph_text(data)
            dataTotal = data;
        }),
        $.getJSON(pathSpecialty, function(data) {
          dataSpecialty = data;
        })
      ).then(function(){
          for (i = 0; i < Object.keys(dataSpecialty).length; i++) {
            for (j = 1; j < 5; j++) {
              dataSpecialty[i][j] = parseInt(dataSpecialty[i][j]);
            }
            dataSpecialty[i] = Object.values(dataSpecialty[i]);
          }
          dataSpecialty = Object.values(dataSpecialty);

          dataSpecialty = LowerCase(dataSpecialty);

          n = dataSpecialty.length;
          dataSpecialty[n] = ["Total", 0, 0, 0, 0, ""];

          i = 1;
          for (d in dataTotal) {
            dataSpecialty[n][i] = dataTotal[d];
            i++;
          }

          create_bottom_graphs("bt-graph2", dataSpecialty);
      });
    }
}

function create_bottom_graphs(id, data) {
    var chart = new google.visualization.BarChart(document.getElementById(id));
    var header = ['Genre', ' < 1 Km', '> 1 Km e < 5 Km',
                  '> 5 Km e  < 10 Km', '> 10 Km', {role: 'annotation' }];
    var options = {
        legend: 'bottom',
        isStacked: 'percent',
        chartArea: {  width: "80%", height: "90%", left:278 },
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
    sum = sum.toLocaleString('pt-BR'); //command to change the number format
    $graph_text1.html("<br><br><br> " + sum);
    $graph_text2.html("Procedimentos");
}

function about() {
    window.open("about");
}

function show_menu(id) {
  if (!$(id).hasClass("active")) {
    $(id).addClass("active");
  }
  else {
    $(id).removeClass("active");
  }
}

function show_config2() {
    if (document.getElementById("div-adm").style.transform === "translateY(240px)") {
      document.getElementById("div-adm").style.transform = "translateY(0)";
    }
    else {
      document.getElementById("div-adm").style.transform = "translateY(240px)";
    }
  }
