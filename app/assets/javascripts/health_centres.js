var map;
var info_boxes = [];
var circles = []
var info_box_opened;
var cluster_status = false;
var markerCluster = null;
var circle_color = ['#003300', '#15ff00', '#ff0000']

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

 markerCluster = new MarkerClusterer( map, markers, options);
 var radius = [10000, 5000, 1000];

 for(var i = 0; i<3; i++)
 {
  var circle = new google.maps.Circle({
    map: map,
    radius: radius[i],
    fillColor: circle_color[i],
  });
    circle.bindTo('center', info_boxes[info_box_opened].marker, 'position');
  circles.push(circle)
 }

}

function initialize()
{
  var lat = -23.580562
  var lng = -46.589796
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
}

function load_all_points()
{
  $.getJSON('/points.json', function(points) {
    $.each(points, function(index, point)
    {
      create_health_centre_marker(point)
    });
  });
}

function create_health_centre_marker(point)
{
  var marker = create_marker(point)
  add_info_to_marker(marker, point)
}

function create_marker(point)
{
  return new google.maps.Marker({
      position: new google.maps.LatLng(point.lat, point.long),
      map: map
  });
}

function create_marker_text(point)
{
  var id = point.id
  var button_label= (cluster_status == false)? 'Show Info':'Hide Info'
  return '<strong>Name:</strong> ' + point.name +
         '<br><strong>Beds:</strong> '+ point.beds +
         '<br><strong>Phone:</strong> ' + point.phone +
         "<br><br><button type='button' id='cluster_info' onclick='show_clusters()'>"+button_label+"</button>"
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
  console.log(procedure_path)

  $.getJSON(procedure_path, function(procedures) {
      show_procedures(procedures)
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

  $.each(circles, function(index, circle){
    circle.setMap(null)
  });
}

function add_info_to_marker(marker, point)
{
  info_boxes[point.id] = new google.maps.InfoWindow()
  info_boxes[point.id].marker = marker
  info_boxes[point.id].id = point.id

  add_listener(marker, point)
}

function add_listener(marker, point)
{
  info_boxes[point.id].listener = google.maps.event.addListener(marker, 'click', function (e) {
            info_boxes[point.id].setContent(create_marker_text(point))
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
  styles = [{'name': '1 km', 'color': circle_color[2]},
            {'name': '5 km', 'color': circle_color[1]},
            {'name': '10 km', 'color': circle_color[0]}]

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

