// var map;
var button_status = false;
var info_boxes_hc = [];
var info_boxes_procedure = [];
var info_box_opened_procedure = -1;
var info_box_opened_hc = -1;
var temporary_hc = null;
var temporary_procedures = [];
var type;

var health_centre_icon = '/health_centre_icon.png';

var person_icon = '/home.png';

function initialize_procedures_map()
{
  var lat = -23.557296000000001
  var lng = -46.669210999999997
  var latlng = new google.maps.LatLng(lat, lng);

  var options = {
      zoom: 11,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(document.getElementById("procedure_map"), options);
}

function submit()
{
  $('#btn-submit').click(function() {
    document.body.style.cursor = 'wait';
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

    teardown_circles();

    // Inicializando variaveis globais 
    button_status = false;
    setTemporaryProcedures(false);
    temporary_procedures = [];
    p_markers_visible(false);
    if (temporary_hc != null) {
      temporary_hc.setVisible(false);
    }
    info_boxes_procedure = [];
    info_boxes_hc = [];
    temporary_procedures = [];

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

      $.getJSON("procedure/health_centres_search", {gender: genders.toString(), cnes: health_centres.toString(),
          specialties: specialties.toString(), start_date: start_date.toString(), end_date: end_date.toString(), 
          dist_min: dist_min.toString(), dist_max: dist_max.toString(), age_group: age_group.toString(), region: region.toString(),
          cdi: cdi.toString(), treatment_type: treatment_type.toString(), show_hc: hc.checked.toString(), show_rp: residencia_paciente.checked.toString()}, 
          function(result){
            if (hc.checked) {
              $.each(result.health_centres, function(index, health_centre){
                create_makers_with_info(health_centre, text_heathcentre, "healthcentre", health_centre_icon)
              });
            }
            if (residencia_paciente.checked) {
              show_procedures(result.procedures, person_icon)
            }
            document.body.style.cursor = 'default';
      });
      p_markers_visible(true, "hc");


    // if(residencia_paciente.checked) {
    //   $.getJSON("procedure/procedures_search", {gender: genders.toString(), cnes: health_centres.toString(), 
    //       specialties: specialties.toString(), start_date: start_date.toString(), end_date: end_date.toString(), 
    //       dist_min: dist_min.toString(), dist_max: dist_max.toString(), age_group: age_group.toString(),
    //       cdi: cdi.toString(), treatment_type: treatment_type.toString()},
    //       function(procedures){
    //         show_procedures(procedures, person_icon)
    //         document.body.style.cursor = 'default';
    //   });
    // }
  });
}

function create_makers_with_info(data, generate_infobox_text, type, icon)
{
  var marker = p_create_markers(data, icon)
  p_add_info_to_marker(marker, data, generate_infobox_text, type)
  return marker
}

function p_create_markers(data, icon_path)
{
  var marker = new google.maps.Marker({
      position: new google.maps.LatLng(data.lat, data.long),
      map: map,
      icon: icon_path
  });
  return marker
}

function p_add_info_to_marker(marker, data, generate_infobox_text, type)
{
  info_boxes_hc[data.id] = new google.maps.InfoWindow()
  info_boxes_hc[data.id].marker = marker
  info_boxes_hc[data.id].id = data.id
  info_boxes_hc[data.id].data = data
  p_add_listener(marker, data, generate_infobox_text, type)
}

function p_add_listener(marker, data, generate_infobox_text, type)
{
  info_boxes_hc[data.id].listener = google.maps.event.addListener(marker, 'click', function (e) {
      info_boxes_hc[data.id].setContent(generate_infobox_text(data))
      p_open_info_box(data.id, marker, type);
  });
}

function p_open_info_box(id, marker, type){
  if ((typeof(info_box_opened_hc) === 'number' && typeof(info_boxes_hc[info_box_opened_hc]) === 'object' )) {
    info_boxes_hc[info_box_opened_hc].close()
  }
  if (info_box_opened_hc !== id){
    info_boxes_hc[id].open(map, marker)
    info_box_opened_hc = id
    type = "hc"
  }else{
    info_box_opened_hc = -1
  }
}

function text_patient(procedure)
{
  var Sexo = (procedure.gender === "F") ? "Feminino" : "Masculino" 
  var button_label= (button_status === false)? 'Mostrar Centro de saúde':'Voltar'
  return '<strong>Local de residência do paciente</strong>' +
         '<br><strong>Data: </strong> ' + procedure.date +
         '<br><strong>Sexo: </strong>' + Sexo +
         '<br><strong>Distância percorrida: </strong>' + procedure.distance.toPrecision(4) +
         " Km<br><br><button type='button' id='cluster_info_procedure' class='btn btn-info btn-sm' onclick='procedure()'>"+button_label+"</button>"
}

function text_heathcentre(hc)
{
  var button_label= (button_status === false)? 'Mostrar pacientes':'Voltar'
  return '<strong>Estabelecimento de saúde</strong>' +
         '<br><strong>Cnes: </strong> ' + hc.cnes +
         '<br><strong>Nome: </strong> ' + hc.name +
         '<br><strong>Leitos: </strong> ' + hc.beds +
         "<br><br><button type='button' id='cluster_info_hc' class='btn btn-info btn-sm' onclick='healthcentre()'>"+button_label+"</button>"
}

function procedure()
{
  if (button_status === false) {
    setup_procedure();
    teardown_circles();
  }else{
    teardown_procedure();
  }
}

function setup_procedure()
{
  p_markers_visible(false, "procedure")
  $.ajax({
  url: "procedure/health_centres_procedure", data: {cnes: info_boxes_procedure[info_box_opened_procedure].data.cnes_id.toString()}, 
    success: function(result){
    $.each(result, function(index, health_centre){
      temporary_hc = p_create_markers(health_centre, health_centre_icon);
      temporary_hc.setVisible(true);
    });
  }});
  $('#cluster_info_procedure').text('Voltar')
  button_status = true;
}

function teardown_procedure()
{
  p_markers_visible(true);
  info_boxes_procedure[info_box_opened_procedure].close();
  if (temporary_hc != null) {
    temporary_hc.setVisible(false);
  }
  temporary_hc = null;
  info_box_opened_procedure = -1
  $('#cluster_info_procedure').text('Mostrar Centro de saúde')
  button_status = false;
}

function healthcentre()
{
  if (button_status === false){
    setup_hc();
    teardown_circles();
  }else{
    teardown_hc();
  }
}

function setTemporaryProcedures(value)
{
  for (var i = 0; i < temporary_procedures.length; i++) {
      temporary_procedures[i].setVisible(value); 
  }
}

function setup_hc()
{
  p_markers_visible(false, "hc")
  $.ajax({
  url: "procedure/procedures_by_hc", data: {cnes: info_boxes_hc[info_box_opened_hc].data.cnes.toString()}, 
    success: function(result){
    $.each(result, function(index, health_centre){
      temporary_procedures.push(p_create_markers(health_centre, person_icon));
    });
  }});
  setTemporaryProcedures(true);
  $('#cluster_info_hc').text('Voltar')
  button_status = true;
}

function teardown_hc()
{
  p_markers_visible(true);
  info_boxes_hc[info_box_opened_hc].close();
  setTemporaryProcedures(false);
  temporary_procedures = [];
  info_box_opened_hc = -1
  $('#cluster_info_hc').text('Mostrar pacientes')
  button_status = false;
}

function p_markers_visible(visibility, type)
{
   // $.each(info_boxes_procedure, function(index, info_box)
   // {
   //   if (info_box && (info_box.id !== info_box_opened_procedure || type == "hc")){
   //     info_box.marker.setVisible(visibility);
   //   }
   // });

   $.each(info_boxes_hc, function(index, info_box)
   {
     if (info_box && (info_box.id !== info_box_opened_hc || type == "hc")){
      info_box.marker.setVisible(visibility);
     }
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
      max: 10,
      step: 1,
      value: [0,10],
    });
    $("#slider_distance").on("slide", function(slideEvt) {
      $("#slider_distance_min").html(slideEvt.value[0]);
      $("#slider_distance_max").html(slideEvt.value[1] + (slideEvt.value[1] >= 10 ? "+" : ""));
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
        $(".select-health_centre").select2({
            placeholder: "Todos",
            data: result,
        });
    }});

    var cdi = [
      { id: "A00", text: "A00 - Cólera" },
      { id: "A01", text: "A01 - Febres Tifóide e Paratifóide" },
      { id: "A02", text: "A02 - Outras Infecções Por Salmonella" },
      { id: "A03", text: "A03 - Shiguelose" },
      { id: "A04", text: "A04 - Outras Infecções Intestinais Bacterianas" },
      { id: "A05", text: "A05 - Outras Intoxicações Alimentares Bacterianas, Não Classificadas em Outra Parte" },
      { id: "A06", text: "A06 - Amebíase" },
      { id: "A07", text: "A07 - Outras Doenças Intestinais Por Protozoários" },
      { id: "A08", text: "A08 - Infecções Intestinais Virais, Outras e as Não Especificadas" },
      { id: "A09", text: "A09 - Diarréia e Gastroenterite de Origem Infecciosa Presumível" },
      { id: "A15", text: "A15 - Tuberculose Respiratória, Com Confirmação Bacteriológica e Histológica" },
      { id: "A16", text: "A16 - Tuberculose Das Vias Respiratórias, Sem Confirmação Bacteriológica ou Histológica" },
      { id: "A17", text: "A17 - Tuberculose do Sistema Nervoso" },
      { id: "A18", text: "A18 - Tuberculose de Outros Órgãos" },
      { id: "A19", text: "A19 - Tuberculose Miliar" },
      { id: "A20", text: "A20 - Peste" },
      { id: "A21", text: "A21 - Tularemia" },
      { id: "A22", text: "A22 - Carbúnculo" },
      { id: "A23", text: "A23 - Brucelose" },
      { id: "A24", text: "A24 - Mormo e Melioidose" },
      { id: "A25", text: "A25 - Febres Transmitidas Por Mordedura de Rato" },
      { id: "A26", text: "A26 - Erisipelóide" },
      { id: "A27", text: "A27 - Leptospirose" },
      { id: "A28", text: "A28 - Outras Doenças Bacterianas Zoonóticas Não Classificadas em Outra Parte" },
      { id: "A30", text: "A30 - Hanseníase (doença de Hansen) (lepra)" },
      { id: "A31", text: "A31 - Infecções Devidas a Outras Micobactérias" },
      { id: "A32", text: "A32 - Listeriose (listeríase)" },
      { id: "A33", text: "A33 - Tétano do Recém-nascido (neonatal)" },
      { id: "A34", text: "A34 - Tétano Obstétrico" },
      { id: "A35", text: "A35 - Outros Tipos de Tétano" },
      { id: "A36", text: "A36 - Difteria" },
      { id: "A37", text: "A37 - Coqueluche" },
      { id: "A38", text: "A38 - Escarlatina" },
      { id: "A39", text: "A39 - Infecção Meningogócica" },
      { id: "A40", text: "A40 - Septicemia Estreptocócica" },
      { id: "A41", text: "A41 - Outras Septicemias" },
      { id: "A42", text: "A42 - Actinomicose" },
      { id: "A43", text: "A43 - Nocardiose" },
      { id: "A44", text: "A44 - Bartonelose" },
      { id: "A46", text: "A46 - Erisipela" },
      { id: "A48", text: "A48 - Outras Doenças Bacterianas Não Classificadas em Outra Parte" },
      { id: "A49", text: "A49 - Infecção Bacteriana de Localização Não Especificada" },
      { id: "A50", text: "A50 - Sífilis Congênita" },
      { id: "A51", text: "A51 - Sífilis Precoce" },
      { id: "A52", text: "A52 - Sífilis Tardia" },
      { id: "A53", text: "A53 - Outras Formas e as Não Especificadas da Sífilis" },
      { id: "A54", text: "A54 - Infecção Gonocócica" },
      { id: "A55", text: "A55 - Linfogranuloma (venéreo) Por Clamídia" },
      { id: "A56", text: "A56 - Outras Infecções Causadas Por Clamídias Transmitidas Por Via Sexual" },
      { id: "A57", text: "A57 - Cancro Mole" },
      { id: "A58", text: "A58 - Granuloma Inguinal" },
      { id: "A59", text: "A59 - Tricomoníase" },
      { id: "A60", text: "A60 - Infecções Anogenitais Pelo Vírus do Herpes (herpes Simples)" },
      { id: "A63", text: "A63 - Outras Doenças de Transmissão Predominantemente Sexual, Não Classificadas em Outra Parte" },
      { id: "A64", text: "A64 - Doenças Sexualmente Transmitidas, Não Especificadas" },
      { id: "A65", text: "A65 - Sífilis Não-venérea" },
      { id: "A66", text: "A66 - Bouba" },
      { id: "A67", text: "A67 - Pinta (carate)" },
      { id: "A68", text: "A68 - Febres Recorrentes (Borrelioses)" },
      { id: "A69", text: "A69 - Outras Infecções Por Espiroquetas" },
      { id: "A70", text: "A70 - Infecções Causadas Por Clamídia Psittaci" },
      { id: "A71", text: "A71 - Tracoma" },
      { id: "A74", text: "A74 - Outras Doenças Causadas Por Clamídias" },
      { id: "A75", text: "A75 - Tifo Exantemático" },
      { id: "A77", text: "A77 - Febre Maculosa (rickettsioses Transmitidas Por Carrapatos)" },
      { id: "A78", text: "A78 - Febre Q" },
      { id: "A79", text: "A79 - Outras Rickettsioses" },
      { id: "A80", text: "A80 - Poliomielite Aguda" },
      { id: "A81", text: "A81 - Infecções Por Vírus Atípicos do Sistema Nervoso Central" },
      { id: "A82", text: "A82 - Raiva" },
      { id: "A83", text: "A83 - Encefalite Por Vírus Transmitidos Por Mosquitos" },
      { id: "A84", text: "A84 - Encefalite Por Vírus Transmitido Por Carrapatos" },
      { id: "A85", text: "A85 - Outras Encefalites Virais, Não Classificadas em Outra Parte" },
      { id: "A86", text: "A86 - Encefalite Viral, Não Especificada" },
      { id: "A87", text: "A87 - Meningite Viral" },
      { id: "A88", text: "A88 - Outras Infecções Virais do Sistema Nervoso Central Não Classificadas em Outra Parte" },
      { id: "A89", text: "A89 - Infecções Virais Não Especificadas do Sistema Nervoso Central" },
      { id: "A90", text: "A90 - Dengue (dengue Clássico)" },
      { id: "A91", text: "A91 - Febre Hemorrágica Devida ao Vírus do Dengue" },
      { id: "A92", text: "A92 - Outras Febres Virais Transmitidas Por Mosquitos" },
      { id: "A93", text: "A93 - Outras Febres Por Vírus Transmitidas Por Artrópodes Não Classificadas em Outra Parte" },
      { id: "A94", text: "A94 - Febre Viral Transmitida Por Artrópodes, Não Especificada" },
      { id: "A95", text: "A95 - Febre Amarela" },
      { id: "A96", text: "A96 - Febre Hemorrágica Por Arenavírus" },
      { id: "A98", text: "A98 - Outras Febres Hemorrágicas Por Vírus, Não Classificadas em Outra Parte" },
      { id: "A99", text: "A99 - Febres Hemorrágicas Virais Não Especificadas" }, 
      { id: "B00", text: "B00 - Infecções Pelo Vírus do Herpes (herpes Simples)" },
      { id: "B01", text: "B01 - Varicela (Catapora)" },
      { id: "B02", text: "B02 - Herpes Zoster (Zona)" },
      { id: "B03", text: "B03 - Varíola" },
      { id: "B04", text: "B04 - Varíola Dos Macacos (Monkeypox)" },
      { id: "B05", text: "B05 - Sarampo" },
      { id: "B06", text: "B06 - Rubéola" },
      { id: "B07", text: "B07 - Verrugas de Origem Viral" },
      { id: "B08", text: "B08 - Outras Infecções Virais Caracterizadas Por Lesões da Pele e Das Membranas Mucosas, Não Classificadas em Outra Parte" },
      { id: "B09", text: "B09 - Infecção Viral Não Especificada Caracterizada Por Lesões da Pele e Membranas Mucosas" },
      { id: "B15", text: "B15 - Hepatite Aguda A" },
      { id: "B16", text: "B16 - Hepatite Aguda B" },
      { id: "B17", text: "B17 - Outras Hepatites Virais Agudas" },
      { id: "B18", text: "B18 - Hepatite Viral Crônica" },
      { id: "B19", text: "B19 - Hepatite Viral Não Especificada" },
      { id: "B20", text: "B20 - Doença Pelo Vírus da Imunodeficiência Humana (HIV), Resultando em Doenças Infecciosas e Parasitárias" },
      { id: "B21", text: "B21 - Doença Pelo Vírus da Imunodeficiência Humana (HIV), Resultando em Neoplasias Malignas" },
      { id: "B22", text: "B22 - Doença Pelo Vírus da Imunodeficiência Humana (HIV) Resultando em Outras Doenças Especificadas" },
      { id: "B23", text: "B23 - Doença Pelo Vírus da Imunodeficiência Humana (HIV) Resultando em Outras Doenças" },
      { id: "B24", text: "B24 - Doença Pelo Vírus da Imunodeficiência Humana (HIV) Não Especificada" },
      { id: "B25", text: "B25 - Doença Por Citomegalovírus" },
      { id: "B26", text: "B26 - Caxumba (Parotidite Epidêmica)" },
      { id: "B27", text: "B27 - Mononucleose Infecciosa" },
      { id: "B30", text: "B30 - Conjuntivite Viral" },
      { id: "B33", text: "B33 - Outras Doenças Por Vírus Não Classificada em Outra Parte" },
      { id: "B34", text: "B34 - Doenças Por Vírus, de Localização Não Especificada" },
      { id: "B35", text: "B35 - Dermatofitose" },
      { id: "B36", text: "B36 - Outras Micoses Superficiais" },
      { id: "B37", text: "B37 - Candidíase" },
      { id: "B38", text: "B38 - Coccidioidomicose" },
      { id: "B39", text: "B39 - Histoplasmose" },
      { id: "B40", text: "B40 - Blastomicose" },
      { id: "B41", text: "B41 - Paracoccidioidomicose" },
      { id: "B42", text: "B42 - Esporotricose" },
      { id: "B43", text: "B43 - Cromomicose e Abscesso Feomicótico" },
      { id: "B44", text: "B44 - Aspergilose" },
      { id: "B45", text: "B45 - Criptococose" },
      { id: "B46", text: "B46 - Zigomicose" },
      { id: "B47", text: "B47 - Micetoma" },
      { id: "B48", text: "B48 - Outras Micoses, Não Classificadas em Outra Parte" },
      { id: "B49", text: "B49 - Micose Não Especificada" },
      { id: "B50", text: "B50 - Malária Por Plasmodium Falciparum" },
      { id: "B51", text: "B51 - Malária Por Plasmodium Vivax" },
      { id: "B52", text: "B52 - Malária Por Plasmodium Malariae" },
      { id: "B53", text: "B53 - Outras Formas de Malária Confirmadas Por Exames Parasitológicos" },
      { id: "B54", text: "B54 - Malária Não Especificada" },
      { id: "B55", text: "B55 - Leishmaniose" },
      { id: "B56", text: "B56 - Tripanossomíase Africana" },
      { id: "B57", text: "B57 - Doença de Chagas" },
      { id: "B58", text: "B58 - Toxoplasmose" },
      { id: "B59", text: "B59 - Pneumocistose" },
      { id: "B60", text: "B60 - Outras Doenças Devidas a Protozoários, Não Classificadas em Outra Parte" },
      { id: "B64", text: "B64 - Doença Não Especificada Devida a Protozoários" },
      { id: "B65", text: "B65 - Esquistossomose (bilharziose) (Schistosomíase)" },
      { id: "B66", text: "B66 - Outras Infestações Por Trematódeos" },
      { id: "B67", text: "B67 - Equinococose" },
      { id: "B68", text: "B68 - Infestação Por Taenia" },
      { id: "B69", text: "B69 - Cisticercose" },
      { id: "B70", text: "B70 - Difilobotríase e Esparganose" },
      { id: "B71", text: "B71 - Outras Infestações Por Cestóides" },
      { id: "B72", text: "B72 - Dracontíase" },
      { id: "B73", text: "B73 - Oncocercose" },
      { id: "B74", text: "B74 - Filariose" },
      { id: "B75", text: "B75 - Triquinose" },
      { id: "B76", text: "B76 - Ancilostomíase" },
      { id: "B77", text: "B77 - Ascaridíase" },
      { id: "B78", text: "B78 - Estrongiloidíase" },
      { id: "B79", text: "B79 - Tricuríase" },
      { id: "B80", text: "B80 - Oxiuríase" },
      { id: "B81", text: "B81 - Outras Helmintíases Intestinais, Não Classificadas em Outra Parte" },
      { id: "B82", text: "B82 - Parasitose Intestinal Não Especificada" },
      { id: "B83", text: "B83 - Outras Helmintíases" },
      { id: "B85", text: "B85 - Pediculose e Ftiríase" },
      { id: "B86", text: "B86 - Escabiose (sarna)" },
      { id: "B87", text: "B87 - Miíase" },
      { id: "B88", text: "B88 - Outras Infestações" },
      { id: "B89", text: "B89 - Doença Parasitária Não Especificada" },
      { id: "B90", text: "B90 - Seqüelas de Tuberculose" },
      { id: "B91", text: "B91 - Seqüelas de Poliomielite" },
      { id: "B92", text: "B92 - Seqüelas de Hanseníase (lepra)" },
      { id: "B94", text: "B94 - Seqüelas de Outras Doenças Infecciosas e Parasitárias e Das Não Especificadas" },
      { id: "B95", text: "B95 - Estreptococos e Estafilococos Como Causa de Doenças Classificadas em Outros Capítulos" },
      { id: "B96", text: "B96 - Outros Agentes Bacterianos, Como Causa de Doenças Classificadas em Outros Capítulos" },
      { id: "B97", text: "B97 - Vírus Como Causa de Doenças Classificadas em Outros Capítulos" },
      { id: "B99", text: "B99 - Doenças Infecciosas, Outras e as Não Especificadas" },
    ];

    $(".select-cdi").select2({
      placeholder: "Todas",
      allowClear: true,
      data: cdi,
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
