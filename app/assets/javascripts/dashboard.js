
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

var chart_type = {"CRS":"bar", "DA":"bar", "PR":"bar", "STS":"bar", "age_code":"bar", "cid_primary":"cid", "cid_secondary":"cid",
 "cid_secondary2":"cid", "cmpt":"line", "cnes_id":"bar", "complexity":"pie", "days":"bar-line", "days_total":"bar-line", "days_uti":"bar-line",
 "days_ui":"bar-line", "distance":"bar-line", "finance":"pie", "gender":"pie", "gestor_ide":"pie", "lv_instruction":"pie", "proce_re":"bar",
 "race":"pie", "specialty_id":"pie", "treatment_type":"pie", "val_total":"bar-line"};

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
    create_dashboard_charts();
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
    if(data === null){
        $.ajax({
            url: "variables_metric.json",
            dataType: 'json',
            async: false,
            data: data,
            success: function(loaded) {
                result = loaded;
                result["cnes_id"].reverse();
                result["STS"].reverse()
                result["PR"].reverse()
                result["CRS"].reverse()
                result["DA"].reverse()
                result["distance"].sort()
                result["val_total"] = result["val_total"].map(x => {return [x[0].replace("," , "."), x[1]]})
                create_one_variable_graph(result["cnes_id"], "cnes_id");
            }
          });

    }
    else{
        $.ajax({
            url: "procedure/proceduresVariables",
            dataType: 'json',
            async: false,
            data: data,
            success: function(loaded) {
                result = loaded;
                result["val_total"] = result["val_total"].map(x => {return [x[0].replace("," , "."), x[1]]})
                create_one_variable_graph(result["cnes_id"], "cnes_id");
            }
          });
    }


    create_proceduresPerSpecialties(result["specialty_id"], "specialty_id");
    create_specialties_distance_between_patients_hospital(data);
    create_analise(data);
    populate_procedures_by_date();
    create_specialties_total(result["specialty_id"], "specialty_id");
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
            top: 20,
            left: 100,
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

/* Gráfico de Porcentagem de Distância Média por Especialidade */
function create_specialties_distance_between_patients_hospital(data){
    var myChart = echarts.init(document.getElementById("chart_spec_distance_average"));

    if (dynamic == false) {
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
                right: 20,
                left: 450,
                textStyle: {
                    color: '#333'
                }
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
            top: 20,
            left: 800,
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
            min: 10,
            max: 100,
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

/* Gráfico de Porcentagem de Internações por distância percorrida */
function create_analise(data){
    var myChart = echarts.init(document.getElementById("chart_div_analise"));

    var formatData = [];
    formatData.push(['variable', 'amount']);
    // var max = 0;

    if (dynamic == false) {
        var path = '/distance_metric.json'
    } else {
        var path = 'procedure/proceduresDistanceGroup'
    }

    var aux = []

    $.getJSON(path, data, function(result){
        $.each(result, function(name, number) {
            formatData.push([name, number]);

        });

        // console.log(formatData.length)

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
});
}

function populate_procedures_by_date() {
    var myChart = echarts.init(document.getElementById("procedure_by_date"));

    if (dynamic == false) {
        var path = "/procedures_by_date.json";
    } else {
        var path = "/procedure/proceduresPerMonth"
    }

    $.getJSON(path, data, function(result) {
        var values = [];
        $.each(result, function(k,v) {
          values.push([new Date(v[0] + "T00:00:00"), v[1]]); // Fix timezone problem
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

function get_color_slice() {
    var slices = {};
    var idx = 0;
    $.each(specialties_color, function(result, value) {
        slices[idx++] = {color: value};
    });
    return slices;
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
        //console.log("RodolfoIf")
    } else {
        $.getJSON('/procedure/proceduresPerHealthCentre', data, create_table_rank);
        //console.log("RodolfoElse")
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

function create_one_variable_graph(data, field){
    var formatData = [];
    formatData.push(['amount', 'variable']);
    var max = 0;

    for(var i=0; i<data.length; i++){
        if(data[i][1] != null && data[i][0] != null){
            formatData.push([data[i][1], data[i][0].toString()]);
            max = Math.max(max, data[i][1]);
        }
    }

    myChart.clear();
    switch (chart_type[field]) {
      case "bar":
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
              name: 'Procedimentos',
              axisLabel: {interval : 0},
            },
            yAxis: {type: 'category'},
            visualMap: {
                orient: 'horizontal',
                min: 0,
                max: max,
                text: ['Máximo', 'Mínimo'],
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
      break;
      case "pie":
        var option = {
            dataset: {
                source: formatData,
            },
            //title: 'Title',
            tooltip : {
                trigger: 'item',

            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 20,
                bottom: 20,
            },
            label: {
                    formatter: '{b}: ({d}%)'
                },
            series : [
                {
                    type: 'pie',
                    radius : '55%',
                    center: ['40%', '50%'],
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
      break;
      case "line":
        var option = {
            dataset: {
                source: formatData,
            },
            //title: 'Title',
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
        myChart.setOption(option);
      break;
      case "bar-line":
        var q = quartile(formatData);
        var option = {
              dataset: {
                  source: formatData,
              },
              //title: 'Title',
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
      break;
      case "cid":
        var cid10 = formatCID(formatData);
        var option = {
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
        myChart.setOption(option);
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

function changeChart(){
    const field = document.getElementById("select-chart").value;
    create_one_variable_graph(result[field], field);
}


//*** DOM Functions ****//

function on_click(id) {
  $("#" + id).toggleClass("active")
}
