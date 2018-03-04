var ft_layer = null;
var SPmap = null;
var SPmap_label = null;
var latlng = null;
var health_centres_var = {};
var health_centre_icon = '/health_centre_icon.png';
var person_icon = '/home.png';
var cid_array = {};

//* POLYGONS *//
// Region name
var regions = ['oeste', 'norte', 'leste', 'sul', 'sudeste', 'centro'];
// Drawings representing regions 
var draw_region = {};
// Labels for regions total pacients
var labels_region = {};
// Total pacients in each region
var total_region = {};
// Label points for regions
var label_points = {'oeste' : [-23.562630, -46.734051], 'norte' : [-23.459998, -46.670880], 'sul' : [-23.762625, -46.704525], 'leste' : [-23.552559, -46.443600], 'sudeste' : [-23.557594, -46.569251], 'centro' : [-23.547838, -46.633801] };
//**//

//* CLUSTERS *//
// regions array for clusters
var array_clusters = {};
// Label of each cluster in the array above
var labels_clusters = {};
// Centroids for the clusters. 
var centroids = {};
// Number of pacients in each given centroid.
var counter = {};
//**//

// Colors
var colors = ['#FF9900', '#FFCC00', '#FFFF00', "#CCFF00", "#99FF00", "#66FF00", "#33FF00", "#FF0000"];
var colors_procedure = ['#003300', '#15ff00', '#ff0000', "#f5b979", "#13f1e8", "#615ac7", "#8e3a06", "#b769ab", "#df10eb"];

function initMap()
{
  $('#legend_proc').hide();
  $('#loading_overlay').hide();
  var lat = -23.557296000000001;
  var lng = -46.669210999999997;
  latlng = new google.maps.LatLng(lat, lng);

  var options = {
      zoom: 11,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("procedure_map"), options);
    // Create the legend and display on the map
  leg_types = [{'name': 'Obstetrícia', 'color': colors_procedure[2]},
        {'name': 'Clinica Médica', 'color': colors_procedure[3]},
        {'name': 'Psiquiatria', 'color': colors_procedure[4]},
        {'name': 'Pediatria', 'color': colors_procedure[3]},
        {'name': 'Reabilitação', 'color': colors_procedure[6]},
        {'name': 'Psiquiatria Hospital-Dia', 'color': colors_procedure[6]}
        ]

  var $legend = $('#legend_proc')

  $.each(leg_types, function(index, style){
    element = '<div class="item"><div class="color" style="background-color: '+style.color+
    '"></div><p class="text">'+style.name+'</p> </div></div>'
    $legend.append(element)
  });
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('legend_proc'));

  SPmap_label = new MapLabel({
          fontSize: 28,
          align: 'center'
        });
}

function createLabel(size){
  return new MapLabel({
          fontSize: size,
          align: 'center'
        });
}

