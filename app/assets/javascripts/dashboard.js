console.log('dashboard')

$(document).ready(function(){
  google.charts.load("current", {packages:["corechart"]});
})

var specialties_color = {
 "CIRURGIA":'#003300',
 "OBSTETRECIA":'#15ff00',
 "CLINICA MEDICA":'#ff0000',
 "PACIENTES SOB CUIDADOS PROLONGADOS":"#f5b979",
 "PSIQUIATRIA":"#13f1e8",
 "TISIOLOGIA":"#615ac7",
 "PEDIATRIA":"#8e3a06",
 "REABILITACAO":"#b769ab",
 "PSIQUIATRIA EM HOSPITAL DIA": "#df10eb"
}

function init_dashboard_chart(){
  google.charts.setOnLoadCallback(create_dashboard_charts);
}

function create_dashboard_charts() {
 create_procedures_per_specialties()
 create_specialties_distance_between_patients_hospital()
}

function create_procedures_per_specialties() {
  var header = ["Especialidades", "Número de Procedimentos", { role: "style" } ]
  var chart = new google.visualization.PieChart(document.getElementById("chart_specialties"));

  var options = {
    slices: get_color_slice(),
    legend: { position: 'none' },
  };

  var specialty_path = "specialties_count"
  $.getJSON(specialty_path, function(data){ draw_chart(header, data, chart, options) });
}

function get_color_slice(){
  var slices= {}
  var idx = 0;
  $.each(specialties_color, function(data, value){ slices[idx++] = { color: value} });
  return slices
}

function create_specialties_vs_time_to_arrive() {
  var header = ["Especialidades", "Número de Procedimentos", { role: "style" } ]
  var chart = new google.visualization.PieChart(document.getElementById("chart_specialties"));

  var options = {
    slices: get_color_slice(),
    legend: { position: 'none' },
  };

  var specialty_path = ""
  $.getJSON(specialty_path, function(data){ draw_chart(header, data, chart, options) });
}

function create_specialties_distance_between_patients_hospital() {
  var header = ["Especialidades", "Distância Média Percorrida", { role: "style" } ]
  var chart = new google.visualization.BarChart(document.getElementById("chart_spec_distance_average"));
  var options = {
    vAxis: { textPosition: 'none' },
    legend: { position: 'none' },
  };
  var distance_average_path = 'specialties_procedure_distance_average'
  $.getJSON(distance_average_path, function(data){ draw_chart(header, data, chart, options)});
}


function draw_chart(header, data, chart, options){
  var values = []
  $.each(data, function(name, number)
  {
    values.push([name, parseFloat(number), specialties_color[name]])
  });

  values.unshift(header)
  var data = google.visualization.arrayToDataTable(values);

  var view = new google.visualization.DataView(data);

  view.setColumns([0, 1,
                  { calc: "stringify",
                      sourceColumn: 1,
                      type: "string",
                      role: "annotation" },
                  2]);
  chart.draw(view, options);
}
