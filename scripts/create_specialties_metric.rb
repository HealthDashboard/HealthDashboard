#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

def get_all_procedures_with_specialty(id)
  Procedure.where(specialty_id: id)
end

def create_specialty_metric(id, procedures, specialties_metric)
  count_types = Array.new(10).fill(0)

  procedures.each do |procedure|
    types = procedure.cnes.types

    types.each do |type|
      specialties_metric[id][type.id] += procedure.distance
      count_types[type.id] += 1
    end
  end

  for i in 1..9
    next if specialties_metric[id][i] == 0
    specialties_metric[id][i] /= count_types[i]
  end
end

def create_metric_for_all_specialties
  specialties_metric = Hash.new([])

  for id in 1..9
    specialties_metric[id] = Array.new(10).fill(0)
    specialty_name = Specialty.find_by(id: id).name
    puts("Calculating metric for specialty: #{specialty_name}...")
    procedures = get_all_procedures_with_specialty(id)

    create_specialty_metric(id, procedures, specialties_metric)
  end

  return specialties_metric
end

def main
  specialties_metric = create_metric_for_all_specialties()

  fJson = File.open("../public/specialties_metric.json","w")
  fJson.write(specialties_metric.to_json)
  fJson.close()
end

main()