// Search button
function submit()
{
  $('#btn-submit').click(function() {
    $('#loading_overlay').show();
    var sexo_masculino = document.getElementById('sexo_masculino');
    var sexo_feminino = document.getElementById('sexo_feminino');
    var residencia_paciente = document.getElementById('checkbox_residencia_paciente');
    var hc = document.getElementById('checkbox_health_centre');

    var genders = [];
    var health_centres = [];
    var specialties = [];
    var age_group = [];
    var cdi = [];
    var treatment_type = [];
    var region = [];

    var select_region = $('#select_region option:selected');
    $(select_region).each(function(index, brand){
      region.push([$(this).val()]);
    });

    var select_health_centre = $('#select_health_centre option:selected');
    $(select_health_centre).each(function(index, brand){
      health_centres.push([$(this).val()]);
    });

    var select_specialty = $('#select_speciality option:selected');
    $(select_specialty).each(function(index, brand){
      n_spec = parseInt([$(this).val()]) + 1
      specialties.push(n_spec);
    });

    var select_age_group = $('#select_age_group option:selected');
    $(select_age_group).each(function(index, brand){
      age_group.push([$(this).val()]);
    });

    var select_cdi = $('#select_cdi option:selected');
    $(select_cdi).each(function(index, brand){
      cdi.push([$(this).val()]);
    });

    var select_treatment_type = $('#select_treatment option:selected');
    $(select_treatment_type).each(function(index, brand){
      treatment_type.push([$(this).val()]);
    });

    var start_date = $("#intervalStart").datepicker({ dateFormat: 'dd,MM,yyyy' }).val();
    var end_date = $("#intervalEnd").datepicker({ dateFormat: 'dd,MM,yyyy' }).val();

    if(sexo_masculino.checked) {
      genders.push("M");
    }

    if(sexo_feminino.checked) {
      genders.push("F");
    }

    var distance_max = document.getElementById('slider_distance_max');
    var distance_min = document.getElementById('slider_distance_min');
    var dist_min = parseFloat(distance_min.textContent);
    var dist_max = parseFloat(distance_max.textContent);

    var filterDay = $('#viewType input:radio:checked').val()

    // Clear map
    clearMap();

    // Show data 
    if (filterDay == 0) {
      where =  whereParse(health_centres, region, specialties, age_group, cdi, treatment_type, 
  start_date, end_date, dist_min, dist_max, genders);
      ft_layer = new google.maps.FusionTablesLayer({
        query: {
          select: 'LAT_SC',
          from: '1hKuL3jRKfMw2XZmGPlr5URI6Zd6rNEWV7j3V0a8Y',
          where: where,
        },
        styles: [
            {where: "'specialty_id' = 2", markerOptions:{iconName:"small_green"}},
            {where: "'specialty_id' = 3", markerOptions:{iconName:"small_red"}},
            {where: "'specialty_id' = 9", markerOptions:{iconName:"small_purple"}},
            {where: "'specialty_id' = '7'", markerOptions:{ iconName:"measle_brown"}},
            {where: "'specialty_id' = '5'", markerOptions:{ iconName:"measle_turquoise"}},
        ]  
      });

      var sexp_var = {}
      sexp_var["M"] = "Masculino";
      sexp_var["F"] = "Feminino";

      google.maps.event.addListener(ft_layer, 'click', function(e) {
        e.infoWindowHtml = "<strong>Estabelecimento: </strong>" + health_centres_var[e.row['cnes_id'].value] + "<br>";
        e.infoWindowHtml += "<strong>Sexo: </strong>" + sexp_var[e.row['gender'].value] + "<br>";
        e.infoWindowHtml += "<strong>Idade: </strong>" + e.row['age_number'].value + "<br>";
        e.infoWindowHtml += "<strong>CDI: </strong>" + e.row['cid_primary'].value + "<br>";
        e.infoWindowHtml += "<strong>Região: </strong>" + e.row['region'].value + "<br>";
        e.infoWindowHtml += "<strong>Data: </strong>" + e.row['date'].value + "<br>";
        e.infoWindowHtml += "<strong>Distância: </strong>" + parseFloat(e.row['distance'].value).toPrecision(5) + "<br>";
      });

      // $('#legend_proc').show()
      ft_layer.setMap(map);

    } else {

      bounds = []
      $.each(sp_coordenadas, function(index, point){
        bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])))
      });

      SPmap = new google.maps.Polygon({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        path: bounds
      });

      $.getJSON("procedure/procedures_search", {gender: genders.toString(), cnes: health_centres.toString(),
          specialties: specialties.toString(), start_date: start_date.toString(), end_date: end_date.toString(), 
          dist_min: dist_min.toString(), dist_max: dist_max.toString(), age_group: age_group.toString(), region: region.toString(),
          cdi: cdi.toString(), treatment_type: treatment_type.toString()}, 
          function(result){
            TOTAL = 0;
            $.each(regions, function(index, region) {
              centroids[region] = [];
              counter[region] = [];
              labels_clusters[region] = [];
              labels_region[region] = createLabel(24);
              $.each(result[0][region], function(index, value) {
                num = parseInt(value["number"]);
                counter[region].push(num);
                centroids[region].push(value["centroid"]);
                TOTAL += num;
                labels_clusters[region].push(createLabel(20))
              });
            });
            calcTotalRegion();
            SPmap_label.set('text', TOTAL.toString());
            SPmap_label.set('position', latlng);
            SPmap_label.set('map', map);
            $('#loading_overlay').hide();
      });

      google.maps.event.addListener(SPmap, 'click', function (event) {
        SPmap.setMap(null);
        SPmap_label.set('map', null);

        $.each(regions, function(index, region) {
          bounds = [];
          $.each(polygons_region[region], function(index, point) {
            bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])));
          });
          draw_region[region] = new google.maps.Polygon(makeOptions(bounds));
          labels_region[region].set('text', total_region[region].toString());
          labels_region[region].set('position', new google.maps.LatLng(label_points[region][0], label_points[region][1]));
          labels_region[region].set('map', map);
          google.maps.event.addListener(draw_region[region], 'click', function(event) {
            draw_region[region].setMap(null);
            labels_region[region].set('map', null);

            if (total_region[region] != 0) {
              array_clusters[region] = [];
              $.each(centroids[region], function(index, centroid){
                array_clusters[region].push(createCircle(centroid, counter[region][index]));
                circleLabel(labels_clusters[region][index], counter[region][index], centroid);
              });
            }

          });
        });
      });

    }
  });
}

