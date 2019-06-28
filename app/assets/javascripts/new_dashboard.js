var filters = null;
var filtered_data = null;

function init_dashboard_sections() {

    // Get the filters
    if (window._data_filters != null && window._data_filters != []) {
        filters = window._data_filters;       
    }

    // Get filtered data
    if(filters === null) {
        $.ajax({
            url: "variables_metric.json",
            dataType: 'json',
            async: false,
            data: filters,
            success: function(loaded) {
                filtered_data = loaded;
            }
        });
    }
    else {
        $.ajax({
            url: "procedure/proceduresVariables",
            dataType: 'json',
            async: false,
            data: filters,
            success: function(loaded) {
                filtered_data = loaded;
            }
        });
    }

    // Set vars to the first section informations
    if (filters) { 
        start_date = JSON.parse(filters.data).start_date;
        end_date = JSON.parse(filters.data).end_date;
    }
    else start_date = "";
    if (start_date == "") document.getElementById("data-filtro").parentElement.className += " hidden";;
    count = filtered_data.gender.reduce((sum, item) => sum + item[1], 0);
    region = ""
    if (filtered_data.CRS.length == 0) document.getElementById("territorio-filtro").parentElement.className += " hidden";
    else if (filtered_data.CRS.length == 6) document.getElementById("territorio-filtro").parentElement.className += " hidden";
    else region = "CRS " + filtered_data.CRS[0][0];
    for (var i = 1; i < filtered_data.CRS.length-1; i++) region += ", "+ filtered_data.CRS[i][0];
    region += " e "+ filtered_data.CRS[filtered_data.CRS.length-1][0];
    gender = ""
    if (filtered_data.gender.length == 1) gender = filtered_data.gender[0][0];
    else document.getElementById("sexo-filtro").parentElement.className += " hidden";
    age = ""
    if (filtered_data.age_code.length == 1) age = filtered_data.age_code[0][0];
    else document.getElementById("idade-filtro").parentElement.className += " hidden";
    treatment_type = ""
    if (filtered_data.treatment_type.length == 1) treatment_type = filtered_data.treatment_type[0][0];
    else document.getElementById("carater-filtro").parentElement.className += " hidden";


    // Load first section informations (using the filtered data)
    document.getElementById("data-filtro").innerHTML = start_date + " à " + end_date;
    document.getElementById("total-filtro").innerHTML = count;
    document.getElementById("territorio-filtro").innerHTML = region;
    document.getElementById("sexo-filtro").innerHTML = gender;
    document.getElementById("idade-filtro").innerHTML = age;
    document.getElementById("carater-filtro").innerHTML = treatment_type;

    update_rank();
}

//Ranking
function update_rank() {
    if (filters == null) {
        $.getJSON('/rank_health_centres.json', create_table_rank);
    } else {
        $.getJSON('/procedure/proceduresPerHealthCentre', filters, create_table_rank);
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

// Charts
/* Gráfico de Total de Internações Hospitalares */
function create_specialties_total(data) {
    var myChart = echarts.init(document.getElementById("chart_spec_total"));
    var formatData = [];
    formatData.push(['amount', 'variable']);
    var max = 0;

    for(var i=0; i<data.length; i++){
        if(data[i][1] != null && data[i][0] != null){
            formatData.push([data[i][1], data[i][0].toString()]);
            max = Math.max(max, data[i][1]);
        }
    }

    option = {
        dataset: {
            source: formatData
        },
        title: {
            text: 'Total de internações hospitalares',
            top: 0,
            left: 400,
            textStyle: {
                color: '#333'
            }
        },

        tooltip : {
            trigger: 'item',
            formatter: "{c} "
        },
        grid: {containLabel: true},
        xAxis: {name: 'amount'},
        yAxis: {type: 'category'},
        visualMap: {
            orient: 'horizontal',
            left: 'center',
            min: 0,
            max: max,
            text: ['High Score', 'Low Score'],
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
                    y: 'product'
                }
            }
        ]
    }
    myChart.setOption(option);
}
/* Gráfico de Porcentagem de Internações por especialidades */
function create_proceduresPerSpecialties(data){
    var myChart = echarts.init(document.getElementById("chart_specialties"));
    var formatData = [];
    formatData.push(['amount', 'variable']);
    var max = 0;

    for(var i=0; i<data.length; i++){
        if(data[i][1] != null && data[i][0] != null){
            formatData.push([data[i][1], data[i][0].toString()]);
            max = Math.max(max, data[i][1]);
        }
    }
    option = {
        dataset: {
            source: formatData,
        },
        title: {
            text: 'Porcentagem de Internações por especialidades',
            top: 0,
            left: 80,
            textStyle: {
                color: '#333'
            }
        },
        legend: {
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 20,
            bottom: 20,
        },

        tooltip : {
            trigger: 'item',
            formatter: "({d}%)"
        },

        series : [
            {
                type:'pie',
                radius : '50%',
                center: ['39%', '50%'],

                encode: {
                    itemName: 'variable',
                    value: 'amount'
                }
            }
        ]
    };
    myChart.setOption(option);
}