var ft_layer = null;
var SPmap = null;
var SPmap_label = null;
var latlng = null;
var health_centres_var = {};
var health_centre_icon = '/health_centre_icon.png';
var person_icon = '/home.png';
var cid_array = null;
var data = null;

// Automatic search
var auto = false;
var cleaning = false;

// Health Centres icon on map
var Markers = [];

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

function initProcedureMap()
{
  ft_layer = null;
  SPmap = null;
  SPmap_label = null;
  latlng = null;
  health_centres_var= {};
  auto = false;
  cleaning = false;
  Markers = [];
  draw_region = {};
  labels_region = {};
  total_region = {};
  array_clusters = {};
  labels_clusters = {};
  centroids = {};
  counter = {};

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
        {'name': 'Psiquiatria Hospital-Dia', 'color': colors_procedure[1]}
        ];

  // var $legend = $('#legend_proc')

  // $.each(leg_types, function(index, style){
  //   element = '<div class="item"><div class="color" style="background-color: '+style.color+
  //   '"></div><p class="text">'+style.name+'</p> </div></div>'
  //   $legend.append(element)
  // });
  // map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('legend_proc'));

  // var contextMenu = google.maps.event.addListener(
  //       map,
  //       "rightclick",
  //       function( event ) {
  //           // use JS Dom methods to create the menu
  //           // use event.pixel.x and event.pixel.y 
  //           // to position menu at mouse position
  //           console.log( event );
  //       }
  //   );

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

function automatic_search()
{
  var checkbox_search = document.getElementById('automatic_search_checkbox');

  if (checkbox_search.checked) {
    auto = true;
  } else {
    auto = false;
  }
}

function change()
{
  if (cleaning == false && auto == true){
    buscar()
  }
}

// Search button
function buscar()
{
    var sexo_masculino = document.getElementById('sexo_masculino');
    var sexo_feminino = document.getElementById('sexo_feminino');
    var residencia_paciente = document.getElementById('checkbox_residencia_paciente');
    var hc = document.getElementById('checkbox_health_centre');

    var genders = [];
    var filters = [];
    var health_centres = [];

    for (i = 0; i < 24; i++) {
      var aux = []
      var select_name = $('#' + i);
      $(select_name).each(function(index, brand){
        aux.push([$(this).val()]);
        if (i == 0) {
          health_centres = aux;
        }
      });
      filters.push(aux.join(";"));
    }

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

    data = {gender: genders.toString(), start_date: start_date.toString(), end_date: end_date.toString(), 
          dist_min: dist_min.toString(), dist_max: dist_max.toString(), filters: filters}

    // Clear map
    clearMap();

    // Show data 
    if (filterDay == 0) {
      if (genders.length == 0) {
        return;
      }

      if (health_centres != "") {
        $.getJSON("procedure/health_centres_procedure", {cnes: health_centres.toString()}, function(result){
          $.each(result, function(index, health_centre){
            create_markers(health_centre, health_centre_icon)
          });
          if (Markers[0] != null) {
            map.panTo(Markers[0].position);
          }
        });
        setMarkersMap(map);
      }
      where =  whereParse(filters, start_date, end_date, dist_min, dist_max, genders);
      ft_layer = new google.maps.FusionTablesLayer({
        query: {
          select: 'lat',
          from: '1LuW5LATPZByF7hnjNvWz5DHwW_k3MbaFmjV0iHZ5',
          where: where,
        }
        // },
        // styles: [
        //     {where: "'specialty_id' = 2", markerOptions:{iconName:"small_green"}},
        //     {where: "'specialty_id' = 3", markerOptions:{iconName:"small_red"}},
        //     {where: "'specialty_id' = 9", markerOptions:{iconName:"small_purple"}},
        //     {where: "'specialty_id' = '7'", markerOptions:{ iconName:"measle_brown"}},
        //     {where: "'specialty_id' = '5'", markerOptions:{ iconName:"measle_turquoise"}},
        // ]  
      });

      var sexp_var = {}
      sexp_var["M"] = "Masculino";
      sexp_var["F"] = "Feminino";

      google.maps.event.addListener(ft_layer, 'click', function(e) {
        e.infoWindowHtml = "<strong>Estabelecimento: </strong>" + health_centres_var[e.row['cnes_id'].value] + "<br>";
        e.infoWindowHtml += "<strong>Sexo: </strong>" + sexp_var[e.row['gender'].value] + "<br>";
        e.infoWindowHtml += "<strong>Idade: </strong>" + e.row['age_number'].value + "<br>";
        e.infoWindowHtml += "<strong>CID: </strong>" + e.row['cid_primary'].value + "<br>";
        e.infoWindowHtml += "<strong>CRS: </strong>" + e.row['CRS'].value + "<br>";
        e.infoWindowHtml += "<strong>Data: </strong>" + e.row['date'].value + "<br>";
        e.infoWindowHtml += "<strong>Distância: </strong>" + parseFloat(e.row['distance'].value).toPrecision(5) + "Km <br>";
      });

      // Send data for download, since individual view don't otherwise call the controller
      $.ajax({url: '/procedure/update_session', data: data, success: function(data){}});

      // $('#legend_proc').show()
      ft_layer.setMap(map);

    } else {
      $('#loading_overlay').show();
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
      TOTAL = 0;
      $.getJSON("procedure/procedures_search", data,
        function(result){
          $.each(regions, function(index, region) {
            total_region[region] = 0;
            labels_region[region] = createLabel(24);
            num = parseInt(result[0][region]);
            total_region[region] = num;
            TOTAL += num;
          });
          SPmap_label.set('text', TOTAL.toString());
          SPmap_label.set('position', latlng);
          SPmap_label.set('map', map);
          $('#loading_overlay').hide();
      });

      google.maps.event.addListener(SPmap, 'click', function (event) {
        SPmap.setMap(null);
        SPmap_label.set('map', null);

        if (TOTAL < 100000) {
          $('#loading_overlay').show();
          $.getJSON("procedure/procedures_latlong", data, function(procedures) {
            show_procedures(procedures, person_icon);
            $('#loading_overlay').hide();
          });
        } else {
          $.each(regions, function(index, region) {
            bounds = [];
            $.each(polygons_region[region], function(index, point) {
              bounds.push(new google.maps.LatLng(parseFloat(point[0]), parseFloat(point[1])));
            });
            draw_region[region] = new google.maps.Polygon(makeOptions(bounds));
            labels_region[region].set('text', total_region[region].toString());
            labels_region[region].set('position', new google.maps.LatLng(label_points[region][0], label_points[region][1]));
            labels_region[region].set('map', map);
            });
        }
      });
    }
}

