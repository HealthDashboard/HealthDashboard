function initialize_health_centre_filter()
{
  var lat = -23.557296000000001
  var lng = -46.669210999999997
  var latlng = new google.maps.LatLng(lat, lng);

  var options = {
      zoom: 15,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("specialty-map-filter"), options);
  load_health_centre_filtered()
}

function load_health_centre_filtered()
{
  var path = '/points.json'
  $.getJSON(path, function(points) {
    $.each(points, function(index, point)
    {
      create_health_centre_marker(point,create_health_centre_info_box_text)
      info_boxes[point.id].marker.setVisible(false)
    });
  });

  create_legend()
  populate_legend()
}

function create_health_centre_info_box_text(point){
  var id = point.id
  var button_label= (cluster_status === false)? 'Mostrar Detalhes':'Esconder Detalhes'
  return '<strong>Nome:</strong> ' + point.name +
         '<br><strong>Leitos:</strong> '+ point.beds
}

function change_selected_health_centre(id){

  if(info_box_opened !== id) {
    if ((typeof(info_box_opened) === 'number' && typeof(info_boxes[info_box_opened]) === 'object' )) {
      info_boxes[info_box_opened].marker.setIcon(health_centre_icon);
      info_boxes[info_box_opened].close()
   }
    info_boxes[id].marker.setIcon();
    info_boxes[id].setContent(create_health_centre_info_box_text(info_boxes[id].point))
    open_info_box(info_boxes[id].id, info_boxes[id].marker)
  }
}

function filter_by(health_centre_id, specialty_id){

  teardown_health_centre()
  var path = ['/health_centre_filter', health_centre_id, specialty_id].join('/')
  $.getJSON(path, function(points) {
    $.each(points, function(index, point)
    {
      info_boxes[point.id].marker.setVisible(true)
    });
  });

  change_selected_health_centre(health_centre_id)
  var point = info_boxes[info_box_opened].point
  var latlng = new google.maps.LatLng(point.lat, point.long)
  map.setCenter(latlng)
  teardown_circles()
  create_circles(info_boxes[info_box_opened].marker)
  show_procedures_filtered(health_centre_id, specialty_id)
  show_legend()
  map.setZoom(11)
}

function teardown_health_centre(){
    $.each(info_boxes, function(index, point)
    {
        if(index !== 0)
            point.marker.setVisible(false)
    });
}

function show_procedures_filtered(health_centre_id, specialty_id){
  var procedure_path = ["/health_centre_specialty", health_centre_id, specialty_id ].join("/");
  $.getJSON(procedure_path, function(procedures) {
      show_procedures(procedures)
      create_circles(info_boxes[info_box_opened].marker)
  });
}

function show_legend(){
  $('#legend').show()
}
