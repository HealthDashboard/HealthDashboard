var map;
var circles;
var cluster_status;
var markerCluster;
var hcMarkers;

var radius = [10000, 5000, 1000]
var colors = ['#587C7C', '#013F5E', '#007C84', "#BBE0CE", "#9EA615", "#E8D666", "#FEDCC1", "#F7A08C", "#F1573F"];
var colors_circle = ['#FF4444', '#44FF44', '#4444FF']

var hc_id = 0;
var clean_up_cluster;

var shapes;

var source;

function initialize() {
    markers_visible(true, -1);
    circles = [];
    cluster_status = false;
    markerCluster = null;
    hcMarkers = [];
    vars = [];
    clean_up_cluster = [];
    health_centre_markers = [];
    shapes_setor = []
    shapes = {
        'Shape_SP.geojson': null,
        'Shape_CRS.geojson': null,
        'Shape_STS.geojson': null,
        'Shape_PR.geojson': null,
        'Shape_DA.geojson': null,
        'Shape_UBS.geojson': null,
        'Shape_ESF.geojson': null
    };

    var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }),
    latlng = L.latLng(-23.56, -46.58);
    map = L.map('map', { center: latlng, zoom: 11, layers: [tiles] });
    L.control.scale({imperial: false, position: 'bottomright'}).addTo(map);

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            source = findSource(xhttp.responseXML);
            $('#source').html(source);
        }
    };
    xhttp.open("GET", "metadata.xml", true);
    xhttp.send();

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
    text = '<div id="hosp-info-text" class="hosp-info-text">'
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
  if (!$("#hosp-info-text").hasClass("active")) {
    $("#hosp-info-text").addClass("active");
    document.getElementById("hide_btn").innerHTML = "Mostrar info";
    setTimeout(function(){myChart.resize();}, 300);
  }
  else {
    $("#hosp-info-text").removeClass("active");
    document.getElementById("hide_btn").innerHTML = "Esconder info";
    setTimeout(function(){myChart.resize();}, 300);
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
        setTimeout(function(){myChart.resize();}, 250);
        //^Dívida técnica
    } else {
        teardown_cluster(id);
        myChart.resize();
        create_homepage_charts();
    }
}

function setup_cluster(id, lat, long) {
    $('#loading_overlay').show();
    markers_visible(false, id);
    var procedure_path = ["/procedures/", id].join("");
    hc_id = id;

    $.getJSON(procedure_path, function(procedures) {
        handleLargeCluster(map, procedure_path, null, 80, 30, 60, clickOnMarkersHealthCentre);
        create_circles(id, lat, long);
    });

    cluster_status = true;
}

