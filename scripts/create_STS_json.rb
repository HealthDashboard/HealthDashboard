#!/usr/bin/env ruby

require 'json'
require 'csv'

Rails.application.require_environment!

def procedures_group 
    list = []
    procedures_path = File.join(Rails.root.join("public/STS.csv"))
    CSV.foreach(procedures_path, :headers => true) do |row|
        hash = {}
        hash["id"] = row[0].to_s
		hash["text"] = row[0].to_s
		list.push(hash)
    end

    return list
end

def main
	list = procedures_group()

	fJson = File.open(Rails.root.join("public/STS.json"),"w")
	fJson.write(list.to_json)
	fJson.close()
end

main