#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!


def create_specialty_distance_metric(specialty_id, specialties_distance_metric)
  procedures = Procedure.where(specialty_id: specialty_id)

  procedures.each do |procedure|
    if procedure.distance <= 1
      specialties_distance_metric[specialty_id][0] += 1
    elsif procedure.distance <= 5
      specialties_distance_metric[specialty_id][1] += 1
    elsif procedure.distance <= 10
      specialties_distance_metric[specialty_id][2] += 1
    else
      specialties_distance_metric[specialty_id][3] += 1
    end
  end

end

def create_specialties_distance_metric
  specialties_distance_metric = {}
  specialties = Specialty.all

  specialties.each do |specialty|
    id = specialty.id
    puts("Create metric for specialty #{id}...")
    specialties_distance_metric[id] = Array.new(4).fill(0)
    create_specialty_distance_metric(id, specialties_distance_metric)
  end

  return specialties_distance_metric
end

def main
  specialties_distance_metric = create_specialties_distance_metric()

  fJson = File.open("../public/specialties_distance_metric.json","w")
  fJson.write(specialties_distance_metric.to_json)
  fJson.close()
end

main()
