#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

def variables_metric
    health_centres = JSON.parse(File.read(Rails.root.join('public/health_centres.json')))
    age_group = JSON.parse(File.read(Rails.root.join('public/age_group.json')))
    specialties = JSON.parse(File.read(Rails.root.join('public/specialties.json')))
    treatments = [
        { "id" => "1", "text" => "Eletivo" },
        { "id" => "2", "text" => "Urgencia" },
        { "id" => "3", "text" => "Acidente No Local De Trabalho Ou A Servico Da Empresa" },
        { "id" => "5", "text" => "Outros Tipos De Acidente De Transito" },
        { "id" => "6", "text" => "Outros Tipos De Lesoes E Envenenamentos Por Agentes Quimicos Ou Fisicos" },
    ];
    race = JSON.parse(File.read(Rails.root.join('public/race.json')))
    lv_instruction = JSON.parse(File.read(Rails.root.join('public/lv_instruction.json')))
    cmpt = JSON.parse(File.read(Rails.root.join('public/cmpt.json')))
    cid = JSON.parse(File.read(Rails.root.join('public/CID10.json')))
    finance = JSON.parse(File.read(Rails.root.join('public/finance.json')))
    da = JSON.parse(File.read(Rails.root.join('public/DA.json')))
    pr = JSON.parse(File.read(Rails.root.join('public/PR.json')))
    sts = JSON.parse(File.read(Rails.root.join('public/STS.json')))
    crs = JSON.parse(File.read(Rails.root.join('public/CRS.json')))
    complexity = JSON.parse(File.read(Rails.root.join('public/complexity.json')))
    gestor = [{"id" => "00", "text" => "ESTADUAL"},
                {"id" => "01", "text" => "MUNICIPAL"}];
    procedures = Procedure.all
    result = Hash.new
    variables = [:cnes_id, :cmpt, :proce_re, :specialty_id, :treatment_type, :cid_primary, :cid_secondary, 
        :cid_secondary2, :complexity, :finance, :age_code, :race, :lv_instruction,
        :gender, :DA, :PR, :STS, :CRS, :gestor_ide, :days, :days_uti, :days_ui, :days_total, :val_total, :distance];
    data = []
    variables.each do |var|
        data = []
        procedures.group(var).count.each.with_index do |key, _index|
            data.append([key[0], key[1]])
        end
        result[var.to_s] = data
    end
    # Replace the values - HEALTH_CENTRES
    health_centres_aux = health_centres.map{|x| x["id"]}
    result["cnes_id"].each.with_index do |key, index|
        unless key.nil?
            indexAux = health_centres_aux.find_index(key[0].to_s)
            result["cnes_id"][index][0] = health_centres[indexAux]["text"]
        end
    end
        
    # Replace the values - CMPT
    #cmpt_aux = cmpt.map{|x| x["id"]}
    #result["cmpt"].each.with_index do |key, index|
    #    unless key.nil?
    #        indexAux = cmpt_aux.find_index(key[0].to_s)
    #        result["cmpt"][index][0] = cmpt[indexAux]["text"]
    #    end
    #end

    # Replace the values - TREATMENT_TYPE
    treatment_type_aux = treatments.map{|x| x["id"]}
    result["treatment_type"].each.with_index do |key, index|
        unless key.nil?
            indexAux = treatment_type_aux.find_index(key[0].to_s)
            result["treatment_type"][index][0] = treatments[indexAux]["text"]
        end
    end

    # Replace the values - COMPLEXITY
    complexity_aux = complexity.map{|x| x["id"].to_s}
    result["complexity"].each.with_index do |key, index|
        unless key.nil?
            key[0] = "0"+key[0].to_s
            indexAux = complexity_aux.find_index(key[0].to_s)
            result["complexity"][index][0] = complexity[indexAux]["text"]
        end
    end

    # Replace the values - FINANCE
    finance_aux = finance.map{|x| x["id"].to_s}
    result["finance"].each.with_index do |key, index|
        unless key.nil?
            key[0] = "0"+key[0].to_s
            indexAux = finance_aux.find_index(key[0].to_s)
            result["finance"][index][0] = finance[indexAux]["text"]
        end
    end

    # Replace the values - AGE_CODE
    age_code_aux = age_group.map{|x| x["id"].to_s}
    result["age_code"].each.with_index do |key, index|
        unless key.nil?
            indexAux = age_code_aux.find_index(key[0].to_s)
            result["age_code"][index][0] = age_group[indexAux]["text"]
        end
    end

    # Replace the values - RACE
    race_aux = race.map{|x| x["id"].to_s}
    result["race"].each.with_index do |key, index|
        unless key.nil?
            if (key[0].to_s).length < 2
                key[0] = "0"+key[0].to_s
            end
            indexAux = race_aux.find_index(key[0].to_s)
            result["race"][index][0] = race[indexAux]["text"]
        end
    end

    # Replace the values - LV_INSTRUCTION
    lv_instruction_aux = lv_instruction.map{|x| x["id"].to_s}
    result["lv_instruction"].each.with_index do |key, index|
        unless key.nil?
            indexAux = lv_instruction_aux.find_index(key[0].to_s)
            result["lv_instruction"][index][0] = lv_instruction[indexAux]["text"]
        end
    end

    # Replace the values - GESTOR
    gestor_aux = gestor.map{|x| x["id"].to_s}
    result["gestor_ide"].each.with_index do |key, index|
        unless key.nil?
            key[0] = "0"+key[0].to_s
            indexAux = gestor_aux.find_index(key[0].to_s)
            result["gestor_ide"][index][0] = gestor[indexAux]["text"]
        end
    end

    # Replace the values - SPECIALTIES
    specialties_aux = specialties.map{|x| x["id"].to_s}
    result["specialty_id"].each.with_index do |key, index|
        unless key.nil?
            key[0] = key[0].to_s
            unless specialties_aux.find_index(key[0].to_s).nil?
                indexAux = specialties_aux.find_index(key[0].to_s)
                result["specialty_id"][index][0] = specialties[indexAux]["text"]
            end
        end
    end

    # Replace the values - DISTANCE
    result["distance"].each.with_index do |key, index|
        unless key.nil?
            key[0] = '%.2f' % key[0].to_f
            result["distance"][index][0] = (key[0].to_s).gsub('.', ',')
        end
    end

    # Replace the values - VAL_TOTAL
    result["val_total"].each.with_index do |key, index|
        unless key.nil?
            key[0] = '%.2f' % key[0].to_f
            result["val_total"][index][0] = (key[0].to_s).gsub('.', ',')
        end
    end

    # Replace the values - CID_PRIMARY
    #"cid_primary", "cid_secondary", "cid_secondary2"
    cid_primary_aux = cid.map{|x| x["id"].to_s}
    result["cid_primary"].each.with_index do |key, index|
        unless key.nil?
            key[0] = key[0].to_s
            unless cid_primary_aux.find_index(key[0].to_s).nil?
                indexAux = cid_primary_aux.find_index(key[0].to_s)
                result["cid_primary"][index][0] = cid[indexAux]["text"]
            end
        end
    end

    cid_secondary_aux = cid.map{|x| x["id"].to_s}
    result["cid_secondary"].each.with_index do |key, index|
        unless key.nil?
            key[0] = key[0].to_s
            unless cid_secondary_aux.find_index(key[0].to_s).nil?
                indexAux = cid_secondary_aux.find_index(key[0].to_s)
                result["cid_secondary"][index][0] = cid[indexAux]["text"]
            end
        end
    end

    cid_secondary2_aux = cid.map{|x| x["id"].to_s}
    result["cid_secondary2"].each.with_index do |key, index|
        unless key.nil?
            key[0] = key[0].to_s
            unless cid_secondary2_aux.find_index(key[0].to_s).nil?
                indexAux = cid_secondary2_aux.find_index(key[0].to_s)
                result["cid_secondary2"][index][0] = cid[indexAux]["text"]
            end
        end
    end

	return result
end

def main
  variables_metric = variables_metric()

  fJson = File.open(Rails.root.join("public/variables_metric.json"),"w")
  fJson.write(variables_metric.to_json)
  fJson.close()
end

main()