function clickOnMarkersHealthCentre(e) {
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

        path = "health_centres/procedures_setor_healthcentre"

        list = []
        $.getJSON(path, {id: hc_id,  lat: marker.latlong[0], long: marker.latlong[1]}, function(procedures){
            $.each(procedures, function(index, id){
                single_point_marker = L.marker(L.latLng(marker.latlong[0], marker.latlong[1]), {icon: dotIcon, id: id}).on('click', markerClick);
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

function markerClick(e) {
    var sexp_var = {};
    sexp_var["M"] = "Masculino";
    sexp_var["F"] = "Feminino";
    id = e.target.options.id
    var proceduresInfo_path = ["/procedure/proceduresInfo", id].join("/");
    var text_marker = ""
    $.getJSON(proceduresInfo_path, function(procedure) {
        text_marker += "<strong>Sexo: </strong>" + sexp_var[procedure[0].gender] + "<br>";
        text_marker +=  "<strong>Idade: </strong>" + procedure[0].age_number + "<br>";
        text_marker += "<strong>CID: </strong>" + procedure[0].cid_primary + "<br>";
        text_marker += "<strong>CRS: </strong>" + procedure[0].CRS + "<br>";
        text_marker += "<strong>Data: </strong>" + procedure[0].date + "<br>";
        text_marker += "<strong>Distância: </strong>" + parseFloat(procedure[0].distance).toFixed(1).replace(".", ",") + " Km <br>";


        e.target.bindPopup(text_marker, {direction:'top'});
        e.target.openPopup();
    });
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
                fillOpacity: 0.2,
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
    if (cluster != null) {
        map.removeLayer(cluster)
        markerCluster = null;
    }

    if (heat != null) {
        map.removeLayer(heat);
        heat = null;
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
        var header = ["Elementos", "Número de Internações", {role: "style"}];

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

// Gets and formats the data to create the charts
function create_homepage_charts(id) {
    var dataSpecialty, dataTotal, pathSpecialty, pathTotal, dataNormalized, n, i

    if (id == undefined) {
      pathTotal = '/distance_metric.json';
      pathSpecialty = '/specialties_distance_metric.json'
    }
    else {
      pathTotal = ["/distances/", id].join("");
      pathSpecialty = ["/specialty_distance/", id].join("");
    }
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
        dataSpecialty[i] = Object.values(dataSpecialty[i]);
      }
      dataSpecialty = Object.values(dataSpecialty);

      dataSpecialty = lower_case(dataSpecialty);

      dataSpecialty = add_total_to_data(dataTotal, dataSpecialty);

      let dataNormalized = $.extend(true, [], dataSpecialty);
      for (i = 0; i < dataNormalized.length; i++) {
        dataNormalized[i] = normalize_to_100(dataNormalized[i]);
      }

      create_chart(dataSpecialty, dataNormalized);
    }
  );
}

function lower_case(data) {
  for (i = 0; i < data.length; i++) {
    data[i][0] = data[i][0].toLowerCase();
    data[i][0] = data[i][0].substring(0,1).toLocaleUpperCase() + data[i][0].substring(1);
  }
  return data;
}

// Adds the row Total to the data
function add_total_to_data (dataTotal, data) {
  n = data.length;
  data[n] = ["Total", 0, 0, 0, 0];

  i = 1;
  for (d in dataTotal) {
    data[n][i] = dataTotal[d];
    i++;
  }
  return data;
}

// Returns the data in %
function normalize_to_100 (data) {
  let is_num = n => isNaN(n) ? 0 : n
  var sum = data.reduce((a, b) =>
    is_num(a) + is_num(b))
  var ratio =  sum/ 100;
  var i;

  for (i = 1; i <= 4; i++) {
    data[i] = parseFloat(data[i] / ratio).toFixed(2);
  }
  return data;
}

// Sets the options for the chart
function create_chart(data, dataNormalized){
  option = {
      legend: {
        bottom: '15px',
        right: '5px',
        type: 'scroll'
      },
      tooltip : {
        trigger: 'axis',
        axisPointer : {
          type : 'shadow'
        },
        formatter: function (params) {
          var colorSpan = color => '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:' + color + '"></span>';
          let html = '<b>' + params[0].axisValue + '</b></br>';
          html += '<p>'
          var sum = 0;
          var sumPercent = 0.0;
          var i = 0
          params.forEach(item => {
            var str = colorSpan(item.color) + ' ' + item.seriesName + ': ' + data[item.dataIndex][item.seriesIndex + 1].toLocaleString('pt-BR') + ' (' + parseFloat(item.data[item.seriesIndex + 1]).toLocaleString('pt-BR') + '%)' + '<br>'
            html += str;
            sum += data[item.dataIndex][item.seriesIndex + 1];
            sumPercent += parseFloat(item.data[item.seriesIndex + 1]);
            i++;
          });
          if (i === 4) {
            html += 'Total: ' + sum.toLocaleString('pt-BR') + '</p>'
          }
          else {
            html += 'Total: ' + sum.toLocaleString('pt-BR') + ' (' + parseFloat(sumPercent).toLocaleString('pt-BR') +'%)</p>'
          }
          return html;
        },
      },
      toolbox: {
        show : true,
        feature : {
          mark : {show: true},
          magicType: {show: true, type: ['stack', 'tiled']},
          restore : {show: true},
          saveAsImage : {show: true}
        }
      },
      color: ["#B9D8C2", "#84C8C2", "#2066A9", "#19407F"],
      grid: {
        left: '0',
        right: '25px',
        bottom: '43px',
        top: '40px',
        containLabel: true
      },
      dataset: {
        dimensions: ["Especialidade","< 1km", "> 1km e < 5km", "> 5km e < 10km", "> 10km", ""],
        source: dataNormalized,
        sourceHeader: false
      },
      xAxis: {type: 'value',
              max: 100,
              axisLabel: {formatter: '{value}%'}
             },
      yAxis: {type: 'category',
              axisLabel: {interval : 0},
              // name: 'Especialidades',
             },
      series: [
          {
            type: 'bar',
            stack: 's',
            label: {
              normal: {
                show: true,
                position: 'insideLeft',
                formatter: function (params) {
                  var str = parseFloat(params.data[1]).toLocaleString('pt-BR') + '%'
                  return str;
                },
              }
            },
          },
          {
            type: 'bar',
            stack: 's',
            label: {
              normal: {
                show: true,
                position: 'insideLeft',
                formatter: function (params) {
                  var str = parseFloat(params.data[2]).toLocaleString('pt-BR') + '%'
                  return str;
                },
              }
            },
          },
          {
            type: 'bar',
            stack: 's',
            label: {
              normal: {
                show: true,
                position: 'insideLeft',
                formatter: function (params) {
                  var str = parseFloat(params.data[3]).toLocaleString('pt-BR') + '%'
                  return str;
                },
              }
            },
          },
          {
            type: 'bar',
            stack: 's',
            label: {
              normal: {
                show: true,
                position: 'insideLeft',
                formatter: function (params) {
                  var str = parseFloat(params.data[4]).toLocaleString('pt-BR') + '%'
                  return str;
                },
              }
            },
          }
      ]
  };
  myChart.setOption(option);
}

function update_right_graph_text(data) {
    var $graph_text1 = $('#labelOverlay .n_procedures');
    var $graph_text2 = $('#labelOverlay .atendimentos');
    sum = 0;
    $.each(data,function(key, value) {
        sum += parseInt(value, 10);
    });
    sum = sum.toLocaleString('pt-BR'); //command to change the number format
    $graph_text1.html(sum);
    $graph_text2.html("Internações");
}
