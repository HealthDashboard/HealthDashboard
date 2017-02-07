var map;

function initialize()
{
  var lat = -18.8800397
  var lng = -47.05878999999999
  var latlng = new google.maps.LatLng(lat, lng);

  var options = {
      zoom: 5,
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
    $.each(points, function(index, points)
    {
      create_marker(points.lat, points.long)
    });
  });
}

function create_marker(lat, lng)
{
  var marker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: map
  }); 
}
