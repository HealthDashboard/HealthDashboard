$(document).ready(function(){
  google.charts.load("current", {packages:["corechart"]});
})

var types_color = {
 "AMBULATORIOS ESPECIALIZADOS":'#003300',
 "APOIO DIAGNOSTICO":'#15ff00',
 "SAUDE MENTAL":'#ff0000',
 "VIGILANCIA EM SAUDE":"#f5b979",
 "UBS":"#13f1e8",
 "URGENCIA/ EMERGENCIA":"#615ac7",
 "HOSPITAL":"#8e3a06",
 "UNIDADES DST/AIDS":"#b769ab",
 "OUTROS ESTABELECIMENTOS E SERVIÇOS ESPECIALIZADOS": "#df10eb"
}

var specialty_divs = [
 "chart_dummy",
 "chart_cirurgia",
 "chart_obstetrecia",
 "chart_clinica_medica",
 "chart_pacientes",
 "chart_psiquiatria",
 "chart_tisiologia",
 "chart_pediatria",
 "chart_reabilitacao",
 "chart_psiquiatria_dia"
]

var specialties_name = [
 "DUMMY",
 "CIRURGIA",
 "OBSTETRÍCIA",
 "CLÍNICA MÉDICA",
 "PACIENTES SOB CUIDADOS PROLONGADOS",
 "PSIQUIATRIA",
 "TISIOLOGIA",
 "PEDIATRIA",
 "REABILITAÇÃO",
 "PSIQUIATRIA EM HOSPITAL DIA"
]

var types_name = [
 "AMBULATORIOS ESPECIALIZADOS",
 "APOIO DIAGNOSTICO",
 "SAUDE MENTAL",
 "VIGILANCIA EM SAUDE",
 "UBS",
 "URGENCIA/ EMERGENCIA",
 "HOSPITAL",
 "UNIDADES DST/AIDS",
 "OUTROS ESTABELECIMENTOS E SERVIÇOS ESPECIALIZADOS"
]

function init_specialties_chart(){
  google.charts.setOnLoadCallback(create_specialties_charts);
}

function create_specialties_charts() {
 specialties_metric = $.getJSON('/specialties_metric.json', function(specialties) {
   $.each(specialties, create_specialty_chart);
 });
}

function create_specialty_chart(index, specialty){
  var header = ["Tipos de estabelecimentos", "Distância Média Percorrida em km", { role: "style" } ]
  var chart = new google.visualization.BarChart(document.getElementById(specialty_divs[index]));
  var options = {
    title: specialties_name[index],
    legend: { position: 'none' },
  };

  formated_specialty = {}
  $.each(specialty, function(index, data) {
      if(types_name[index] != undefined)
        formated_specialty[types_name[index]] = data
  });

 draw_chart(header, formated_specialty, chart, options, types_color)
}
