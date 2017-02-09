var map;
var info_boxes = [];
var info_box_opened;

var locations = [
  {lat: -23.522787, lng: -46.490063},
  {lat: -23.522787, lng: -46.490063},
  {lat: -23.522787, lng: -46.490063},
  {lat: -23.522787, lng: -46.490063},
  {lat: -23.522787, lng: -46.490063},
  {lat: -23.522787, lng: -46.490063},
  {lat: -23.522787, lng: -46.490063},
  {lat: -23.522787, lng: -46.490063},
  {lat: -23.522787, lng: -46.490063},
  {lat: -23.522787, lng: -46.490063},
  {lat: -23.522787, lng: -46.490063},
]

function show_procedures()
{
  var markers = locations.map(function(location, i) {
    return new google.maps.Marker({
      position: location,
    });
  });

  var markerCluster = new MarkerClusterer(map, markers,
    {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
}

function initialize()
{
  var lat = -23.522787
  var lng = -46.490063
  var latlng = new google.maps.LatLng(lat, lng);

  var options = {
      zoom: 15,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("map"), options);
  load_all_points();
  show_procedures();
}

function load_all_points()
{
  $.getJSON('/points.json', function(points)
  {
    $.each(points, function(index, point)
    {
      create_marker(point)
    });
  });
}

function create_marker(point)
{
  var marker = new google.maps.Marker({
      position: new google.maps.LatLng(point.lat, point.long),
      map: map
  });
  add_info_to_marker(marker, point)
}

function create_marker_text(point)
{
  return 'Name: ' + point.name +
        '<br>Beds: '+ point.beds +
        '<br>Phone: ' + point.phone +
        "<br><button type='button' id='show_info' onclick='show_clusters()'>Show Info</button>"
}

function show_clusters()
{
  markers_visible(false)
}

function add_info_to_marker(marker, point)
{
  info_boxes[point.id] = new google.maps.InfoWindow()
  info_boxes[point.id].marker = marker
  info_boxes[point.id].id = point.id

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

