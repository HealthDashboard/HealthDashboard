#!/usr/bin/env ruby

require 'json'

Rails.application.require_environment!

def completeness_list
    filters_name = ["cnes_id", "cmpt", "proce_re", "specialty_id", "treatment_type", "cid_primary", "cid_secondary", "cid_secondary2",
			"complexity", "finance", "age_code", "race", "lv_instruction", "DA", "PR", "STS", "CRS", "gestor_ide"]

    sliders_name = ["days", "days_uti", "days_ui", "days_total", "val_total", "distance"]

    filters_completeness = []
    sliders_completeness = []

    # Values for completeness at each filter
    filters_name.each.with_index do |name, i|
        if name == "race"
            freq = Procedure.where(name.to_sym => '99').count.to_f
            # puts freq.round(3) 
        elsif name != "gestor_ide" and name != "lv_instruction"
            freq = Procedure.where(name.to_sym => [nil, '0']).count.to_f
        else
            freq = Procedure.where(name.to_sym => nil).count.to_f
        end
        filters_completeness[i] = ((1 - (freq / Procedure.all.count)) * 100).round(2)
    end

    # Values for completeness at each slider
    sliders_name.each.with_index do |name, i|
        freq = Procedure.where(name.to_sym => '0').count.to_f
        sliders_completeness[i] = ((1 - (freq / Procedure.all.count)) * 100).round(2)
		end

    completeness = {
        :filters => filters_completeness,
        :sliders => sliders_completeness
    }

    return completeness

end

def main
	hash = completeness_list()

	fJson = File.open(Rails.root.join("public/completeness.json"),"w")
	fJson.write(hash.to_json)
	fJson.close()
end

main()