function calcTotalRegion() {
  $.each(regions, function(index, region) {
    total_region[region] = 0;
    $.each(counter[region], function(index, value) {
      total_region[region] += value;
    });
  });
}

function attachPolygonInfoWindow(polygon) {
    var infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(polygon, 'mouseover', function (e) {
        infoWindow.setContent("Polygon Name");
        var latLng = e.latLng;
        infoWindow.setPosition(latLng);
        infoWindow.open(map);
    });
}

function circleLabel(label, number, points){
    if (number == 0) {
      return;
    } 
    label.set('text', number.toString());
    label.set('position', makeLatLong(points));
    label.set('map', map);
}

function makeLatLong(strPoint){
  aux = strPoint.replace("[", "");
  aux = aux.replace("]", "");
  aux = aux.split(",");
  return new google.maps.LatLng(parseFloat(aux[1]), parseFloat(aux[0]));
}

function createCircle(point, size){
  if (size == 0) {
    return;
  }
  icon_path = ""
  if (size < 5000) {
    icon_path = "/m1.png"
  } else if (size < 10000) {
    icon_path = "/m2.png"
  } else if (size < 20000) {
    icon_path = "/m3.png"
  } else if (size < 30000) {
    icon_path = "/m4.png"
  } else {
    icon_path = "/m5.png"
  }
  return new google.maps.Marker({
      position: makeLatLong(point),
      map: map,
      icon: icon_path
  });
}

function clearPolygons(ARRAY, ARRAY_LABELS){
  $.each(ARRAY, function(index, polygon){
    if (polygon != null) {
     polygon.setMap(null);
    }
  });

  $.each(ARRAY_LABELS, function(index, label){
    label.set('map', null);
  });
}

function makeOptions(bounds){
  return {
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: map,
          path: bounds
        };
}

function clauseParse(array)
{
  if (array.length == 0) {
    return ""
  }
  res = "";
  $.each(array, function(index, value){
    if (res != "") {
      res = res.concat(", ");
    }

    res = res.concat("'", value, "'");
  });
  res = "(".concat(res, ")");
  return res
}

// parse where clause for fusion layer query.
function whereParse(health_centres, region, specialties, age_group, cdi, treatment_type, 
  start_date, end_date, dist_min, dist_max, genders)
{
  where = ""
  if (health_centres.length > 0) {
    where = where.concat("cnes_id IN ", clauseParse(health_centres));
  }

  if (region.length > 0) {
    if (where != "") { 
      where = where.concat(" AND ");
    }
    where = where.concat("region IN ", clauseParse(region));
  }

  if (specialties.length > 0) {
    if (where != "") {
      where = where.concat(" AND ");
    }
    where = where.concat("specialty_id IN ", clauseParse(specialties));
  }

  if (age_group.length > 0) {
    if (where != "") {
      where = where.concat(" AND ");
    }
    where = where.concat("age_group IN ", clauseParse(age_group));
  }

  if (cdi.length > 0) {
    if (where != "") {
      where = where.concat(" AND ");
    }
    where = where.concat("cdi IN ", clauseParse(cdi));
  }

  if (treatment_type.length > 0) {
    if (where != "") {
      where = where.concat(" AND ");   
    }
    where = where.concat("treatment_type IN ", clauseParse(treatment_type));
  }

  if (start_date != "") {
    if (where != "") {
      where = where.concat(" AND ");
    }
    where = where.concat("start_date >= ", start_date);
  }

  if (end_date != "") {
    if (where != "") {
      where = where.concat(" AND ");
    }
    where = where.concat("end_date < ", end_date);
  }

  if (genders.length < 2) {
    if (where != "") {
      where = where.concat(" AND ");
    }
    where = where.concat("gender IN ", clauseParse(genders));
  }

  if (dist_min != "0") {
    if (where != "") {
      where = where.concat(" AND ");
    }
    where = where.concat("distance > ", dist_min.toString());
  }
  
  if (dist_max != "30") {
    if (where != "") {
      where = where.concat(" AND ");
    }
    where = where.concat("distance < ", dist_max.toString());
  }

  return where
}

