#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

def load_json(file)
  json_file = File.read(file)
  distances = JSON.parse(json_file)
end

def parse_location(location)
  lat, lng = location.split(',')
end

def find_procedure(procedures, lat, lng)
  procedures.find_by(lat: lat, long: lng)
end

def regularize_specialties(specialties, num_specialties)
  specialties.each do |specialty, time|
    specialties[specialty] = specialties[specialty] / num_specialties[specialty]
  end
end

def parse_distances(procedures, distances, specialties, num_specialties)
  distances.each do |location, time|
    lat, lng = parse_location(location)
    puts("#{lat}, #{lng}")
    procedure = find_procedure(procedures, lat, lng)

    if procedure == nil
      puts("Skipping #{lat}, #{lng}....\n\n")
      next
    end

    specialty = procedure.specialty.name
    if not specialties.key?(specialty)
      specialties[specialty] = 0
      num_specialties[specialty] = 0
    end

    specialties[specialty] += time
    num_specialties[specialty] += 1
  end

  regularize_specialties(specialties, num_specialties)
end

def main()
  specialties = {}
  num_specialties = {}
  #procedures = HealthCentre.find_by(name: "H RIM E HIPERTENSAO - F OSWALDO RAMOS").procedures
  #distances = load_json('travel_time_oswaldo_ramos.json')

  procedures = HealthCentre.find_by(name: "H CLINICAS").procedures
  distances = load_json('scripts/travel_time_hospital_clinicas.json')
  puts distances.count

  parse_distances(procedures, distances, specialties, num_specialties)
  puts(specialties.to_json)

  fJson = File.open("public/temp.json","w")
  fJson.write(specialties.to_json)
  fJson.close()

end

main()
