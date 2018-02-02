#!/usr/bin/env ruby

require 'json'
require 'csv'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!


def getCID10()
	cid10_path = File.join(Rails.root.join("db/csv/CID10.csv"))
	cid10_array = []

	CSV.foreach(cid10_path, :headers => true) do |row|
		cid10_each = {}
		cid10_each["id"] = row[0]
		cid10_each["text"] = row[0] + " - " + row[1]
		cid10_array.push(cid10_each)
	end

	return cid10_array
end

def main()
	cid10_array = getCID10()
	puts('Save json file with results')
	fJson = File.open(Rails.root.join("public/CID10.json"), "w")
	fJson.write(cid10_array.to_json)
	fJson.close()
end

main()