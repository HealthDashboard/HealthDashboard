var map;
var info_boxes = [];
var circles = []
var info_box_opened;
var cluster_status = false;
var markerCluster = null;
var colors = ['#003300', '#15ff00', '#ff0000', "#f5b979" , "#13f1e8" ,  "#615ac7", "#8e3a06", "#b769ab", "#df10eb"]

var health_centre_icon = '/health_centre_icon.png'

function show_procedures(procedures)
{
  var markers = procedures.map(function(procedure, i) {
    var lat = procedure.lat
    var lng = procedure.long

    return new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                strokeColor: "red",
                scale: 3
              },
        });
  });

 var clusterStyles = [
   {
     textColor: 'black',
     url: 'm1.png',
     height: 44,
     width: 44
   },
  {
     textColor: 'black',
     url: 'm2.png',
     height: 75,
     width: 77
   },
  {
     textColor: 'black',
     url: 'm3.png',
     height: 112,
     width: 111
   }
 ];

 var options = {
   styles: clusterStyles,
   zoomOnClick: false,
   minimumClusterSize: 2};

 markerCluster = new MarkerClusterer(map, markers, options);
}

function create_circles(marker){
 var radius = [20000, 10000, 5000];
 for(var i = 0; i<3; i++)
 {
  var circle = new google.maps.Circle({
    map: map,
    radius: radius[i],
    fillColor: colors[i],
    fillOpacity: 0.09,
  });
  circle.bindTo('center', marker, 'position');
  circles.push(circle)
 }
}


