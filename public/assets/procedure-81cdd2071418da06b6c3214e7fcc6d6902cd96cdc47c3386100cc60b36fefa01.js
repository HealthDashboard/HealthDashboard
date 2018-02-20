var ft_layer = null;
var SPmap = null;
var SPmap_label = null;
var latlng = null;
var health_centres_var = {};
var health_centre_icon = '/health_centre_icon.png';
var person_icon = '/home.png';

var colors_procedure = [
 '#003300',
 '#15ff00',
 '#ff0000',
 "#f5b979",
 "#13f1e8",
 "#615ac7",
 "#8e3a06",
 "#b769ab",
 "#df10eb"
];

var CID_ARRAY = {};

//POLYGONS
NORTE_POL = null;
OESTE_POL = null;
SUL_POL = null;
SUDESTE_POL = null;
CENTRO_POL = null;
LESTE_POL = null;

POLYGONS_ARRAY = {};
NORTE_ARRAY = [];
OESTE_ARRAY = [];
SUL_ARRAY = [];
SUDESTE_ARRAY = [];
CENTRO_ARRAY = [];
LESTE_ARRAY = [];

//LABELS
NORTE_LAB = null;
OESTE_LAB = null;
SUL_LAB = null;
SUDESTE_LAB = null;
CENTRO_LAB = null;
LESTE_LAB = null;

NORTE_LAB_ARRAY = [];
OESTE_LAB_ARRAY = [];
SUL_LAB_ARRAY = [];
SUDESTE_LAB_ARRAY = [];
CENTRO_LAB_ARRAY = [];
LESTE_LAB_ARRAY = [];

// POINTS
OESTE_LABEL_POINT = [-23.562630, -46.734051];
NORTE_LABEL_POINT = [-23.459998, -46.670880];
SUL_LABEL_POINT = [-23.762625, -46.704525];
LESTE_LABEL_POINT = [-23.552559, -46.443600];
SUDESTE_LABEL_POINT = [-23.557594, -46.569251];
CENTRO_LABEL_POINT = [-23.547838, -46.633801];

oeste_points = [];

norte_points = [];

leste_points = [];

sudeste_points = [];

sul_points = [];

centro_points = [];

// Number
COUNTER = [];

NORTE_TOTAL = 0;
SUL_TOTAL = 0;
SUDESTE_TOTAL = 0;
CENTRO_TOTAL = 0;
LESTE_TOTAL = 0;
OESTE_TOTAL = 0;

// Colors
var colors = [
 '#FF9900',
 '#FFCC00',
 '#FFFF00',
 "#CCFF00",
 "#99FF00",
 "#66FF00",
 "#33FF00",
 "#FF0000"
]


