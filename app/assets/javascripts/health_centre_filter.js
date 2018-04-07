var type_id_array = {'ELETIVO':1, 'URGENCIA':2, 'ACIDENTE NO LOCAL DE TRABALHO OU A SERVICO DA EMPRESA':3, 'ACIDENTE NO TRAJETO PARA O TRABALHO':4, 'OUTROS TIPOS DE ACIDENTE DE TRANSITO':5, 'OUTROS TIPOS DE LESOES E ENVENENAMENTOS POR AGENTES QUIMICOS OU FISICOS':6};
var specialty_id_array = {'CIRURGIA':1, 'OBSTETRÍCIA':2, 'CLINICA MÉDICA':3, 'CUIDADOS PROLONGADOS':4, 'PSIQUIATRIA':5, 'TISIOLOGIA':6, 'PEDIATRIA':7, 'REABILITAÇÃO':8, 'PSIQUIATRIA EM HOSPITAL-DIA':9};
var region_id_array = {"PIRITUBA / JARAGUÁ":1, "FREGUESIA / BRASILÂNDIA":2, "JABAQUARA":3, "VILA PRUDENTE":4, "SANTO AMARO":5, "ARICANDUVA / FORMOSA / CARRÃO":6, "CAMPO LIMPO":7, "M´BOI MIRIM":8, "VILA MARIANA":9, "CASA VERDE / CACHOEIRINHA":10, 
"SÃO MIGUEL PAULISTA":11, "SÃO MATEUS":12, "ITAQUERA":13, "PINHEIROS":14, "PENHA":15, "CIDADE TIRADENTES":16, "LAPA":17, "SAPOPEMBA":18, "GUAIANASES":19, "CAPELA DO SOCORRO":20, "SÉ":21, "BUTANTÃ":22, "ERMELINO MATARAZZO":23, "ITAIM PAULISTA":24, 
"IPIRANGA":25, "VILA MARIA / VILA GUILHERME":26, "SANTANA / TUCURUVI":27, "JAÇANÃ / TREMEMBÉ":28, "MOÓCA":29}

