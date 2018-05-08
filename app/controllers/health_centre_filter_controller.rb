class HealthCentreFilterController < ApplicationController

 	@@ids = {2068974 => 1, 5437156 => 2, 2089696 => 3, 2091356 => 4, 2091542 => 5, 2091658 => 6, 7019076 => 7, 7378394 => 8, 7385978 => 9, 2028840 => 10, 2058391 => 11, 2058502 => 12, 2065665 => 13, 2066092 => 14, 2066572 => 15, 2069008 => 16, 2070766 => 17, 2071371 => 18, 2071568 => 19,
  	2075717 => 20, 2075962 => 21, 2076896 => 22, 2076926 => 23, 2076985 => 24, 2077388 => 25, 2077418 => 26, 2077426 => 27, 2077450 => 28, 2077469 => 29, 2077477 => 30, 2077485 => 31, 2077493 => 32, 2077507 => 33, 2077523 => 34, 2077531 => 35, 2077574 => 36, 2077590 => 37, 2077612 => 38,
  	2077620 => 39, 2077639 => 40, 2077655 => 41, 2077671 => 42, 2077701 => 43, 2077752 => 44, 2077957 => 45, 2078015 => 46, 2078287 => 47, 2078325 => 48, 2078589 => 49, 2079186 => 50, 2079240 => 51, 2080125 => 52, 2080346 => 53, 2080575 => 54, 2080583 => 55, 2080788 => 56, 2080818 => 57,
  	2081970 => 58, 2082225 => 59, 2082829 => 60, 2084139 => 61, 2084473 => 62, 2088495 => 63, 2088517 => 64, 2088576 => 65, 2089203 => 66, 2089572 => 67, 2089637 => 68, 2089777 => 69, 2089785 => 70, 2091313 => 71, 2091399 => 72, 2091550 => 73, 2091577 => 74, 2091585 => 75, 2091755 => 76,
  	2688514 => 77, 2688522 => 78, 2688573 => 79, 2688638 => 80, 2688689 => 81, 2751933 => 82, 2752077 => 83, 2786680 => 84, 2812703 => 85, 3001466 => 86, 3212130 => 87, 5420938 => 88, 5451612 => 89, 5718368 => 90, 6123740 => 91, 6136028 => 92, 6479200 => 93, 6585019 => 94, 6984649 => 95,
  	6998194 => 96, 7711980 => 97}

  @@region = ["dummy", "PIRITUBA / JARAGUA", "FREGUESIA / BRASILANDIA", "JABAQUARA", "VILA PRUDENTE", "SANTO AMARO", "ARICANDUVA / FORMOSA / CARRAO", "CAMPO LIMPO", "MBOI MIRIM", "VILA MARIANA", "CASA VERDE / CACHOEIRINHA", 
"SAO MIGUEL", "SAO MATEUS", "ITAQUERA", "PINHEIROS", "PENHA", "CIDADE TIRADENTES", "LAPA", "SAPOPEMBA", "GUAIANASES", "CAPELA DO SOCORRO", "SE", "BUTANTA", "ERMELINO MATARAZZO", "ITAIM PAULISTA", 
"IPIRANGA", "VILA MARIA / VILA GUILHERME", "SANTANA / TUCURUVI", "JACANA / TREMEMBE", "MOOCA"]
  
  # GET /
  def index
    @HealthCentreSpecialty = HealthCentreSpecialty.includes(:health_centre).order("specialty_id, health_centre_id").all.to_a
    @Specialties = Specialty.where("id < ?", 10).to_a
  end

  def listSpecialty
  	specialties = ["dummy", "CIRURGIA", "OBSTETRÍCIA", "CLINICA MÉDICA", "CUIDADOS PROLONGADOS", "PSIQUIATRIA", "TISIOLOGIA", "PEDIATRIA", "REABILITAÇÃO", "PSIQUIATRIA EM HOSPITAL-DIA"]
  	healthCentreSpecialty = HealthCentreSpecialty.where("specialty_id < ?", 10).order("specialty_id", "health_centre_id")
  	list = []
  	aux = 1
  	array = []
  	healthCentreSpecialty.each do |hcs|
  		if hcs.specialty_id !=  aux
  			list << {specialties[aux] => array}
  			aux = hcs.specialty_id
  			array = []
  		end
  		array << hcs.health_centre_id
  	end
  	if array != []
  		list << {specialties[aux] => array}
  	end

  	render json: list
  end

  def listType
  	treatments = ["dummy", "ELETIVO", "URGENCIA", "ACIDENTE NO LOCAL DE TRABALHO OU A SERVICO DA EMPRESA", "ACIDENTE NO TRAJETO PARA O TRABALHO", "OUTROS TIPOS DE ACIDENTE DE TRANSITO", "OUTROS TIPOS DE LESOES E ENVENENAMENTOS POR AGENTES QUIMICOS OU FISICOS"]
  	list = []
  	health_centre_type = Procedure.select("cnes_id", "treatment_type").group("cnes_id", "treatment_type").order("treatment_type", "cnes_id")
  	aux = 1
  	array = []
  	health_centre_type.each do |hct|
  		if hct.treatment_type != aux
  			list << {treatments[aux] => array}
  			aux = hct.treatment_type
  			array = []
  		end
  		array << @@ids[hct.cnes_id]
  	end
  	if array != []
  		list << {treatments[aux] => array}
  	end

  	render json: list
  end

  def listRegion
  	list = []
  	health_centre_pr = HealthCentre.select("id", "PR").order(:PR)
  	aux = health_centre_pr.first.PR
  	array = []
  	health_centre_pr.each do |hcp|
  		if hcp.PR != aux
  			list << {aux => array}
  			aux = hcp.PR
  			array = []
  		end
  		array << hcp.id
  	end
  	if array != []
  		list << {aux => array}
  	end
  	puts render json: list
  end

  # GET /health_centre_filter/analise/:id
  def analise
    hc = HealthCentre.find(params[:id]);
    procedures = Procedure.where(cnes_id: hc.cnes)
    if params[:name] == "region"
      puts @@region[params[:id_filter].to_i]
      procedures = procedures.where(PR: @@region[params[:id_filter].to_i])
    elsif params[:name] == "type"
      procedures = procedures.where(treatment_type: params[:id_filter])
    else
      procedures = procedures.where(specialty_id: params[:id_filter])
    end
      
    result = {"<= 1 Km" => procedures.where("distance <= ?", 1).count, ">= 1 Km e <= 5 Km" =>  procedures.where("distance > ? AND distance <= ?", 1, 5).count, ">= 5 Km e <= 10 Km" => procedures.where("distance > ? AND distance <= ?", 5, 10).count, ">= 10 Km" => procedures.where("distance > ?", 10).count}
    render json: result
  end
end
