#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

def create_statistic_values
  values = {}
  analysis = {}
  procedure_values = {}

  variables = [[:age_number, "Idade"],
								 [:days, "Total geral de diárias"],
								 [:days_uti, "Diárias UTI"],
								 [:days_ui, "Diárias UI"],
								 [:val_total, "Valor da parcela"],
								 [:days_total, "Dias de permanência"]]

  Procedure.all.each do |item|
    variables.each do |name, text|
      procedure_values[text] = [] if !procedure_values[text]
      procedure_values[text].append(item[name])
    end
  end

  for variable, text in variables do
    analysis["count"] = Procedure.count
    analysis["sum"] = Procedure.sum(variable)
    analysis["min"] = Procedure.minimum(variable)
    analysis["max"] = Procedure.maximum(variable)
    analysis["average"] = Procedure.average(variable).to_f.round(2)
    sum = procedure_values[text].inject(0){|accum, i| accum +(i-analysis["average"])**2}
    analysis["deviation"] = Math.sqrt(sum/(procedure_values[text].length - 1).to_f).round(2)

    values[text] = analysis
    analysis = {}
  end
	return values
end

def main
	values = create_statistic_values()

	fJson = File.open(Rails.root.join("public/statistic_values.json"),"w")
	fJson.write(values.to_json)
	fJson.close()
end

main