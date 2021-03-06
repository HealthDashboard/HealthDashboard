var filters = null;
var filtered_data = null;
var dynamicChart = null;

var chart_type = {"CRS":"bar", "DA":"bar", "PR":"bar", "STS":"bar", "age_code":"bar", "cid_primary":"cid", "cid_secondary":"cid",
 "cid_secondary2":"cid", "cmpt":"line", "cnes_id":"bar", "complexity":"pie", "days":"bar-line", "days_total":"bar-line", "days_uti":"bar-line",
 "days_ui":"bar-line", "distance":"bar-line", "finance":"pie", "gender":"pie", "gestor_ide":"pie", "lv_instruction":"pie", "proce_re":"bar",
 "race":"pie", "specialty_id":"pie", "treatment_type":"pie", "val_total":"bar-line"};

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
    
    dynamicChart = echarts.init(document.getElementById('bar-graph'));
    $(window).on('resize', function(){
        if(dynamicChart != null && dynamicChart != undefined){
          dynamicChart.resize();
        }
    });
    update_rank();
    populate_procedures_by_date();
    create_proceduresPerSpecialties(filtered_data["specialty_id"], "specialty_id");
    create_specialties_distance_between_patients_hospital(filters);
    create_analise(filters);
    create_specialties_total(filtered_data["specialty_id"], "specialty_id");
    create_pie_chart(filtered_data["specialty_id"], "chart_bed_specialty", "Número de internações por Especialidade do Leito");
    create_pie_chart(filtered_data["gestor_ide"], "chart_management", "Número de internações por Gestão");
    create_pie_chart(filtered_data["treatment_type"], "chart_character", "Número de internações por Caráter do Atendimento");
    create_bar_line_chart(filtered_data["days_total"], "chart_days_total", "Número de internações pelo Total Geral de Diárias");
    create_pie_chart(filtered_data["gender"], "chart_gender", "Internações por Sexo");
    create_bar_chart(filtered_data["age_code"], "chart_age", "Internações por Faixa Etária");
    create_pie_chart(filtered_data["race"], "chart_race", "Internações por Raça/Cor");
    create_bar_chart(filtered_data["STS"], "chart_STS", "Internações por Supervisão Técnica de Saúde");
    create_bar_chart(filtered_data["CRS"], "chart_CRS", "Internações por Coordenadoria Regional de Saúde");
    create_bar_chart(filtered_data["DA"], "chart_DA", "Internações por Distrito Administrativo");
    create_one_variable_graph(filtered_data["cnes_id"], "cnes_id");
    update_statistic_table();
}

//Ranking
function update_rank() {
    variable = document.getElementById("select-variable").value;
    if (filters == null) {
        switch(variable) {
            case "health_centre":
                $.getJSON('/rank_health_centre.json', create_table_rank);
                break;
            case "DA":
                $.getJSON('/rank_DA.json', create_table_rank);
                break;
            case "age":
                $.getJSON('/rank_age.json', create_table_rank);
                break;
            case "gender":
                $.getJSON('/rank_gender.json', create_table_rank);
                break;
            case "CID":
                $.getJSON('/rank_CID.json', create_table_rank);
                break;
            default:
                $.getJSON('/rank_health_centre.json', create_table_rank);
          }
    } else {
        $.getJSON('/procedure/proceduresPerVariable?variable='+variable, filters, create_table_rank);
    }
}
function create_table_rank(result) {
    rank_table = $('.health_centres_rank');

    text = $("#select-variable :selected").text();
    index = 1;
    Total = 0;

    rows = "<caption><center>Ranking dos que possuem mais internações hospitalares</center></caption>"
    rows += "<thead><tr><th>#</th><th>"+text+"</th><th>Nº de Internações</th></tr></thead><tbody>"

    $.each(result, function(name, n_procedures) {
        if (index % 2) {
            rows += "<tr class='bg-success'>"
        } else {
            rows += "<tr>"
        }
        rows += " <th scope=\"row\">" + (index++) + "</th><td>" + name + "</td> <td>" + n_procedures.toLocaleString('pt-BR') + "</td></tr>"
            Total += n_procedures
    });
    rows += " <th scope=\"row\">#</th><td> TOTAL </td> <td>" + Total.toLocaleString('pt-BR') + "</td></tr></tbody>"
    rank_table.html(rows);
}