function calcTotalRegion(){
  NORTE_TOTAL = 0;
  SUL_TOTAL = 0;
  SUDESTE_TOTAL = 0;
  CENTRO_TOTAL = 0;
  LESTE_TOTAL = 0;
  OESTE_TOTAL = 0;

  OESTE_TOTAL = (COUNTER[0] + COUNTER[1] + COUNTER[2] + COUNTER[3]);
  NORTE_TOTAL = (COUNTER[4] + COUNTER[5] + COUNTER[6] + COUNTER[7]);
  LESTE_TOTAL = (COUNTER[8] + COUNTER[9] + COUNTER[10] + COUNTER[11]);
  SUL_TOTAL = (COUNTER[12] + COUNTER[13] + COUNTER[14] + COUNTER[15]);
  SUDESTE_TOTAL = (COUNTER[16] + COUNTER[17] + COUNTER[18] + COUNTER[19]);
  CENTRO_TOTAL = (COUNTER[20] + COUNTER[21]);
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

function initMap()
{
  var lat = -23.557296000000001
  var lng = -46.669210999999997
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
  $('#legend_proc').hide()

  SPmap_label = new MapLabel({
          fontSize: 28,
          align: 'center'
        });

  OESTE_LAB = createLabel(24);
  NORTE_LAB = createLabel(24);
  SUL_LAB = createLabel(24);
  SUDESTE_LAB = createLabel(24);
  CENTRO_LAB = createLabel(24);
  LESTE_LAB = createLabel(24);

  for (i = 0; i < 4; i++){
      OESTE_LAB_ARRAY.push(createLabel(20))
      NORTE_LAB_ARRAY.push(createLabel(20))
      SUL_LAB_ARRAY.push(createLabel(20))
      LESTE_LAB_ARRAY.push(createLabel(20))
      SUDESTE_LAB_ARRAY.push(createLabel(20))
  }
  CENTRO_LAB_ARRAY.push(createLabel(20))
  CENTRO_LAB_ARRAY.push(createLabel(20))
}

function createLabel(size){
  return new MapLabel({
          fontSize: size,
          align: 'center'
        });
}

// funtion clickable() {
//     $('#btn-submit').click(submit());
// }

// Search button
function submit()
{
  $('#btn-submit').click(function() {
    // document.body.style.cursor = 'wait';
    var sexo_masculino = document.getElementById('sexo_masculino');
    var sexo_feminino = document.getElementById('sexo_feminino');
    var residencia_paciente = document.getElementById('checkbox_residencia_paciente');
    var hc = document.getElementById('checkbox_health_centre');
    var railsEnv = $('body').data('env')

    console.log(railsEnv)

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
      // console.log([$(this).val()])
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
    $('#legend_proc').hide()

    if (ft_layer != null) {
      ft_layer.setMap(null);
    }

    clearPolygons(OESTE_ARRAY, OESTE_LAB_ARRAY);
    clearPolygons(NORTE_ARRAY, NORTE_LAB_ARRAY);
    clearPolygons(SUL_ARRAY, SUL_LAB_ARRAY);
    clearPolygons(LESTE_ARRAY, LESTE_LAB_ARRAY);
    clearPolygons(SUDESTE_ARRAY, SUDESTE_LAB_ARRAY);
    clearPolygons(CENTRO_ARRAY, CENTRO_LAB_ARRAY);
    
    if (SPmap != null) { 
      SPmap.setMap(null);
    }

    if (NORTE_POL != null) { NORTE_POL.setMap(null); }
    if (SUL_POL != null) { SUL_POL.setMap(null); }
    if (LESTE_POL != null) { LESTE_POL.setMap(null); }
    if (OESTE_POL != null) { OESTE_POL.setMap(null); }
    if (SUDESTE_POL != null) { SUDESTE_POL.setMap(null); }
    if (CENTRO_POL != null) { CENTRO_POL.setMap(null); }

    if (SPmap_label != null) { 
      SPmap_label.set('map', null);
    }

    if (NORTE_LAB != null) { NORTE_LAB.set('map', null); }
    if (SUL_LAB != null) { SUL_LAB.set('map', null); }
    if (OESTE_LAB != null) { OESTE_LAB.set('map', null); }
    if (SUDESTE_LAB != null) { SUDESTE_LAB.set('map', null); }
    if (LESTE_LAB != null) { LESTE_LAB.set('map', null); }
    if (CENTRO_LAB != null) { CENTRO_LAB.set('map', null); }

    // Show data 
    if (filterDay == 0) {
      where =  whereParse(health_centres, region, specialties, age_group, cdi, treatment_type, 
  start_date, end_date, dist_min, dist_max, genders);
      ft_layer = new google.maps.FusionTablesLayer({
        query: {
          select: 'LAT_SC',
          from: railsEnv,
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

      COUNTER = []
      $.getJSON("procedure/procedures_search", {gender: genders.toString(), cnes: health_centres.toString(),
          specialties: specialties.toString(), start_date: start_date.toString(), end_date: end_date.toString(), 
          dist_min: dist_min.toString(), dist_max: dist_max.toString(), age_group: age_group.toString(), region: region.toString(),
          cdi: cdi.toString(), treatment_type: treatment_type.toString()}, 
          function(result){
            TOTAL = 0;
            console.log(result)
            $.each(result[0]["oeste"], function(index, number){
                num = parseInt(number["number"]);
                COUNTER.push(num);
                oeste_points.push(number["centroid"]);
                TOTAL += num;
            });
            $.each(result[0]["norte"], function(index, number){
                num = parseInt(number["number"]);
                COUNTER.push(num);
                norte_points.push(number["centroid"]);
                TOTAL += num;
            });
            $.each(result[0]["leste"], function(index, number){
                num = parseInt(number["number"]);
                COUNTER.push(num);
                leste_points.push(number["centroid"]);
                TOTAL += num;
            });
            $.each(result[0]["sul"], function(index, number){
                num = parseInt(number["number"]);
                COUNTER.push(num);
                sul_points.push(number["centroid"]);
                TOTAL += num;
            });
            $.each(result[0]["sudeste"], function(index, number){
                num = parseInt(number["number"]);
                COUNTER.push(num);
                sudeste_points.push(number["centroid"]);
                TOTAL += num;
            });
            $.each(result[0]["centro"], function(index, number){
                num = parseInt(number["number"]);
                COUNTER.push(num);
                centro_points.push(number["centroid"]);
                TOTAL += num;
            });
            calcTotalRegion();
            SPmap_label.set('text', TOTAL.toString());
            SPmap_label.set('position', latlng);
            SPmap_label.set('map', map);
      });

      google.maps.event.addListener(SPmap, 'click', function (event) {
        SPmap.setMap(null);
        SPmap_label.set('map', null);

        bounds = []
        $.each(Centro, function(index, point){
          bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])))
        });
        CENTRO_POL = (new google.maps.Polygon(makeOptions(bounds)));
        CENTRO_LAB.set('text', CENTRO_TOTAL.toString());
        CENTRO_LAB.set('position', new google.maps.LatLng(CENTRO_LABEL_POINT[0], CENTRO_LABEL_POINT[1]));
        CENTRO_LAB.set('map', map);
        google.maps.event.addListener(CENTRO_POL, 'click', function (event) {
          CENTRO_POL.setMap(null);
          CENTRO_LAB.set('map', null);

          if (CENTRO_TOTAL != 0) { 
            centro1 = createCircle(centro_points[0], COUNTER[20])
            centro2 = createCircle(centro_points[1], COUNTER[21])
            CENTRO_ARRAY.push(centro1);
            CENTRO_ARRAY.push(centro2);
            circleLAbel(CENTRO_LAB_ARRAY[0], COUNTER[20], centro_points[0])
            circleLAbel(CENTRO_LAB_ARRAY[1], COUNTER[21], centro_points[1])
          }
        });

        bounds = []
        $.each(Oeste, function(index, point){
          bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])))
        });
        OESTE_POL = (new google.maps.Polygon(makeOptions(bounds)));
        OESTE_LAB.set('text', OESTE_TOTAL.toString());
        OESTE_LAB.set('position', new google.maps.LatLng(OESTE_LABEL_POINT[0], OESTE_LABEL_POINT[1]));
        OESTE_LAB.set('map', map);

        google.maps.event.addListener(OESTE_POL, 'click', function (event) {
          OESTE_POL.setMap(null);
          OESTE_LAB.set('map', null);

          if (OESTE_TOTAL != 0) { 
            oeste1 = createCircle(oeste_points[0], COUNTER[0])
            oeste2 = createCircle(oeste_points[1], COUNTER[1])
            oeste3 = createCircle(oeste_points[2], COUNTER[2])
            oeste4 = createCircle(oeste_points[3], COUNTER[3])
            OESTE_ARRAY.push(oeste1)
            OESTE_ARRAY.push(oeste2)
            OESTE_ARRAY.push(oeste3)
            OESTE_ARRAY.push(oeste4)

            circleLAbel(OESTE_LAB_ARRAY[0], COUNTER[0], oeste_points[0])
            circleLAbel(OESTE_LAB_ARRAY[1], COUNTER[1], oeste_points[1])
            circleLAbel(OESTE_LAB_ARRAY[2], COUNTER[2], oeste_points[2])
            circleLAbel(OESTE_LAB_ARRAY[3], COUNTER[3], oeste_points[3])
          }
        });

        bounds = []
        $.each(Norte, function(index, point){
          bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])))
        });
        NORTE_POL = (new google.maps.Polygon(makeOptions(bounds)));
        NORTE_LAB.set('text', NORTE_TOTAL.toString());
        NORTE_LAB.set('position', new google.maps.LatLng(NORTE_LABEL_POINT[0], NORTE_LABEL_POINT[1]));
        NORTE_LAB.set('map', map);

        google.maps.event.addListener(NORTE_POL, 'click', function (event) {
          NORTE_POL.setMap(null);
          NORTE_LAB.set('map', null);

          if (NORTE_TOTAL != 0) { 
            norte1 = createCircle(norte_points[0], COUNTER[4])
            norte2 = createCircle(norte_points[1], COUNTER[5])
            norte3 = createCircle(norte_points[2], COUNTER[6])
            norte4 = createCircle(norte_points[3], COUNTER[7])
            NORTE_ARRAY.push(norte1)
            NORTE_ARRAY.push(norte2)
            NORTE_ARRAY.push(norte3)
            NORTE_ARRAY.push(norte4)

            circleLAbel(NORTE_LAB_ARRAY[0], COUNTER[4], norte_points[0])
            circleLAbel(NORTE_LAB_ARRAY[1], COUNTER[5], norte_points[1])
            circleLAbel(NORTE_LAB_ARRAY[2], COUNTER[6], norte_points[2])
            circleLAbel(NORTE_LAB_ARRAY[3], COUNTER[7], norte_points[3])
          }
        });

        bounds = []
        $.each(Leste, function(index, point){
          bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])))
        });
        LESTE_POL = (new google.maps.Polygon(makeOptions(bounds)));
        LESTE_LAB.set('text', LESTE_TOTAL.toString());
        LESTE_LAB.set('position', new google.maps.LatLng(LESTE_LABEL_POINT[0], LESTE_LABEL_POINT[1]));
        LESTE_LAB.set('map', map);

        google.maps.event.addListener(LESTE_POL, 'click', function (event) {
          LESTE_POL.setMap(null);
          LESTE_LAB.set('map', null);

          if (LESTE_TOTAL != 0) { 
            leste1 = createCircle(leste_points[0], COUNTER[8])
            leste2 = createCircle(leste_points[1], COUNTER[9])
            leste3 = createCircle(leste_points[2], COUNTER[10])
            leste4 = createCircle(leste_points[3], COUNTER[11])
            LESTE_ARRAY.push(leste1)
            LESTE_ARRAY.push(leste2)
            LESTE_ARRAY.push(leste3)
            LESTE_ARRAY.push(leste4)
            circleLAbel(LESTE_LAB_ARRAY[0], COUNTER[8], leste_points[0])
            circleLAbel(LESTE_LAB_ARRAY[1], COUNTER[9], leste_points[1])
            circleLAbel(LESTE_LAB_ARRAY[2], COUNTER[10], leste_points[2])
            circleLAbel(LESTE_LAB_ARRAY[3], COUNTER[11], leste_points[3])
          }
        });

        bounds = []
        $.each(Sul, function(index, point){
          bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])))
        });
        SUL_POL = (new google.maps.Polygon(makeOptions(bounds)));
        SUL_LAB.set('text', SUL_TOTAL.toString());
        SUL_LAB.set('position', new google.maps.LatLng(SUL_LABEL_POINT[0], SUL_LABEL_POINT[1]));
        SUL_LAB.set('map', map);
        google.maps.event.addListener(SUL_POL, 'click', function (event) {
          SUL_POL.setMap(null);
          SUL_LAB.set('map', null);

          if (SUL_TOTAL != 0) { 
            sul1 = createCircle(sul_points[0], COUNTER[12])
            sul2 = createCircle(sul_points[1], COUNTER[13])
            sul3 = createCircle(sul_points[2], COUNTER[14])
            sul4 = createCircle(sul_points[3], COUNTER[15])
            SUL_ARRAY.push(sul1)
            SUL_ARRAY.push(sul2)
            SUL_ARRAY.push(sul3)
            SUL_ARRAY.push(sul4)
            circleLAbel(SUL_LAB_ARRAY[0], COUNTER[12], sul_points[0])
            circleLAbel(SUL_LAB_ARRAY[1], COUNTER[13], sul_points[1])
            circleLAbel(SUL_LAB_ARRAY[2], COUNTER[14], sul_points[2])
            circleLAbel(SUL_LAB_ARRAY[3], COUNTER[15], sul_points[3])
          }
        });

        bounds = []
        $.each(Sudeste, function(index, point){
          bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])))
        });
        SUDESTE_POL = (new google.maps.Polygon(makeOptions(bounds)));
        SUDESTE_LAB.set('text', SUDESTE_TOTAL.toString());
        SUDESTE_LAB.set('position', new google.maps.LatLng(SUDESTE_LABEL_POINT[0], SUDESTE_LABEL_POINT[1]));
        SUDESTE_LAB.set('map', map);
        google.maps.event.addListener(SUDESTE_POL, 'click', function (event) {
          SUDESTE_POL.setMap(null);
          SUDESTE_LAB.set('map', null);

          if (SUDESTE_TOTAL != 0) { 
            sudeste1 = createCircle(sudeste_points[0], COUNTER[16])
            sudeste2 = createCircle(sudeste_points[1], COUNTER[17])
            sudeste3 = createCircle(sudeste_points[2], COUNTER[18])
            sudeste4 = createCircle(sudeste_points[3], COUNTER[19])
            SUDESTE_ARRAY.push(sudeste1)
            SUDESTE_ARRAY.push(sudeste2)
            SUDESTE_ARRAY.push(sudeste3)
            SUDESTE_ARRAY.push(sudeste4)
            circleLAbel(SUDESTE_LAB_ARRAY[0], COUNTER[16], sudeste_points[0])
            circleLAbel(SUDESTE_LAB_ARRAY[1], COUNTER[17], sudeste_points[1])
            circleLAbel(SUDESTE_LAB_ARRAY[2], COUNTER[18], sudeste_points[2])
            circleLAbel(SUDESTE_LAB_ARRAY[3], COUNTER[19], sudeste_points[3])
          }
        });
      }); 
    }
  });
}

