$(document).ready(function() {
    google.charts.load("current", {packages:["corechart"]});
});

var specialties_color = {
 "CIRURGIA":'#003300',
 "OBSTETRÍCIA":'#15FF00',
 "CLINICA MÉDICA":'#FF0000',
 "CUIDADOS PROLONGADOS":"#F5B979",
 "PSIQUIATRIA":"#13F1E8",
 "TISIOLOGIA":"#615AC7",
 "PEDIATRIA":"#8E3A06",
 "REABILITAÇÃO":"#B769AB",
 "PSIQUIATRIA EM HOSPITAL-DIA": "#DF10EB"
}

var dashboard_legend_clicked = false;

function init_dashboard_chart() {
    google.charts.setOnLoadCallback(create_dashboard_charts);
    dashboard_legend();
    animate_legend();
}

function animate_legend() {
    $dashboard = $("#dashboard_legend");
    $arrow = $("#dashboard_legend .glyphicon-chevron-up");
    $("#dashboard_legend .dashboard-header").click(function() {
        var options = {}
        if (!dashboard_legend_clicked) {
            options = {top: '-=200px'};
            dashboard_legend_clicked = true;
            $arrow.addClass('glyphicon-chevron-down');
            $arrow.removeClass('glyphicon-chevron-up');
        } else {
            options = {top: '+=200px'};
            dashboard_legend_clicked = false;
            $arrow.addClass('glyphicon-chevron-up');
            $arrow.removeClass('glyphicon-chevron-down');
        }
        $dashboard.animate(options);
    });
}

function create_dashboard_charts() {
    create_procedures_per_specialties();
    create_specialties_distance_between_patients_hospital();
    populate_procedures_by_date();
}

function create_procedures_per_specialties() {
    var header = ["Especialidades", "Número de Internações", {role: "style" }]
    var chart = new google.visualization.PieChart(document.getElementById("chart_specialties"));

    var options = {
        title:'% de Internações por especialidades',
        slices: get_color_slice()
    };

    var specialty_path = "specialties_count"
    $.getJSON(specialty_path, function(data) {
        draw_chart(header, data, chart, options, specialties_color);
    });
}


function populate_procedures_by_date() {
    var path = "/procedures_by_date.json";

    var options = {
        title: 'Número de internações por mês',
        series: {
         0: {axis: 'Número de internações'}
        },
        axes: {
         y: {
           Temps: {label: 'Número de internações'}
         }
        },
        legend: {position: 'none'}
    };

    $.getJSON(path, function(data) {
        var values = [];
        $.each(data, function(k,v) {
          values.push([new Date(v[0],v[1]), v[2]]);
        })
        create_line_chart(values, options);
    });
}

function create_line_chart(values, options) {
    var chart = new google.visualization.LineChart(document.getElementById('procedure_by_date'));
    var data = new google.visualization.DataTable();
    data.addColumn('date', 'Mês');
    data.addColumn('number', "Número de Internações");
    data.addRows(values);
    chart.draw(data, options);
}


function create_travel_time_chart() {
    var chart = new google.visualization.BarChart(document.getElementById("chart_spec_time_average"));
    var header = ["Especialidades", "Tempo médio de viagem em minutos", {role: "style"}]
    var options = {
        title: "Tempo médio de viagem para realização de Internações por especialidade",
        legend: {position: 'none'}
    };

    var distance_average_path = '/procedures_travel_time.json';
    $.getJSON(distance_average_path, function(data) {
        draw_chart(header, data, chart, options, specialties_color);
    });
}

function get_color_slice() {
    var slices = {};
    var idx = 0;
    $.each(specialties_color, function(data, value) {
        slices[idx++] = {color: value};
    });
    return slices;
}

function create_specialties_vs_time_to_arrive() {
    var header = ["Especialidades", "Número de Internações", {role: "style"}];
    var chart = new google.visualization.PieChart(document.getElementById("chart_specialties"));

    var options = {
        slices: get_color_slice(),
        legend: {position: 'none'}
    };

    var specialty_path = ""
    $.getJSON(specialty_path, function(data) {
        draw_chart(header, data, chart, options, specialties_color);
    });
}

function create_specialties_distance_between_patients_hospital() {
    var chart = new google.visualization.BarChart(document.getElementById("chart_spec_distance_average"));
    var header = ["Especialidades", "Distância média em km", {role: "style"}]
    var options = {
        title: "Distância média por especialidade",
        legend: {position: 'none'},
        chartArea: {
            top: 55,
            left: 250 },
        vAxis: { textStyle:  {fontSize: 14,bold: false}},
        titleTextStyle: {fontSize: 20, bold: true }
    };

    var distance_average_path = 'specialties_procedure_distance_average'
    $.getJSON(distance_average_path, function(data) {
        draw_chart(header, data, chart, options, specialties_color);
    });
}

function draw_chart(header, data, chart, options, color) {
    if (color == null) {
        color = specialties_color;
    }
    var values = [];
    $.each(data, function(name, number) {
        values.push([name, parseFloat(number), color[name]]);
    });

    values.unshift(header)
    var data_table = google.visualization.arrayToDataTable(values);
    var view = new google.visualization.DataView(data_table);

    view.setColumns([0, 1, {calc: "stringify", sourceColumn: 1, type: "string", role: "annotation"}, 2]);
    chart.draw(view, options);
}

function dashboard_legend() {
    text = ""
    dashboard = $('#dashboard_legend .list')
    $.each(specialties_color, function(name, color) {
        dashboard.append("<li><span style='background-color: "+color+";'></span> "+name.toLowerCase()+"</li>");
    });
}

function update_rank() {
    $.getJSON('/rank_health_centres.json', create_table_rank);
}

function create_table_rank(data) {
    rank_table = $('.health_centres_rank tbody');

    rows = "";
    index = 1;

    $.each(data, function(name, n_procedures) {
        if (index % 2) {
            rows += "<tr class='bg-success'>"
        } else {
            rows += "<tr>"
        }
        rows += " <th scope=\"row\">" + (index++) + "</th><td>" + name + "</td> <td>" + n_procedures + "</td></tr>"
    });
    rank_table.html(rows);
}
