var ft_layer = null;
var SPmap = null;
var SPmap_label = null;
var latlng = null;
var health_centres_var = {};
var health_centre_icon = '/health_centre_icon.png';
var person_icon = '/home.png';

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
  SPmap_label = new MapLabel({
          fontSize: 28,
          align: 'center'
        });
}

// Search button
function submit()
{
  $('#btn-submit').click(function() {
    // document.body.style.cursor = 'wait';
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
      specialties.push([$(this).val()]);
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
    if (ft_layer != null) {
      ft_layer.setMap(null);
    }

    if (SPmap != null) { 
      SPmap.setMap(null);
    }

    if (SPmap_label != null) { 
      SPmap_label.set('map', null);
    }

    // Show data 
    if (filterDay == 0) {
      where =  whereParse(health_centres, region)
      ft_layer = new google.maps.FusionTablesLayer({
        query: {
          select: 'LAT_SC',
          from: '1NY6F66M-QEkGAMyiDAoALQV3_ypjZC3pL-TTUUy9',
          where: where 
        },
      });

      var sexp_var = {}
      sexp_var["M"] = "Masculino";
      sexp_var["F"] = "Feminino";

      google.maps.event.addListener(ft_layer, 'click', function(e) {
        // Change the content of the InfoWindow
        e.infoWindowHtml = "<strong>Estabelecimento: </strong>" + health_centres_var[e.row['CNES'].value] + "<br>";
        e.infoWindowHtml += "<strong>Sexo: </strong>" + sexp_var[e.row['P_SEXO'].value] + "<br>";
        e.infoWindowHtml += "<strong>Idade: </strong>" + e.row['P_IDADE'].value + "<br>";
        e.infoWindowHtml += "<strong>CDI: </strong>" + e.row['DIAG_PR'].value + "<br>";
        e.infoWindowHtml += "<strong>Região: </strong>" + e.row['CRS'].value + "<br>";
      });
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
      SPmap.setMap(map)

      $.ajax({url: "/procedure/procedures_count", success: function(result) {
        SPmap_label.set('text', result.toString());
        SPmap_label.set('position', latlng);
        SPmap_label.set('map', map);
      }});
    }
  });
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
function whereParse(health_centres, region)
{
  where = ""
  if (health_centres.length > 0) {
    where = where.concat("CNES IN", clauseParse(health_centres));
  }

  if (region.length > 0) {
    if (where != "") { 
      where = where.concat(" AND ");
    }
    where = where.concat("CRS IN", clauseParse(region));
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
    if (ft_layer != null) {
      ft_layer.setMap(null);
    }

    if (SPmap != null) { 
      SPmap.setMap(null);
    }

    if (SPmap_label != null) { 
      SPmap_label.set('map', null);
    }  });
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

    var age_group = [
      { id: "TP_0A4", text: "0 a 4 anos" },
      { id: "TP_5A9", text: "5 a 9 anos" },
      { id: "TP_10A14", text: "10 a 14 anos" },
      { id: "TP_15A19", text: "15 a 19 anos" },
      { id: "TP_20A24", text: "20 a 24 anos" },
      { id: "TP_25A29", text: "25 a 29 anos" },
      { id: "TP_30A34", text: "30 a 34 anos" },
      { id: "TP_35A39", text: "35 a 39 anos" },
      { id: "TP_40A44", text: "40 a 44 anos" },
      { id: "TP_45A49", text: "45 a 49 anos" },
      { id: "TP_50A54", text: "50 a 54 anos" },
      { id: "TP_55A59", text: "55 a 59 anos" },
      { id: "TP_60A64", text: "60 a 64 anos" },
      { id: "TP_65A69", text: "65 a 69 anos" },
      { id: "TP_70A74", text: "70 a 74 anos" },
      { id: "TP_75A79", text: "75 a 79 anos" },
      { id: "TP_80A84", text: "80 a 84 anos" },
      { id: "TP_85A89", text: "85 a 89 anos" },
      { id: "TP_90A94", text: "90 a 94 anos" },
      { id: "TP_95A99", text: "95 a 99 anos" },
      { id: "TP_100OUMA", text: "100 ou mais anos" },
    ];

    $(".select-age_group").select2({
      placeholder: "Todas",
      allowClear: true,
      data: age_group,
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

    $.ajax({url: "/procedure/health_centres", success: function(result) {
         $.each(result, function(index, value){
           health_centres_var[value.id] = value.text
         });
        $(".select-health_centre").select2({
            placeholder: "Todos",
            data: result,
            allowClear: true
        });
    }});

    $.getJSON('CID10.json', function(data){
      $(".select-cdi").select2({
        placeholder: "Todas",
        allowClear: true,
        data: data,
      });
    });

    $.ajax({url: "/procedure/specialties", success: function(result) {
      $(".select-speciality").select2({
        placeholder: "Todas",
        data: result,
      });
    }});

    var treatments = [
      { id: "01", text: "ELETIVO" }, 
      { id: "02", text: "URGENCIA" }, 
      { id: "03", text: "ACIDENTE NO LOCAL DE TRABALHO OU A SERVICO DA EMPRESA" }, 
      { id: "04", text: "ACIDENTE NO TRAJETO PARA O TRABALHO" }, 
      { id: "05", text: "OUTROS TIPOS DE ACIDENTE DE TRANSITO" }, 
      { id: "06", text: "OUTROS TIPOS DE LESOES E ENVENENAMENTOS POR AGENTES QUIMICOS OU FISICOS" }, 
    ];

    $(".select-treatment").select2({
      placeholder: "Todos",
      data: treatments,
    });
  });
}
;