function circleLAbel(label, number, points){
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

  console.log(where)
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
    if (ft_layer != null) {
      ft_layer.setMap(null);
    }

    $('#legend_proc').hide()

    clearPolygons(OESTE_ARRAY, OESTE_LAB_ARRAY);
    clearPolygons(NORTE_ARRAY, NORTE_LAB_ARRAY);
    clearPolygons(SUL_ARRAY, SUL_LAB_ARRAY);
    clearPolygons(LESTE_ARRAY, LESTE_LAB_ARRAY);
    clearPolygons(SUDESTE_ARRAY, SUDESTE_LAB_ARRAY);
    clearPolygons(CENTRO_ARRAY, CENTRO_LAB_ARRAY);
    
    if (SPmap != null) { 
      SPmap.setMap(null);
    }

    if (NORTE_POL != null) { NORTE_POL.setMap(null); }
    if (SUL_POL != null) { SUL_POL.setMap(null); }
    if (LESTE_POL != null) { LESTE_POL.setMap(null); }
    if (OESTE_POL != null) { OESTE_POL.setMap(null); }
    if (SUDESTE_POL != null) { SUDESTE_POL.setMap(null); }
    if (CENTRO_POL != null) { CENTRO_POL.setMap(null); }

    if (SPmap_label != null) { 
      SPmap_label.set('map', null);
    }

    if (NORTE_LAB != null) { NORTE_LAB.set('map', null); }
    if (SUL_LAB != null) { SUL_LAB.set('map', null); }
    if (OESTE_LAB != null) { OESTE_LAB.set('map', null); }
    if (SUDESTE_LAB != null) { SUDESTE_LAB.set('map', null); }
    if (LESTE_LAB != null) { LESTE_LAB.set('map', null); }
    if (CENTRO_LAB != null) { CENTRO_LAB.set('map', null); }
  });
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
      CID_ARRAY = data;
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
;