var health_centre_names = {1:"PAM VARZEA DO CARMO NGA 63 SAO PAULO", 2:"HOSPITAL LOCAL DE SAPOPEMBA", 3:"HOSPITAL GRAACC INSTITUTO DE ONCOLOGIA PEDIATRICA IOP", 4:"HOSPITAL VITAL BRAZIL SAO PAULO", 5:"AME MARIA ZELIA AMB MED ESPECIALIDADES MARIA ZELIA",
6:"HOSPITAL DIA DA REDE HORA CERTA M BOI MIRIM I", 7:"HOSPITAL DIA DA REDE HORA CERTA BRASILANDIA FO", 8:"HOSPITAL DIA DA REDE HORA CERTA M BOI MIRIM II UPA VERA CRUZ", 9:"HORA CERTA MOVEL CIRURGICO CIES", 10:"INSTITUTO DE INFECTOLOGIA EMILIO RIBAS SAO PAULO",
11:"HOSPITAL ISRAELITA ALBERT EINSTEIN", 12:"HOSP DO SERV PUB EST FCO MORATO DE OLIVEIRA SAO PAULO", 13:"HOSPITAL MATERNIDADE INTERLAGOS", 14:"HOSPITAL GERAL DE PEDREIRA", 15:"HOSPITAL HELIOPOLIS UNIDADE DE GESTAO ASSISTENCIAL I SP",
16:"AMBULATORIO DE ESPECIALIDADES DR GERALDO PAULO BOURROUL", 17:"CAISM DR DAVID CAPISTRANO DA COSTA FILHO DA AGUA FUNDA SP", 18:"HOSPITAL INFANTIL DARCY VARGAS UGA III SAO PAULO", 19:"HC DA FMUSP INSTITUTO DO CORACAO INCOR SAO PAULO", 20:"HOSP MUN MATERNIDADE PROF MARIO DEGNI",
21:"HOSP DA STA CASA DE STO AMARO", 22:"HOSPITAL SAO LUIZ GONZAGA", 23:"HOSPITAL UNIVERSITARIO DA USP SAO PAULO", 24:"CASA DA CRIANCA BETINHO", 25:"HOSPITAL AMPARO MATERNAL", 26:"CAISM PHILIPPE PINEL SAO PAULO", 27:"HOSPITAL ESTADUAL DE VILA ALPINA ORG SOCIAL SECONCI SAO PAULO",
28:"HOSP MUN DR JOSE SOARES HUNGRIA", 29:"HOSP DOM ANTONIO DE ALVARENGA", 30:"HOSP STA MARCELINA SAO PAULO", 31:"HOSPITAL SAO PAULO HOSPITAL DE ENSINO DA UNIFESP SAO PAULO", 32:"HOSPITAL GERAL DE SAO MATEUS SAO PAULO", 33:"HOSPITAL BANDEIRANTES",
34:"UNIDADE DE GESTAO ASSISTENCIAL II HOSPITAL IPIRANGA SP", 35:"A C CAMARGO CANCER CENTER", 36:"CONJUNTO HOSPITALAR DO MANDAQUI SAO PAULO", 37:"INST BRASILEIRO DE CONTROLE DO CANCER IBCC", 38:"CASA DE SAUDE NOSSA SENHORA DE FATIMA",
39:"HOSPITAL GERAL SANTA MARCELINA DE ITAIM PAULISTA SAO PAULO", 40:"HOSP MUN PROF DR WALDOMIRO DE PAULA", 41:"ASSOC AACD V CLEMENTINO", 42:"HOSPITAL GERAL DO GRAJAU PROF LIBER JOHN ALPHONSE DI DIO SP", 43:"HOSPITAL E MATERNIDADE LEONOR MENDES DE BARROS SAO PAULO", 44:"HOSP MONUMENTO CEHM",
45:"CENTRO DE REFERENCIA E TREINAMENTO DSTAIDS SAO PAULO", 46:"HC DA FMUSP HOSPITAL DAS CLINICAS SAO PAULO", 47:"CENTRO DE REFERENCIA DA SAUDE DA MULHER SAO PAULO", 48:"HOSP MUN INFANTIL MENINO JESUS", 49:"HOSPITAL E MATERNIDADE SANTA MARIA CRUZ AZUL",
50:"HOSP MUN MAT ESC DR MARIO DE MORAES A SILVA", 51:"HOSPITAL GERAL JESUS TEIXEIRA DA COSTA GUAIANASES SAO PAULO", 52:"INST DO CANCER ARNALDO VIEIRA DE CARVALHO", 53:"HOSP MUN DR CARMINO CARICCHIO", 54:"HOSPITAL SAO JOAQUIM BENEFICENCIA PORTUGUESA", 55:"HOSP MUN TIDE SETUBAL",
56:"HOSP MUN DOUTOR ALEXANDRE ZAIO", 57:"HOSPITAL SAMARITANO", 58:"HOSP MUN DR ARTHUR RIBEIRO DE SABOYA", 59:"HOSPITAL KATIA DE SOUZA RODRIGUES TAIPASSP SAO PAULO", 60:"HOSP MUN PROFESSOR DR ALIPIO CORREA NETTO", 61:"HOSP MUN DR BENEDITO MONTENEGRO", 62:"HOSP MUN DR IGNACIO PROENCA DE GOUVEA",
63:"INSTITUTO DANTE PAZZANESE DE CARDIOLOGIA IDPC SAO PAULO", 64:"HOSPITAL INFANTIL CANDIDO FONTOURA SAO PAULO", 65:"HOSP DE TRANSPLANT DO EST DE SP EURYCLIDES DE JESUS ZERBINI", 66:"CASA DE SAUDE DE SAO JOAO DE DEUS", 67:"ASSOC CRUZ VERDE", 68:"CASA DE SAUDE NSRA DO CAMINHO",
69:"HOSPITAL NIPO BRASILEIRO", 70:"HOSPITAL DO RIM E HIPERTENSAO", 71:"HOSPITAL REGIONAL SUL SAO PAULO", 72:"HOSP NSRA DO PARI", 73:"INST CEMA DE OFTALMOLOGIA E OTORRINOLARINGOLOGIA", 74:"CENTRO DE OFTALMOLOGIA TADEU CVINTAL", 75:"HOSPITAL ESTADUAL DE SAPOPEMBA SAO PAULO",
76:"HOSPITAL GERAL DE VILA PENTEADO DR JOSE PANGELLA SAO PAULO", 77:"HOSPITAL PSIQUIATRICO DE VILA MARIANA", 78:"CASA DE DAVID SAO PAULO", 79:"HOSPITAL GERAL DE VILA NOVA CACHOEIRINHA SAO PAULO", 80:"INST SUEL ABUJAMRA", 81:"SANTA CASA DE SAO PAULO HOSPITAL CENTRAL SAO PAULO",
82:"HOSPITAL DIA DA REDE HORA CERTA PENHA MAURICE PATE", 83:"HOSP DO SERV PUB MUNICIPAL HSPM", 84:"HOSP MUN FERNANDO MAURO PIRES DA ROCHA", 85:"FUNDACAO FACULDADE DE MEDICINAHCFMUSP INST DE PSIQUIATRIA SP", 86:"CENTRO HOSPITALAR DO SISTEMA PENITENCIARIO SAO PAULO",
87:"HOSP MUN VER JOSE STOROPOLLI", 88:"HOSP MUN CARMEN PRUDENTE", 89:"INSTITUTO DE REABILITACAO LUCY MONTORO", 90:"HOSP MUN M BOI MIRIM", 91:"INSTITUTO DO CANCER DO ESTADO DE SAO PAULO", 92:"HOSPITAL DIA DA REDE HORA CERTA ITAIM PAULISTA", 93:"AME DR LUIZ ROBERTO BARRADAS BARATA SAO PAULO",
94:"UNAD UNIDADE DE ATENDIMENTO AO DEPENDENTE", 95:"HOSPITAL SANTO ANTONIO", 96:"HOSPITAL DIA DA REDE HORA CERTA LAPA", 97:"HOSP MUN GILSON DE CASSIA MARQUES DE CARVALHO"}

