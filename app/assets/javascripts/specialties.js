$(document).ready(function(){
  google.charts.load("current", {packages:["corechart"]});
})

var types_color = {
 "1":'#003300',
 "2":'#15ff00',
 "3":'#ff0000',
 "4":"#f5b979",
 "5":"#13f1e8",
 "6":"#615ac7",
 "7":"#8e3a06",
 "8":"#b769ab",
 "9": "#df10eb"
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
 "CIRURGIA",
 "OBSTETRECIA",
 "CLINICA MEDIA",
 "PACIENTES",
 "PSIQUIATRIA",
 "TISIOLOGIA",
 "PEDIATRIA",
 "REABILITACAO",
 "PSIQUIATRIA EM HOSPITAL DIA"
]

function init_specialties_chart(){
  google.charts.setOnLoadCallback(create_specialties_charts);
}

function create_specialties_charts() {
 specialties_metric = $.getJSON('/specialties_metric.json', function(specialties) {
   $.each(specialties, function(index, specialty) {
     create_specialty_chart(index, specialty)
   });
 });
}

function create_specialty_chart(index, specialty){
  var header = ["Tipos de estabelecimentos", "Distância Média Percorrida", { role: "style" } ]
  var chart = new google.visualization.BarChart(document.getElementById(specialty_divs[index]));
  var options = {
    title: specialties_name[index],
    vAxis: { textPosition: 'none' },
    legend: { position: 'none' },
  };

 draw_chart(header, specialty, chart, options, types_color)
}
