#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

def create_rank
	rank = {}
	procedures = Procedure.group(:cnes_id).order("procedures.count DESC").limit(10).count
	procedures.each do |p_count|
		health_centre = HealthCentre.find_by(:cnes => p_count[0])
		rank[health_centre.name] = p_count[1]
	end

	return rank
end

def main
	rank = create_rank()

	fJson = File.open(Rails.root.join("public/rank_health_centres.json"),"w")
	fJson.write(rank.to_json)
	fJson.close()
end

main