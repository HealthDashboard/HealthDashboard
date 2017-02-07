    var map;

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
  var infowindow = new google.maps.InfoWindow()
  google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
                  infowindow.setContent(create_marker_text(point));
                  infowindow.open(map, marker);
              }
  })(marker))
}