function initialize_health_centre_filter() {
    var lat = -23.557296000000001;
    var lng = -46.669210999999997;
    var latlng = new google.maps.LatLng(lat, lng);

    var options = {
        zoom: 11,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("specialty-map-filter"), options);
    load_health_centre_filtered();
}

function load_health_centre_filtered() {
    var path = '/points.json'
    $.getJSON(path, function(points) {
        $.each(points, function(index, point) {
            create_health_centre_marker(point, create_health_centre_info_box_text);
            info_boxes[point.id].marker.setVisible(false);
        });
    });

    create_legend();
    populate_legend();
}

function change_list() {
    var rad = document.getElementById("myForm");
    var prev = null;
    rad[0].onclick = function() {
        action('listSpecialty', specialty_id_array, "specialty");
    }
    rad[1].onclick = function() {
        action('listType', type_id_array, "type");
    }
    rad[2].onclick = function() {
        action("listRegion", region_id_array, "region")
    }
}

function action(path, ids, group_by) {
    //Remove list
    var list = document.getElementById("accordion");
    var element = list.parentNode
    console.log(element)
    if (list != null) {
        list.parentNode.removeChild(list);
    }

    //add new one
    var newElement = '<div class="panel-group" id="accordion">\n';
    $.getJSON(path, function(data) {
        console.log()
        $.each(data, function(index, type) {
            name = Object.keys(type);
            id = ids[name];

            newElement = newElement.concat("<div class=\"panel panel-default\">\n<div class=\"panel-heading\">\n<h4 class=\"panel-title\">\n<a data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#"+ id + "\"> ");
            newElement = newElement.concat(name + "</a>\n</h4>\n</div>\n<div id=\"" + id + "\" class=\"panel-collapse collapse\">\n<ul class=\"list-group\">");
            $.each(type[name], function(index, health_centre) {
                newElement = newElement.concat("<li class=\"list-group-item\"   onclick=\' filter_by( " + health_centre + ", " + id + ", \"" + group_by + "\")\'> " + health_centre_names[health_centre] + "</li>");
            });
            newElement = newElement.concat("</ul>\n</div>\n</div>\n");
        });
        newElement = newElement.concat("</div>\n");
        element.insertAdjacentHTML('beforeend', newElement);
    });  
}

function create_health_centre_info_box_text(point) {
    var id = point.id;
    // BUG, BUTTON NOT SHOWING UP
    var button_label = (cluster_status === false) ? 'Mostrar Detalhes' : 'Esconder Detalhes';
    return '<strong>Nome:</strong> ' + point.name + '<br><strong>Telefone:</strong> ' + point.phone + '<br><strong>Leitos:</strong> ' + point.beds + '<br><strong>Distrito Administrativo:</strong> ' + point.DA + '<br><strong>Prefeitura Regional:</strong> ' + point.PR
    + '<br><strong>Supervisão Técnica de Saúde:</strong> ' + point.STS + '<br><strong>Coordenadoria Regional de Saúde:</strong> ' + point.CRS;
}

function change_selected_health_centre(id) {
    if (info_box_opened !== id) {
        if ((typeof(info_box_opened) === 'number' && typeof(info_boxes[info_box_opened]) === 'object')) {
            // info_boxes[info_box_opened].marker.setIcon(health_centre_icon);
            info_boxes[info_box_opened].close();
        }
        // info_boxes[id].marker.setIcon();
        info_boxes[id].setContent(create_health_centre_info_box_text(info_boxes[id].point));
        open_info_box(info_boxes[id].id, info_boxes[id].marker);
    }
}

function filter_by(health_centre_id, id, name) {
    teardown_health_centre();
    teardown_circles();

    info_boxes[health_centre_id].marker.setVisible(true);

    change_selected_health_centre(health_centre_id);
    var point = info_boxes[info_box_opened].point;
    var latlng = new google.maps.LatLng(point.lat, point.long);
    map.setCenter(latlng);

    create_circles(info_boxes[info_box_opened].marker);
    show_procedures_filtered(health_centre_id, id, name);
    show_legend();
    map.setZoom(11);
}

function teardown_health_centre() {
    $.each(info_boxes, function(index, point) {
        if(index !== 0)
            point.marker.setVisible(false);
    });
}

function show_procedures_filtered(health_centre_id, id, name) {
    var procedure_path = ""
    if (name == "specialty")
        procedure_path = ["/health_centre_specialty", health_centre_id, id].join("/");
    else if (name == "type")
        procedure_path = ["/health_centre_type", health_centre_id, id].join("/");
    else
        procedure_path = ["/health_centre_region", health_centre_id, id].join("/");

    $.getJSON(procedure_path, function(procedures) {
        show_procedures(procedures, person_icon);
        create_circles(info_boxes[info_box_opened].marker);
    });
}

function show_legend() {
    $('#legend').show();
}
