#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

def create_list
	list = []
	health_centres = HealthCentre.all
	health_centres.each do |hc|
		hash_aux = {}
		hash_aux["id"] = hc.cnes.to_s
		hash_aux["text"] = hc.name
		list.push(hash_aux)
	end

	return list
end

def main
	list = create_list()

	fJson = File.open(Rails.root.join("public/health_centres.json"),"w")
	fJson.write(list.to_json)
	fJson.close()
end

main