function update_statistic_table() {
    if (filters == null) {
        $.getJSON('/statistic_values.json', create_statistic_table);
    } else {
        $.getJSON('/procedure/proceduresStatisticAnalysis', filters, create_statistic_table);
    }
}

function create_statistic_table(result) {
    statistic_table = $('.statistic_table');
    
    index = 1;

    rows = "<thead><tr><th>Variável</th>"
    rows += "<th>Contagem</th><th>Soma</th>"
    rows += "<th>Mínimo</th><th>Máximo</th>"
    rows += "<th>Média</th><th>Desvio Padrão</th></tr></thead><tbody>"

    $.each(result, function(variable, analysis) {
        if (index % 2 == 0) {
            rows += "<tr class='bg-success'>"
        } else {
            rows += "<tr>"
        }
        index++;
        rows += "<td>" + variable + "</td>"
        rows += "<td>" + analysis["count"].toLocaleString('pt-BR') + "</td>"
        rows += "<td>" + analysis["sum"].toLocaleString('pt-BR') + "</td>"
        rows += "<td>" + analysis["min"].toLocaleString('pt-BR') + "</td>"
        rows += "<td>" + analysis["max"].toLocaleString('pt-BR') + "</td>"
        rows += "<td>" + analysis["average"].toLocaleString('pt-BR') + "</td>"
        rows += "<td>" + analysis["deviation"].toLocaleString('pt-BR') + "</td></tr>"
    });
    rows += "</tbody>"
    statistic_table.html(rows);
}

/* Série Histórica */
function populate_procedures_by_date() {
    var myChart = echarts.init(document.getElementById("procedure_by_date"));

    if (filters == null) {
        var path = "/procedures_by_date.json";
    } else {
        var path = "/procedure/proceduresPerMonth"
    }

    $.getJSON(path, filters, function(result) {
        var values = [];
        $.each(result, function(k,v) {
          values.push([new Date(v[0] + "T00:00:00").toString().slice(4, 8)+new Date(v[0] + "T00:00:00").toString().slice(11, 15), v[1]]); // Fix timezone problem
        });

        option = {
            dataset: {
                source: values,
            },
            title: {
                text: 'Número de internações por mês',
                top: 20,
                right: 20,
                left: 150,
                textStyle: {
                    color: '#333'
                }
            },
            textStyle: {
                fontFamily:	'Verdana, sans-serif',
            },
            tooltip : {
                trigger: 'item',
                formatter: "{c} "
            },
            xAxis: {
                type: 'category',
            },
            yAxis: {
                type: 'value'

            },
            series: [{
                type: 'line'

            }]
        };

        myChart.setOption(option);
    });
}

