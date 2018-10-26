$(document).ready(function() {
    google.charts.load('current', {'packages':["corechart"], 'language':'pt'});
});

var specialties_color = {
 "CIRURGIA":'#587C7C',
 "OBSTETRÍCIA":'#013F5E',
 "CLINICA MÉDICA":'#007C84',
 "CUIDADOS PROLONGADOS":"#BBE0CE",
 "PSIQUIATRIA":"#9EA615",
 "TISIOLOGIA":"#E8D666",
 "PEDIATRIA":"#FEDCC1",
 "REABILITAÇÃO":"#F7A08C",
 "PSIQUIATRIA EM HOSPITAL-DIA": "#F1573F"
}

var filters_print = ["Estabelecimento de ocorrência", "Competência (aaaamm)", "Especialidade do leito", 
"Caráter do atendimento", "Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", 
"Diagnóstico secundário 2 (CID-10)",  "Complexidade", "Tipo de Financiamento", "Faixa etária", "Raça/Cor", "Nível de instrução", 
"Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", 
"Gestão", "Total geral de diárias", "Diárias UTI", "Diárias UI", "Dias de permanência", "Valor da parcela"];


var dynamic = false;
var data = null;
var dashboard_legend_clicked = false;
var filters_text = null;
var start_date = null;
var end_date = null;
var genders = null;

function init_dashboard_chart() {
    dynamic = false;
    dashboard_legend_clicked = false;
    if (window._data_filters != null && window._data_filters != []) {
        dynamic = true;
        data = window._data_filters;
        filters_text = window._filters_text;
        start_date = window._start_date;
        end_date = window._end_date;
        genders = window._genders;
        var element = document.getElementById("avarage_distance_div").style.display = "none";
        window._data_filters = null;
        window._filters_text = null;
        window._start_date = null;
        window._end_date = null;
        window._genders = null;

        filters_show();

    } else {
        dynamic = false;
        document.getElementById("filters-div").style.display = "none";

    }
    google.charts.setOnLoadCallback(create_dashboard_charts);
    dashboard_legend();
    animate_legend();
}

function filters_show(){
    var filters_div_text = "";
    $.each(filters_print, function(index, value) {
        if (filters_text[index] != null && filters_text[index] != "") {
            filters_div_text = filters_div_text.concat("<br /><strong>" + value + ": </strong>" + filters_text[index]);
        }
    });
    if (genders[0] != null) {
        filters_div_text = filters_div_text.concat("<br /><strong>Sexo:</strong> " + genders.join(", "));
    }
    if (start_date != null && start_date != "") {
        filters_div_text = filters_div_text.concat("<br /><strong>Data mínima:</strong> " + start_date);
    }
    if (end_date != null && end_date != "") {
        filters_div_text = filters_div_text.concat("<br /><strong>Data máxima:</strong> " + end_date);
    }
    if (dist_min != null) {
        filters_div_text = filters_div_text.concat("<br /><strong>Distância mínima:</strong> " + dist_min);
    }
    if (dist_max != null) {
        filters_div_text = filters_div_text.concat("<br /><strong>Distância máxima:</strong> " + dist_max);
    }
    filters_div_text = filters_div_text.concat("<br/><br/>");
    document.getElementById("filters-text").innerHTML = filters_div_text;
}