function create_markers(procedure, icon_path)
{
  var marker = new google.maps.Marker({
      position: new google.maps.LatLng(procedure.lat, procedure.long),
      map: map,
      icon: icon_path
  });
  Markers.push(marker);
}

function setMarkersMap(map)
{
  for (var i = 0; i < Markers.length; i++) {
      Markers[i].setMap(map);
  }
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

function clauseParse(text)
{
  array = text.split(",");
  res = ""
  $.each(array, function(index, value){
    if (res != ""){
      res = res.concat(", ")
    }
    res = res.concat("'" + value + "'");
  });
  return res
}

function make_date(text)
{
  values = text.split("/");
  str = "";
  str = str.concat(values[2] + "-" + values[1] + "-" + values[0]);
  return str;
}

// parse where clause for fusion layer query.
function whereParse(filters, start_date, end_date, dist_min, dist_max, genders)
{
  where = ""
  filters_name = ["cnes_id", "age_code", "specialty_id", "treatment_type", "race", "lv_instruction", "cmpt", "proce_re", "cid_primary", "cid_secondary", "cid_secondary2", 
    "cid_associated", "days", "days_uti", "days_ui", "days_total", "finance", "val_total", "DA", "PR", "STS", "CRS", "complexity", "gestor_ide"];

  $.each(filters_name, function(index, value){
    if(filters[index] != "") {
     if (where != "") {
       where = where.concat(" AND ");
     }
     where = where.concat(value + " IN " + "(" + clauseParse(filters[index]) + ")");
    }
  });

  if (start_date != "") {
    start_date = make_date(start_date);
    if (where != "") {
      where = where.concat(" AND ");
    }
    where = where.concat("date >= " + "\'" + start_date + "\'");
  }

  if (end_date != "") {
    end_date = make_date(end_date);
    if (where != "") {
      where = where.concat(" AND ");
    }
    where = where.concat("date < " + "\'" + end_date + "\'");
  }

  genders = genders.join();
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

function limpar()
{
    cleaning = true;
    $("#slider_distance").slider('refresh');
    $("#slider_distance_min").html('0');
    $("#slider_distance_max").html('10');

    for (i = 0; i < 24; i++) {
      name = ".select-" + i
      $(name).val('').trigger('change');
    }
    $("#intervalStart").val('').datepicker('destroy').datepicker();
    $("#intervalEnd").val('').datepicker('destroy').datepicker();
    $("#sexo_masculino").prop("checked", true);
    $("#sexo_feminino").prop("checked", true);

    clearMap();
}

function clearMap() {
    $('#legend_proc').hide()

    if (ft_layer != null) {
      ft_layer.setMap(null);
    }

    teardown_markers();

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

    setMarkersMap(null);
    Markers = [];
    cleaning = false;
}

function graphs() {
    var w = window.open('dados-gerais');
    w.teste = data;
}

function print_maps() {
    const $body = $('body');
    const $mapContainer = $('.map-wrapper');
    const $mapContainerParent = $mapContainer.parent();
    const $printContainer = $('<div style="position:relative;">');

    $printContainer
      .height($mapContainer.height())
      .append($mapContainer)
      .prependTo($body);

    const $content = $body
      .children()
      .not($printContainer)
      .not('script')
      .detach();

    /**
     * Needed for those who use Bootstrap 3.x, because some of
     * its @media print styles ain't play nicely when printing.
     */
    const $patchedStyle = $('<style media="print">')
      .text('img { max-width: none !important; } a[href]:after { content: ""; }')
      .appendTo('head');

    window.print();

    $body.prepend($content);
    $mapContainerParent.prepend($mapContainer);

    $printContainer.remove();
    $patchedStyle.remove();
}

function dadosInput()
{
    $('#datepicker').datepicker({
      format: "dd/mm/yyyy",
      language: "pt-BR",
      container:'#datepicker',
    });

    $("#slider_distance").slider({
      min: 0,
      max: 30,
      step: 1,
      value: [0,10],
    });
    $("#slider_distance").on("slide", function(slideEvt) {
      $("#slider_distance_min").html(slideEvt.value[0]);
      $("#slider_distance_max").html(slideEvt.value[1] + (slideEvt.value[1] >= 30 ? "+" : ""));
    });

    $.ajax({
      url: '/health_centres.json',
      success: function(data){
        $.each(data, function(index, value) {
          health_centres_var[value.id] = value.text;
        });

        $("#0").select2({
          placeholder: "Todos",
          data: data,
          allowClear: true
        });
      }
    });

    $.ajax({
      url: '/age_group.json',
      success: function(data){
        $("#1").select2({
          placeholder: "Todas",
          allowClear: true,
          data: data
        });
      }
    });

    $.ajax({
      url: '/specialties.json',
      success: function(data){
        $("#2").select2({
          placeholder: "Todas",
          data: data,
          allowClear: true
        });
      }
    });

    var treatments = [
      { id: "1", text: "ELETIVO" }, 
      { id: "2", text: "URGENCIA" }, 
      { id: "3", text: "ACIDENTE NO LOCAL DE TRABALHO OU A SERVICO DA EMPRESA" }, 
      { id: "5", text: "OUTROS TIPOS DE ACIDENTE DE TRANSITO" }, 
      { id: "6", text: "OUTROS TIPOS DE LESOES E ENVENENAMENTOS POR AGENTES QUIMICOS OU FISICOS" }, 
    ];

    $("#3").select2({
      placeholder: "Todos",
      data: treatments,
    });

    $.ajax({
      url: '/race.json',
      success: function(data){
        $("#4").select2({
          placeholder: "Todas",
          data: data,
          allowClear: true
        });
      }
    });

    $.ajax({
      url: '/lv_instruction.json',
      success: function(data){
        $("#5").select2({
          placeholder: "Todas",
          data: data,
          allowClear: true
        });
      }
    });

    $.ajax({
      url: '/cmpt.json',
      success: function(data){
        $("#6").select2({
          placeholder: "Todas",
          data: data,
          allowClear: true
        });
      }
    });

    $.ajax({
      url: '/proc_re.json',
      success: function(data){
        $("#7").select2({
          placeholder: "Todas",
          data: data,
          allowClear: true
        });
      }
    });

    if (cid_array == null) {
      $.ajax({
        url: '/CID10.json',
        success: function(data){
          cid_array = data;
          $("#8").select2({
            placeholder: "Todas",
            allowClear: true,
            data: data,
          });
          $("#9").select2({
            placeholder: "Todas",
            allowClear: true,
            data: data,
          });
          $("#10").select2({
            placeholder: "Todas",
            allowClear: true,
            data: data,
          });
          $("#11").select2({
            placeholder: "Todas",
            allowClear: true,
            data: data,
          });
        }
      });
    } else {
          $("#8").select2({
            placeholder: "Todas",
            tags: true
          });
          $("#9").select2({
            placeholder: "Todas",
            tags: true
          });
          $("#10").select2({
            placeholder: "Todas",
            tags: true
          });
          $("#11").select2({
            placeholder: "Todas",
            tags: true
          }); 
    }

    $("#12").select2({
      placeholder: "Todos",
      tags: true
    });

    $("#13").select2({
      placeholder: "Todos",
      tags: true
    });

    $("#14").select2({
      placeholder: "Todos",
      tags: true
    });

    $("#15").select2({
      placeholder: "Todos",
      tags: true
    });

    $.getJSON('/finance.json', function(data) {
      $("#16").select2({
        placeholder: "Todos",
        data: data,
        allowClear: true
      });
    });

    $("#17").select2({
      placeholder: "Todos",
      tags: true
    });

    $.getJSON('/DA.json', function(data) {
      $("#18").select2({
        placeholder: "Todas",
        data: data,
        allowClear: true
      });
    });

    $.getJSON('/PR.json', function(data) {
      $("#19").select2({
        placeholder: "Todas",
        data: data,
        allowClear: true
      });
    });

    $.getJSON('/STS.json', function(data) {
      $("#20").select2({
        placeholder: "Todas",
        data: data,
        allowClear: true
      });
    });

    $.getJSON('/CRS.json', function(data) {
      $("#21").select2({
        placeholder: "Todas",
        data: data,
        allowClear: true
      });
    });

    $.getJSON('/complexity.json', function(data) {
      $("#22").select2({
        placeholder: "Todas",
        data: data,
        allowClear: true
      });
    });

    var gestor = [{id:"00", text:"ESTADUAL"},
    {id:"01", text:"MUNICIPAL"}];
    $("#23").select2({
        placeholder: "Todas",
        data: gestor,
        allowClear: true
    });
}