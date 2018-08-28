#!/usr/bin/env ruby

require 'json'
require 'csv'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

def procedures_group 
    list = []
    procedures_path = File.join(__dir__, "csv/procedures_group.csv")
    CSV.foreach(procedures_path, :headers => true) do |row|
        hash = {}
        hash["id"] = row[0].to_s
		hash["text"] = row[1]
		list.push(hash)
    end

    return list
end

def main
	list = procedures_group()

	fJson = File.open(Rails.root.join("public/proc_re.json"),"w")
	fJson.write(list.to_json)
	fJson.close()
end

main