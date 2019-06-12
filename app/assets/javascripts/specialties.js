
var types_color = {
 "HOSPITAL/DIA - ISOLADO":'#003300',
 "OSPITAL GERAL":'#15ff00',
 "HOSPITAL ESPECIALIZADO":'#ff0000',
 "CLÍNICA/CENTRO DE ESPECIALIDADE":"#f5b979",
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
 "CUIDADOS PROLONGADOS",
 "PSIQUIATRIA",
 "TISIOLOGIA",
 "PEDIATRIA",
 "REABILITAÇÃO",
 "PSIQUIATRIA EM HOSPITAL-DIA"
]

var types_name = [
 "HOSPITAL/DIA - ISOLADO",
 "HOSPITAL GERAL",
 "HOSPITAL ESPECIALIZADO",
 "CLÍNICA/CENTRO DE ESPECIALIDADE", 
]

function init_specialties_chart() {
 specialties_metric = $.getJSON('/specialties_metric.json', function(specialties) {
   $.each(specialties, create_specialty_chart);
 });
}

function create_specialty_chart(index, specialty){
  var myChart = echarts.init(document.getElementById(specialty_divs[index]));
  
  formated_specialty = {}
  var values = [];
  values.push(['amount', 'variable']);

  $.each(specialty, function(index, data) {
      if(types_name[index] != undefined)
        formated_specialty[types_name[index]] = data
  });

  $.each(formated_specialty, function(name, number) {
    values.push([name, parseFloat(number.toFixed(1))]);
  });

  // console.log("RODOLFO")
  // console.log(index)
  // console.log("---------------------")
  // console.log(values)
  // console.log("---------------------")
  // console.log(specialty)


  option = {  
    dataset: {
      source: values  
    },

    title:{
      text: specialties_name[index],
      top: 20,
      right: 20,
      left: 250,
      textStyle: {
        color: '#333'
      } 
    },
    
    tooltip : {
      trigger: 'item',
      formatter: "{c} "
    },
    
    grid: {
      containLabel: true
    },
    
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
}


// function create_specialty_chart(index, specialty){
//   var header = ["Tipos de estabelecimentos", "Distância Média Percorrida(Km)", { role: "style" } ]
//   var chart = new google.visualization.BarChart(document.getElementById(specialty_divs[index]));
  
//   var options = {
//     title: specialties_name[index],
//     titleTextStyle: {fontSize: 25, bold: false },
//     bar: {groupWidth: "80%"},
//     legend: { position: 'none' },
//     chartArea: {
//    top: 55,
//    left: 270 },
//     vAxis: { textStyle:  {fontSize: 14,bold: false}},
//     hAxis: { textStyle:  {fontSize: 18,bold: false}}
//   };

//   formated_specialty = {}
//   $.each(specialty, function(index, data) {
//       console.log(data)
//       if(types_name[index] != undefined)
//         formated_specialty[types_name[index]] = data
//   });

//   // console.log(formated_specialty)

//  draw_chart(header, formated_specialty, chart, options, types_color)
// }