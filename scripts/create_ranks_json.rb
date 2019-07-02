#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

@age_group = JSON.parse(File.read(Rails.root.join('public/age_group.json')))
@cid = JSON.parse(File.read(Rails.root.join('public/CID10.json')))

def create_rank(variable)
    rank = {}

    case variable
    when "health_centre"
        Procedure.group(:cnes_id).order("count_id DESC")
                        .count(:id).each.with_index do |p, i|
            rank[HealthCentre.find_by(cnes: p[0]).name.to_s] = p[1].to_i
        end
    when "DA"
        Procedure.group(:DA).order("count_id DESC")
                        .count(:id).each.with_index do |p, i|
            rank[p[0].to_s] = p[1].to_i
        end
    when "age"
        Procedure.group(:age_code).order("count_id DESC")
                        .count(:id).each.with_index do |p, i|
            rank[@age_group.detect{|e| e["id"] == p[0]}["text"]] = p[1].to_i
        end
    when "gender"
        Procedure.group(:gender).order("count_id DESC")
                        .count(:id).each.with_index do |p, i|
            rank[p[0] == "M" ? "Masculino" : "Feminino"] = p[1].to_i
        end
    when "CID"
        Procedure.group(:cid_primary).order("count_id DESC")
                        .count(:id).each.with_index do |p, i|
            if rank[@cid.detect{|e| e["id"] == p[0][0..2]}["text"]] then
                rank[@cid.detect{|e| e["id"] == p[0][0..2]}["text"]] += p[1].to_i 
            else
                rank[@cid.detect{|e| e["id"] == p[0][0..2]}["text"]] = p[1].to_i
            end
        end
        rank = rank.sort_by{|k, v| -v}.to_h
    else
        Procedure.group(:cnes_id).order("count_id DESC")
                        .count(:id).each.with_index do |p, i|
            rank[HealthCentre.find_by(cnes: p[0]).name.to_s] = p[1].to_i
        end
    end

	return rank
end

def main
    for variable in ["health_centre", "DA", "age", "gender", "CID"] do
        rank = create_rank(variable)

        fJson = File.open(Rails.root.join("public/rank_#{variable}.json"),"w")
        fJson.write(rank.to_json)
        fJson.close()
    end
end

main