var map;
var info_boxes = [];
var info_box_opened;

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
  return 'Nome: ' + point.name + '<br>Leitos: ' + point.beds  +'<br>Telefone: ' + point.phone
}

function add_info_to_marker(marker, point)
{
  info_boxes[point.id] = new google.maps.InfoWindow()
  info_boxes[point.id].marker = marker

  info_boxes[point.id].listener = google.maps.event.addListener(marker, 'click', function (e) {
            info_boxes[point.id].setContent(create_marker_text(point))
            open_info_box(point.id, marker);
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
