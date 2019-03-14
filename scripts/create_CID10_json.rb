#!/usr/bin/env ruby

require 'json'
require 'csv'

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

def getCID10_specific()
	cid10_path = File.join(Rails.root.join("public/CID-10-SUBCATEGORIAS.csv"))
	cid10_array = Hash.new

	CSV.foreach(cid10_path, :headers => true) do |row|
		if row[0].length > 3
			cid_two_char = row[0][0, row[0].length-1]
			if cid10_array[cid_two_char].nil?
				cid10_array[cid_two_char] = []
			end
            cid10_array[cid_two_char].push({"SUBCAT"=> row[0], "DESCRIC"=> row[1]})
		else
			if cid10_array[row[0]].nil?
				cid10_array[row[0]] = []
			end
            cid10_array[row[0]].push({"SUBCAT"=> row[0], "DESCRIC"=> row[1]})
        end
	end

	return cid10_array
end

def main()
	cid10_array = getCID10()
	puts('Save json file with CID10 codes')
	fJson = File.open(Rails.root.join("public/CID10.json"), "w")
	fJson.write(cid10_array.to_json)
	fJson.close()

	cid10_array = getCID10_specific()
	puts('Save json file with CID10 subcategories')
	fJson = File.open(Rails.root.join("public/CID-10-subcategorias.json"), "w")
	fJson.write(cid10_array.to_json)
	fJson.close()
end

main()