function clear()
{
  $('#btn-clear').click(function() {
    $("#slider_distance").slider('refresh');
    $("#slider_distance_min").html('0');
    $("#slider_distance_max").html('30+');
    $(".select-health_centre").val('').trigger('change');
    $(".select-age_group").val('').trigger('change');
    $(".select-region").val('').trigger('change');
    $(".select-cdi").val('').trigger('change');
    $(".select-speciality").val('').trigger('change');
    $(".select-treatment").val('').trigger('change');
    $("#intervalStart").val('').datepicker('destroy').datepicker();
    $("#intervalEnd").val('').datepicker('destroy').datepicker();
    $("#sexo_masculino").prop("checked", true);
    $("#sexo_feminino").prop("checked", true);
    $("#checkbox_residencia_paciente").prop("checked", true);
    $("#checkbox_health_centre").prop("checked", true);

    clearMap();
  });
}

function clearMap() {
    $('#legend_proc').hide()

    if (ft_layer != null) {
      ft_layer.setMap(null);
    }

    $.each(regions, function(index, region) {
      clearPolygons(array_clusters[region], labels_clusters[region]);
      if (draw_region[region] != null) {
        draw_region[region].setMap(null);
      }

      if (labels_region[region] != null) {
        labels_region[region].set('map', null);
      }
    });
    
    if (SPmap != null) { 
      SPmap.setMap(null);
    }

    if (SPmap_label != null) { 
      SPmap_label.set('map', null);
    }
}

function data_input()
{
  $(document).ready(function(){
    $('.input-daterange').datepicker({
      format: "dd/mm/yyyy",
      language: "pt-BR",
      container:'#datepicker',
    });

    $("#slider_distance").slider({
      min: 0,
      max: 30,
      step: 1,
      value: [0,30],
    });
    $("#slider_distance").on("slide", function(slideEvt) {
      $("#slider_distance_min").html(slideEvt.value[0]);
      $("#slider_distance_max").html(slideEvt.value[1] + (slideEvt.value[1] >= 30 ? "+" : ""));
    });

    $.getJSON("age_group.json", function(data) {
      $(".select-age_group").select2({
        placeholder: "Todas",
        allowClear: true,
        data: data
      });
    });

    var regions = [
      { id: "CENTRO", text: "CENTRO" },
      { id: "LESTE", text: "LESTE" },
      { id: "NORTE", text: "NORTE" },
      { id: "OESTE", text: "OESTE" },
      { id: "SUDESTE", text: "SUDESTE" },
      { id: "SUL", text: "SUL" },
    ];

    $(".select-region").select2({
      placeholder: "Todas",
      data: regions,
    });

    $.getJSON('health_centres.json', function(data) {
      $.each(data, function(index, value) {
        health_centres_var[value.id] = value.text;
      });

      $(".select-health_centre").select2({
        placeholder: "Todos",
        data: data,
        allowClear: true
      });
    });

    $.getJSON('CID10.json', function(data){
      cid_array = data;
      $(".select-cdi").select2({
        placeholder: "Todas",
        allowClear: true,
        data: data,
      });
    });

    $.getJSON('specialties.json', function(data) {
      $(".select-speciality").select2({
        placeholder: "Todas",
        data: data,
        allowClear: true
      });
    });

    var treatments = [
      { id: "1", text: "ELETIVO" }, 
      { id: "2", text: "URGENCIA" }, 
      { id: "3", text: "ACIDENTE NO LOCAL DE TRABALHO OU A SERVICO DA EMPRESA" }, 
      { id: "4", text: "ACIDENTE NO TRAJETO PARA O TRABALHO" }, 
      { id: "5", text: "OUTROS TIPOS DE ACIDENTE DE TRANSITO" }, 
      { id: "6", text: "OUTROS TIPOS DE LESOES E ENVENENAMENTOS POR AGENTES QUIMICOS OU FISICOS" }, 
    ];

    $(".select-treatment").select2({
      placeholder: "Todos",
      data: treatments,
    });
  });
}