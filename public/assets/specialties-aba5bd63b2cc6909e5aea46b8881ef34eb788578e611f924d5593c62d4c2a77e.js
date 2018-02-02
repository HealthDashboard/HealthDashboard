$(document).ready(function(){
  google.charts.load("current", {packages:["corechart"]});
})

var types_color = {
 "Ambulatorios Especializados":'#003300',
 "Apoio Diagnostico":'#15ff00',
 "Saúde Mental":'#ff0000',
 "Vigilancia Em Saúde":"#f5b979",
 "UBS":"#13f1e8",
 "Urgência/Emergência":"#615ac7",
 "Hospital":"#8e3a06",
 "Unidades DST/AIDS":"#b769ab",
 "Outros Estabelecimentos E Serviços Especializados": "#df10eb"
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
 "Cirurgia",
 "Obstetrícia",
 "Clínica Médica",
 "Cuidados Prolongados",
 "Psiquiatria",
 "Tisiologia",
 "Pediatria",
 "Reabilitação",
 "Psiquiatria Em Hospital-Dia"
]

var types_name = [
 "Ambulatorios Especializados",
 "Apoio Diagnostico",
 "Saúde Mental",
 "Vigilancia Em Saúde",
 "UBS",
 "Urgência/Emergência",
 "Hospital",
 "Unidades DST/AIDS",
 "Outros Estabelecimentos E Serviços Especializados"
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
    titleTextStyle: {fontSize: 25, bold: false },
    bar: {groupWidth: "80%"},
    legend: { position: 'none' },
    chartArea: {
   top: 55,
   left: 150 },
    vAxis: { textStyle:  {fontSize: 14,bold: false}},
    hAxis: { textStyle:  {fontSize: 18,bold: false}}
  };

  formated_specialty = {}
  $.each(specialty, function(index, data) {
      if(types_name[index] != undefined)
        formated_specialty[types_name[index]] = data
  });

 draw_chart(header, formated_specialty, chart, options, types_color)
}
;