// Charts
/* Gráfico de Total de Internações Hospitalares */
function create_specialties_total(data) {
    var myChart = echarts.init(document.getElementById("chart_spec_total"));
    var formatData = [];
    formatData.push(['amount', 'variable']);
    var max = 0;
    var min = Number.MAX_SAFE_INTEGER;

    for(var i=0; i<data.length; i++){
        if(data[i][1] != null && data[i][0] != null){
            variable = data[i][0].toString();
            if (variable[0] == "1") variable = "Especialidade "+variable;
            formatData.push([data[i][1], variable]);
            max = Math.max(max, data[i][1]);
            min = Math.min(min, data[i][1]);
        }
    }

    option = {
        dataset: {
            source: formatData
        },
        title: {
            text: 'Total de internações hospitalares',
            top: 0,
            left: 'center',
            textStyle: {
                color: '#333'
            }
        },
        textStyle: {
            fontFamily:	'Verdana, sans-serif',
            fontSize: 16,
        },

        tooltip : {
            trigger: 'item',
            formatter: "{c} "
        },
        grid: {containLabel: true},
        xAxis: {name: ' '},
        yAxis: {type: 'category'},
        visualMap: {
            orient: 'horizontal',
            left: 'center',
            min: min,
            max: max,
            text: [max, min],
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
            variable = data[i][0].toString();
            if (variable[0] == "1") variable = "Especialidade "+variable;
            formatData.push([data[i][1], variable]);
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
        textStyle: {
            fontFamily:	'Verdana, sans-serif',
            fontSize: 16,
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
            formatter: "{c} ({d}%)"
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
/* Gráfico de Porcentagem de Internações por distância percorrida */
function create_analise(data){
    var myChart = echarts.init(document.getElementById("chart_div_analise"));

    var formatData = [];
    formatData.push(['variable', 'amount']);
    // var max = 0;

    if (filters == null) {
        var path = '/distance_metric.json'
    } else {
        var path = 'procedure/proceduresDistanceGroup'
    }

    var aux = []

    $.getJSON(path, data, function(result){
        $.each(result, function(name, number) {
            formatData.push([name, number]);

        });

        option = {
            dataset: {
                source: formatData,
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 20,
                bottom: 20,
            },
            title: {
                text: 'Porcentagem de Internações por Distância Percorrida',
                top: 20,
                left: 50,
                textStyle: {
                    color: '#333'
                }
            },
            textStyle: {
                fontFamily:	'Verdana, sans-serif',
                fontSize: 16,
            },
            tooltip : {
                trigger: 'item',
                formatter: "{c} ({d}%)"
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
    });
}
/* Gráfico de Porcentagem de Distância Média por Especialidade */
function create_specialties_distance_between_patients_hospital(data){
    var myChart = echarts.init(document.getElementById("chart_spec_distance_average"));

    if (filters == null) {
        var path = 'specialties_procedure_distance_average'
    } else {
        var path = '/procedure/proceduresDistance'
    }

    var formatData = [];

    formatData.push(['amount', 'variable']);

    $.getJSON(path, data, function(result){
        $.each(result, function(name, number) {
            // console.log([name, number]);
            formatData.push([name, number]);
        });

        var option = {
            dataset: {
                source: formatData
            },
            title: {
                text: 'Distância Média por Especialidade',
                top: 20,
                left: 400,
                textStyle: {
                    color: '#333'
                }
            },
            textStyle: {
                fontFamily:	'Verdana, sans-serif',
                fontSize: 16,
            },
            tooltip : {
                trigger: 'item',
                formatter: "{c} "
            },

            grid: {containLabel: true},

            xAxis: {
                type: 'value'
            },
            yAxis: {
                type: 'category'
            },

            series: [
                {
                    type: 'bar',
                    encode: {
                        // Map the "amount" column to X axis.
                        x: 'variable',
                        // Map the "product" column to Y axis
                        y: 'amount'
                    }
                }
        ]
    };

    myChart.setOption(option);
    });
}
/* Gráfico de Pizza */
function create_pie_chart(data, elementId, title) {
    var myChart = echarts.init(document.getElementById(elementId));

    var formatData = [];
    formatData.push(['amount', 'variable']);
    var max = 0;

    for(var i=0; i<data.length; i++){
        if(data[i][1] != null && data[i][0] != null){
            variable = data[i][0].toString();
            if (variable[0] == "1") variable = "Especialidade "+variable;
            formatData.push([data[i][1], variable]);
            max = Math.max(max, data[i][1]);
        }
    }
    var option = {
        dataset: {
            source: formatData,
        },
        title: {
            text: title,
        },
        textStyle: {
            fontFamily:	'Verdana, sans-serif',
            fontSize: 16,
        },
        tooltip : {
            trigger: 'item',
            formatter: '{c} ({d}%)'
        },
        legend: {
            type: 'scroll',
            orient: 'horizontal',
            bottom: 50,
        },
        label: {
                formatter: '{b}'
            },
        series : [
            {
                type: 'pie',
                radius : '55%',
                center: ['50%', '50%'],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                encode: {
                  itemName: 'variable',
                  value: 'amount'
                }
            }
        ]
    };
    myChart.setOption(option);
}
/* Gráfico de Barra */
function create_bar_chart(data, elementId, title) {
    var myChart = echarts.init(document.getElementById(elementId));    

    var formatData = [];
    formatData.push(['amount', 'variable']);
    var max = 0;
    var min = Number.MAX_SAFE_INTEGER;

    for(var i=0; i<data.length; i++){
        if(data[i][1] != null && data[i][0] != null){
            formatData.push([data[i][1], data[i][0].toString()]);
            max = Math.max(max, data[i][1]);
            min = Math.min(min, data[i][1]);
        }
    }

    var option = {
        dataset: {
            source: formatData,
        },
        title: {
            text: title,
            left: 'center',
        },
        textStyle: {
            fontFamily:	'Verdana, sans-serif',        
            fontSize: 16,
        },
        tooltip : {
            trigger: 'axis',
            axisPointer : {
                type : 'shadow'
            }
        },
        dataZoom: [{
            id: 'dataZoomX',
            type: 'slider',
            xAxisIndex: [0],
            filterMode: 'filter'
        },
        {
            id: 'dataZoomY',
            type: 'slider',
            yAxisIndex: [0],
            filterMode: 'empty'
        }],
        grid: {containLabel: true},
        xAxis: {
            name: ' ',
            axisLabel: {interval : 0},
        },
        yAxis: {type: 'category'},
        visualMap: {
            orient: 'horizontal',
            min: min,
            max: max,
            text: [max, min],
            // Map the score column to color
            dimension: 0,
            inRange: {
                color: ['#D7DA8B', '#E15457']
            },
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
/* Gráfico de Barra e Linha*/
function create_bar_line_chart(data, elementId, title) {
    var myChart = echarts.init(document.getElementById(elementId));    

    var formatData = [];
    formatData.push(['amount', 'variable']);
    var max = 0;

    for(var i=0; i<data.length; i++){
        if(data[i][1] != null && data[i][0] != null){
            formatData.push([data[i][1], data[i][0].toString()]);
            max = Math.max(max, data[i][1]);
        }
    }

    var q = quartile(formatData);
    var option = {
          dataset: {
              source: formatData,
          },
          title: {
            text: title,
          },
          textStyle: {
              fontFamily:	'Verdana, sans-serif',
              fontSize: 16,
          },
          tooltip : {
              trigger: 'axis',
              axisPointer : {
                  type : 'shadow'
              },
          },
          dataZoom: [{
              id: 'dataZoomX',
              type: 'slider',
              xAxisIndex: [0],
              filterMode: 'filter'
          }],
          grid: {containLabel: true},
          yAxis: {
            name: 'Procedimentos',
            type: 'value',
            axisLabel: {interval : 10}
          },
          xAxis: {
            type: 'category',
          },
          toolbox: {
            feature: {
              magicType: {
                type: ['line', 'bar']
              }
            }
          },
          series: [
              {
                  type: 'bar',
                  encode: {
                      y: 'amount',
                      x: 'variable',
                  },
                  markPoint: {
                    data : [[
                        {
                          name: "q1",
                          value: q[1]
                        }]
                    ]
                  },
                  markArea: {
                    silent: true,
                    label: {
                      show: true,
                      formatter: "Q1: " + q[0] + " até Q3: " + q[2],
                      position: ["102%", "2%"],
                      emphasis: {
                        position: ["102%", "2%"],
                      }
                    },
                      data: [
                        [
                          {
                            xAxis: q[0]
                          },
                          {
                            xAxis: q[2]
                          }
                        ]
                      ]
                  },
              }
          ]
    };
    myChart.setOption(option);
}
/* Gráfico base para uma variável*/
function create_one_variable_graph(data, field){
    var formatData = [];
    formatData.push(['amount', 'variable']);
    var max = 0;
    var min = Number.MAX_SAFE_INTEGER;

    for(var i=0; i<data.length; i++){
        if(data[i][1] != null && data[i][0] != null){
            formatData.push([data[i][1], data[i][0].toString()]);
            max = Math.max(max, data[i][1]);
            min = Math.min(min, data[i][1]);
        }
    }

    dynamicChart.clear();
    switch (chart_type[field]) {
      case "bar":
        var option = {
            dataset: {
                source: formatData,
            },
            //title: 'Title',
            textStyle: {
                fontFamily:	'Verdana, sans-serif',
                fontSize: 16,
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {
                    type : 'shadow'
                }
            },
            dataZoom: [{
                id: 'dataZoomX',
                type: 'slider',
                xAxisIndex: [0],
                filterMode: 'filter'
            },
            {
                id: 'dataZoomY',
                type: 'slider',
                yAxisIndex: [0],
                filterMode: 'empty'
            }],
            grid: {containLabel: true},
            xAxis: {
              name: ' ',
              axisLabel: {interval : 0},
            },
            yAxis: {type: 'category'},
            visualMap: {
                orient: 'horizontal',
                min: min,
                max: max,
                text: [max, min],
                // Map the score column to color
                dimension: 0,
                inRange: {
                    color: ['#D7DA8B', '#E15457']
                },
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
        dynamicChart.setOption(option);
      break;
      case "pie":
        var option = {
            dataset: {
                source: formatData,
            },
            //title: 'Title',
            textStyle: {
                fontFamily:	'Verdana, sans-serif',
                fontSize: 16,
            },
            tooltip : {
                trigger: 'item',
                formatter: '{c} ({d}%)'
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                bottom: 50,
            },
            label: {
                    formatter: '{b}'
                },
            series : [
                {
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '50%'],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    encode: {
                      itemName: 'variable',
                      value: 'amount'
                    }
                }
            ]
        };
        dynamicChart.setOption(option);
      break;
      case "line":
        var option = {
            dataset: {
                source: formatData,
            },
            //title: 'Title',
            textStyle: {
                fontFamily:	'Verdana, sans-serif',
                fontSize: 16,
            },
            tooltip : {
                trigger: 'axis',
            },
            dataZoom: [{
                id: 'dataZoomX',
                type: 'slider',
                xAxisIndex: [0],
                filterMode: 'filter'
            }],
            grid: {containLabel: true},
            yAxis: {
              name: 'Procedimentos',
              type: 'value',
              axisLabel: {interval : 0}
            },
            xAxis: {
              type: 'category',
              boundaryGap: false
            },
            toolbox: {
              feature: {
                magicType: {
                  type: ['line', 'bar']
                }
              }
            },
            series: [
                {
                    type: 'line',
                    encode: {
                        y: 'amount',
                        x: 'variable',
                    }
                }
            ]
        };
        dynamicChart.setOption(option);
      break;
      case "bar-line":
        var q = quartile(formatData);
        var option = {
              dataset: {
                  source: formatData,
              },
              //title: 'Title',
              textStyle: {
                  fontFamily:	'Verdana, sans-serif',
                  fontSize: 16,
              },
              tooltip : {
                  trigger: 'axis',
                  axisPointer : {
                      type : 'shadow'
                  },
              },
              dataZoom: [{
                  id: 'dataZoomX',
                  type: 'slider',
                  xAxisIndex: [0],
                  filterMode: 'filter'
              }],
              grid: {containLabel: true},
              yAxis: {
                name: 'Procedimentos',
                type: 'value',
                axisLabel: {interval : 10}
              },
              xAxis: {
                type: 'category',
              },
              toolbox: {
                feature: {
                  magicType: {
                    type: ['line', 'bar']
                  }
                }
              },
              series: [
                  {
                      type: 'bar',
                      encode: {
                          y: 'amount',
                          x: 'variable',
                      },
                      markPoint: {
                        data : [[
                            {
                              name: "q1",
                              value: q[1]
                            }]
                        ]
                      },
                      markArea: {
                        silent: true,
                        label: {
                          show: true,
                          formatter: "Q1: " + q[0] + " até Q3: " + q[2],
                          position: ["102%", "2%"],
                          emphasis: {
                            position: ["102%", "2%"],
                          }
                        },
                          data: [
                            [
                              {
                                xAxis: q[0]
                              },
                              {
                                xAxis: q[2]
                              }
                            ]
                          ]
                      },
                  }
              ]
        };
        dynamicChart.setOption(option);
      break;
      case "cid":
        var cid10 = formatCID(formatData);
        var option = {
          textStyle: {
            fontFamily:	'Verdana, sans-serif'
          },
          label: {
            // fontWeight: 'bold',
            fontSize: 16
          },
          tooltip: {
            formatter: function (params) {
              var str = params.data.fullname + ": " + params.data.value;
              return str;
            },
          },
          series: [{
            type: "treemap",
            name: "Procedimentos",
            data: cid10,
            leafDepth: 3,
          }],
        }
        dynamicChart.setOption(option);
      break;
    }
}

function quartile(data) {
    var q = [];
    var total = 0;
    data = data.sort(function(a,b){return a[1] - b[1];});
    for (var i = 1; i < data.length; i++) {
      total = total + data[i][0];
    }
    var total1 = Math.floor(total * 0.25);
    var total2 = Math.floor(total * 0.5);
    var total3 = Math.floor(total * 0.75);
  
    total = 0;
    for (i = 1; i < data.length; i++) {
      total += data[i][0];
      if (total1 <= total) {
        q.push(data[i][1])
        break;
      }
    }
    for (i; i < data.length; i++) {
      total += data[i][0];
      if (total2 <= total) {
        q.push(data[i][1])
        break;
      }
    }
    for (i; i < data.length; i++) {
      total += data[i][0];
      if (total3 <= total) {
        q.push(data[i][1]);
        break;
      }
    }
    return q;
  }
  
  function formatCID (data) {
    var cid10 = [];
    for (i = 0; i < 26; i++) {
      obj = {
        name: String.fromCharCode(i + 65),
        children: []
      }
      cid10.push(obj)
      for (j = 0; j < 10; j++) {
        obj = {
          name: String.fromCharCode(i + 65, j + 48),
          children: []
        }
        cid10[i].children.push(obj)
      }
    }
  
    for (i=1; i < data.length-1; i++) {
      letter = data[i][1].charCodeAt(0) - 65;
      number = data[i][1].charAt(1);
      obj = {
        name: data[i][1].slice(0, 3),
        fullname: data[i][1],
        value: data[i][0]
      }
      cid10[letter].children[number].children.push(obj)
    }
  
    if (data[i][1] != "") {
      letter = data[i][1].charCodeAt(0) - 65;
      number = data[i][1].charAt(1);
      obj = {
        name: data[i][1].slice(0, 3),
        fullname: data[i][1],
        value: data[i][0]
      }
      cid10[letter].children[number].children.push(obj)
    }
    return cid10;
  }

//*** DOM Functions ****//

function open_info(id) {
    var popup = document.getElementById(id);
    popup.classList.toggle("show");
}

function on_click(id) {
    $("#" + id).toggleClass("active")
}

function changeChart(){
    const field = document.getElementById("select-chart").value;
    create_one_variable_graph(filtered_data[field], field);
}
  