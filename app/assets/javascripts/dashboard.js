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
  dashboard_legend()
  animate_legend()
}

var dashboard_legend_clicked = false;
function animate_legend(){
  $dashboard = $("#dashboard_legend")
  $arrow = $("#dashboard_legend .glyphicon-chevron-up")
  $("#dashboard_legend .dashboard-header").click(function(){
    var options = {}
    if (!dashboard_legend_clicked){
      options = {top: '-=200px'}
      dashboard_legend_clicked = true
      $arrow.addClass('glyphicon-chevron-down')
      $arrow.removeClass('glyphicon-chevron-up')
    }else{
      options = {top: '+=200px'}
      dashboard_legend_clicked = false
      $arrow.addClass('glyphicon-chevron-up')
      $arrow.removeClass('glyphicon-chevron-down')
    }
    $dashboard.animate(options);
  });
}

function create_dashboard_charts() {
 create_procedures_per_specialties()
 create_specialties_distance_between_patients_hospital()
}

function create_procedures_per_specialties() {
  var header = ["Especialidades", "Número de Procedimentos", { role: "style" } ]
  var chart = new google.visualization.PieChart(document.getElementById("chart_specialties"));

  var options = {
    title:'% de procedimentos por especialidades',
    slices: get_color_slice(),
    legend: { position: 'none' },
    is3D: true,
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
    title: "Distância média de procedimentos por especialidade",
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

function dashboard_legend(){
  text = ""
  dashboard = $('#dashboard_legend p')
  $.each(specialties_color, function(name, color){
    dashboard.append('<div style="float: left;background:'+color+';width:20px; height: 20px;margin-left: 2px;margin-right: 20px;"></div><div class="pull-left">'+name+'</div><br>')
  });
}



function update_rank(){
  $.getJSON('rank_health_centres', create_table_rank);
}

function create_table_rank(data){
  rank_table = $('.health_centres_rank tbody')

  rows = ""
  index = 1
  $.each(data, function(name, n_procedures){
   if (index%2){
    rows += "<tr class='bg-success'>"
   }else{
    rows += "<tr>"
   }
   rows += " <th scope=\"row\">"+(index++)+"</th><td>"+name+"</td> <td>"+n_procedures+"</td></tr>"
  })
  rank_table.html(rows)
}