function initialize()
{
  var lat = -23.557296000000001
  var lng = -46.669210999999997
  var latlng = new google.maps.LatLng(lat, lng);

  var options = {
      zoom: 15,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map"), options);
  load_all_points();
  populate_legend()
  create_legend()
  create_chart()
}

function load_all_points()
{
  $.getJSON('/points.json', function(points) {
    $.each(points, function(index, point)
    {
      create_health_centre_marker(point, create_marker_text)
    });
  });
}

function create_health_centre_marker(point, generate_infobox_text)
{
  var marker = create_marker(point, health_centre_icon)
  add_info_to_marker(marker, point, generate_infobox_text)
}

function create_marker(point, icon_path)
{
  return new google.maps.Marker({
      position: new google.maps.LatLng(point.lat, point.long),
      map: map,
      icon: icon_path
  });
}

function create_marker_text(point)
{
  var id = point.id
  var button_label= (cluster_status == false)? 'Show Info':'Hide Info'
  return '<strong>Name:</strong> ' + point.name +
         '<br><strong>Beds:</strong> '+ point.beds +
         "<br><br><button type='button' id='cluster_info' class='btn btn-info btn-sm' onclick='show_clusters()'>"+button_label+"</button>"+
         '<button type="button" class="btn btn-info btn-sm pull-right" data-toggle="modal" onclick="update_chart()" data-target="#myModal">Analytics</button>'
}

function show_clusters()
{
  if (cluster_status == false){
    setup_cluster()
    $('#legend').show()
  }else{
    teardown_cluster()
     $('#legend').hide()
  }
}

function setup_cluster()
{
  var procedure_path = ["/procedures/", info_box_opened].join("");

  $.getJSON(procedure_path, function(procedures) {
      show_procedures(procedures)
      create_circles(info_boxes[info_box_opened].marker)
  });

  markers_visible(false)
  $('#cluster_info').text('Hide info')
  cluster_status = true
}

function teardown_cluster()
{
  markers_visible(true)
  markerCluster.clearMarkers()
  info_boxes[info_box_opened].close()
  info_box_opened = -1
  cluster_status = false
  teardown_circles()
}

function teardown_circles(){
  $.each(circles, function(index, circle){
    circle.setMap(null)
  });
}

function add_info_to_marker(marker, point, generate_infobox_text)
{
  info_boxes[point.id] = new google.maps.InfoWindow()
  info_boxes[point.id].marker = marker
  info_boxes[point.id].id = point.id
  info_boxes[point.id].point = point

  add_listener(marker, point, generate_infobox_text)
}

function add_listener(marker, point, generate_infobox_text)
{
  info_boxes[point.id].listener = google.maps.event.addListener(marker, 'click', function (e) {
      info_boxes[point.id].setContent(generate_infobox_text(point))
      open_info_box(point.id, marker);
  });
}

function markers_visible(visibility)
{
   $.each(info_boxes, function(index, info_box)
   {
     if (info_box != null && info_box.id != info_box_opened){
       info_box.marker.setVisible(visibility);
     }
   });
}

function open_info_box(id, marker){
  if ((typeof(info_box_opened) == 'number' && typeof(info_boxes[info_box_opened]) == 'object' )) {
    info_boxes[info_box_opened].close()
  }
  if (info_box_opened != id){
    info_boxes[id].open(map, marker)
    info_box_opened = id
  }else{
    info_box_opened = -1
  }
}

function create_legend(){
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push
  (document.getElementById('legend'));
}

function populate_legend(){
  styles = [{'name': '1 km', 'color': colors[2]},
            {'name': '5 km', 'color': colors[1]},
            {'name': '10 km', 'color': colors[0]}]

  var $legend = $('#legend')
  $.each(styles, function(index, style){
    var div = document.createElement('div');
    var br = document.createElement('br');
    var div_name = document.createElement('div');
    div_name.innerHTML = '<div class="name" style="margin-left: 30px;">'+style.name+'</div>'
    div.innerHTML = '<div class="color" style="background-color:'+style.color+'"></div>'

    $legend.append(div);
    $legend.append(div_name);
    $legend.append(br);
  });
}

function create_chart(){
  google.charts.setOnLoadCallback(create_homepage_charts);
}

function create_homepage_charts(){
  create_right_graph()
  create_bottom_graphs("bt-graph1")
  create_bottom_graphs("bt-graph2")
  update_procedures_metric()
}

function update_chart(){
  var specialty_path = ["/specialties/", info_box_opened].join("")
  $.getJSON(specialty_path, function(specialties) {
    var values = []
    var i = 0
    $.each(specialties, function(name, number)
    {
      values.push([name, number, colors[i]])
      i+=1
    });
    var header = ["Elementos", "Número de Procedimentos", { role: "style" } ]

    values.unshift(header)
    var data = google.visualization.arrayToDataTable(values);

    var view = new google.visualization.DataView(data);
    view.setColumns([0, 1,
                    { calc: "stringify",
                        sourceColumn: 1,
                        type: "string",
                        role: "annotation" },
                    2]);

    var options = {
        bar: {groupWidth: "70%"},
        legend: { position: "none" },
    };

    var chart = new google.visualization.BarChart(document.getElementById("chart_div"));
    chart.draw(view, options);
  });
}

function create_right_graph(){
  var header = ["Especialidades", "Número de Procedimentos", { role: "style" } ]
  var chart = new google.visualization.PieChart(document.getElementById("general-right-graph"));
  var options = {
    width: 300,
    height: 300,
    title: "",
    pieHole: 0.8,
    pieSliceBorderColor: "none",
    colors: ['green', 'yellow', 'orange', 'red'] ,
    legend: {position: 'none'},
    pieSliceText: "none",
  };
  var specialty_path = "/distance_metric.json"

  $.getJSON(specialty_path, function(data){
    draw_chart(header, data, chart, options)
    update_right_graph_text(data)
  });
}


function create_bottom_graphs(id){
  var chart = new google.visualization.BarChart(document.getElementById(id));

  var header = ['Genre', 'Fantasy & Sci Fi', 'Romance', 'Mystery/Crime', 'General', { role: 'annotation' } ]

  var data = [
        ['pediatria', 10, 24, 20, 32, ''],
        ['ginecologia', 16, 22, 23, 30, ''],
        ['oftalmologia', 28, 19, 29, 30,  ''],
        ['nefrologia', 16, 22, 23, 30, ''],
        ['clinica geral', 28, 19, 29, 30,  '']
      ]
  var options = {
        height :200,
        legend: { position: 'none'},
        isStacked: 'percent',
        hAxis: { minValue: 0,
              ticks: [0,.2,.4,.6,.8,1]
        },
        bar: { groupWidth: '35%' },
        series: {
            0:{color:'green'},
            1:{color:'yellow'},
            2:{color:'orange'},
            3:{color:'red'},
          }
      };
  draw_bottom_graph(header, data, chart, options)
}

function draw_bottom_graph(header, data, chart, options){
  var values = data

  values.unshift(header)
  var data = google.visualization.arrayToDataTable(values);
  var view = new google.visualization.DataView(data);
  chart.draw(view, options);
}


function update_right_graph_text(data){
  var $graph_text1 = $('#labelOverlay .n_procedures')
  var $graph_text2 = $('#labelOverlay .atendimentos')
  sum = 0
  $.each(data,function(key, value) {
    sum += parseInt(value);
  });
  $graph_text1.html(sum)
  $graph_text2.html("Procedimentos")
}

function update_procedures_metric(value){
  var $html = $("#metric-board #value")

  $.getJSON('/metrics.json', function(data){
    $html.html(data.count)
  });
}