function create_dashboard_charts() {
    $.getJSON("procedure/proceduresVariables", data, function(loaded) {
        result = loaded;
        create_one_variable_graph(result["cmpt"]);
    });
    create_proceduresPerSpecialties();
    create_specialties_distance_between_patients_hospital();
    create_analise();
    populate_procedures_by_date();
    create_specialties_total();
    update_rank();
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

function create_proceduresPerSpecialties() {
    var header = ["Especialidades", "Número de Internações", {role: "style" }]
    var chart = new google.visualization.PieChart(document.getElementById("chart_specialties"));

    var options = {
        title:'Porcentagem de Internações por especialidades',
        slices: get_color_slice()
    };

    if (dynamic == false) {
        var specialty_path = "specialties_count"
    } else {
        var specialty_path = "/procedure/proceduresPerSpecialties"
    }
    $.getJSON(specialty_path, data, function(result) {
        draw_chart(header, result, chart, options, specialties_color);
    });
}

function create_specialties_distance_between_patients_hospital() {
    var chart = new google.visualization.BarChart(document.getElementById("chart_spec_distance_average"));
    var header = ["Especialidades", "Distância média(Km)", {role: "style"}]
    var options = {
        title: "Distância média por especialidade (Km)",
        legend: {position: 'none'},
        chartArea: {
            top: 55,
            left: 250 },
        vAxis: { textStyle:  {fontSize: 14,bold: false}},
        titleTextStyle: {fontSize: 20, bold: true }
    };
    if (dynamic == false) {
        var distance_average_path = 'specialties_procedure_distance_average'
    } else {
        var distance_average_path = '/procedure/proceduresDistance'
    }
    $.getJSON(distance_average_path, data, function(result) {
        draw_chart(header, result, chart, options, specialties_color);
    });
}

function create_analise() {
    var header = ["Especialidades", "Número de Internações", {role: "style" }]
    var chart = new google.visualization.PieChart(document.getElementById("chart_div_analise"));

    var options = {
        // title:'Porcentagem de Internações por distância percorrida',
        width: 550,
        height: 550,
        colors: ["#B9D8C2", "#84C8C2", "#2066A9", "#19407F"],
    };
    if (dynamic == false) {
        var path = '/distance_metric.json'
    } else {
        var path = 'procedure/proceduresDistanceGroup'
    }
    $.getJSON(path, data,function(result) {
        draw_chart(header, result, chart, options, specialties_color);
    });
}

function populate_procedures_by_date() {
    if (dynamic == false) {
        var path = "/procedures_by_date.json";
    } else {
        var path = "/procedure/proceduresPerMonth"
    }

    var options = {
        width: '100%',
        height:'100%',
        title: 'Número de internações por mês',
        series: {
         0: {axis: 'Número de internações'}
        },
        axes: {
         y: {
           Temps: {label: 'Número de internações'}
         }
        },
        legend: {position: 'none'},
        backgroundColor: { fill:'transparent'}
    };

    $.getJSON(path, data, function(result) {
        var values = [];
        $.each(result, function(k,v) {
          values.push([new Date(v[0] + "T00:00:00"), v[1]]); // Fix timezone problem
        });
        create_line_chart(values, options);
    });
}

function create_specialties_total() {
    var chart = new google.visualization.BarChart(document.getElementById("chart_spec_total"));
    var header = ["Especialidades", "Total de Internações", {role: "style"}]
    var options = {
        title: "Total de internações hospitalares",
        legend: {position: 'none'},
        chartArea: {
            top: 55,
            left: 250 },
        vAxis: { textStyle:  {fontSize: 14,bold: false}},
        titleTextStyle: {fontSize: 20, bold: true }
    };

    if (dynamic == false) {
        var distance_average_path = 'specialties_count'
    } else {
        var distance_average_path = '/procedure/proceduresPerSpecialties'
    }

    $.getJSON(distance_average_path, data, function(result) {
        draw_chart(header, result, chart, options, specialties_color);
    });
}

function create_line_chart(values, options) {
    var chart = new google.visualization.LineChart(document.getElementById('procedure_by_date'));
    var table = new google.visualization.DataTable();
    table.addColumn('date', 'Mês');
    table.addColumn('number', "Número de Internações");
    table.addRows(values);
    chart.draw(table, options);
}

function get_color_slice() {
    var slices = {};
    var idx = 0;
    $.each(specialties_color, function(result, value) {
        slices[idx++] = {color: value};
    });
    return slices;
}

function draw_chart(header, result, chart, options, color) {
    if (color == null) {
        color = specialties_color;
    }
    var values = [];
    $.each(result, function(name, number) {
        values.push([name, parseFloat(number.toFixed(1)), color[name]]);
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
    if (dynamic == false) {
        $.getJSON('/rank_health_centres.json', create_table_rank);
    } else {
        $.getJSON('/procedure/proceduresPerHealthCentre', data, create_table_rank);
    }
}

function create_table_rank(result) {
    rank_table = $('.health_centres_rank tbody');

    rows = "";
    index = 1;
    Total = 0;

    $.each(result, function(name, n_procedures) {
        if (index % 2) {
            rows += "<tr class='bg-success'>"
        } else {
            rows += "<tr>"
        }
        rows += " <th scope=\"row\">" + (index++) + "</th><td>" + name + "</td> <td>" + n_procedures.toLocaleString('pt-BR') + "</td></tr>"
            Total += n_procedures
    });
    rows += " <th scope=\"row\">#</th><td> TOTAL </td> <td>" + Total.toLocaleString('pt-BR') + "</td></tr>"
    rank_table.html(rows);
}

function create_one_variable_graph(data){
    var formatData = [];
    formatData.push(['score', 'amount', 'variable']);
    var max = 0;
    for(var i=0; i<data.length; i++){
        if(data[i][1] != null && data[i][0] != null){
            formatData.push([data[i][1], data[i][1], data[i][0].toString()]);
            max = Math.max(max, data[i][1]);
        }
    }
    var option = {
        dataset: {
            source: formatData,
        },
        //title: 'Title',
        tooltip : {
            trigger: 'axis',
            axisPointer : {            
                type : 'shadow'      
            }
        },
        grid: {containLabel: true},
        xAxis: {name: 'Procedimentos'},
        yAxis: {type: 'category'},
        visualMap: {
            orient: 'horizontal',
            left: 'center',
            min: 0,
            max: max,
            text: ['Máximo', 'Mínimo'],
            // Map the score column to color
            dimension: 0,
            inRange: {
                color: ['#D7DA8B', '#E15457']
            }
        },
        series: [
            {
                type: 'bar',
                encode: {
                    // Map the "amount" column to X axis.
                    x: 'amount',
                    // Map the "product" column to Y axis
                    y: 'variable',
                }
            }
        ]
    };
    myChart.setOption(option);
}

function changeChart(){
    const field = document.getElementById("select-chart").value;
    create_one_variable_graph(result[field]);
}