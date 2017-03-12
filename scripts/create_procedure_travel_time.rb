#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

def get_procedures_travel_time
  h1 = File.open('scripts/travel_time_hospital_clinicas.json', 'r')
  h2 = File.open('scripts/travel_time_oswaldo_ramos.json', 'r')

  data1 = JSON.parse h1.read()
  data2 = JSON.parse h2.read()

  hospital_clinicas = HealthCentre.find 38
  hospital_oswaldo_ramos = HealthCentre.find 63

  procedures_h1 = hospital_clinicas.procedures
  procedures_h2 = hospital_oswaldo_ramos.procedures

  result = {}
  Specialty.all.each {|s| result[s.name] = [0,0] }

  procedures_h1.each do |procedure|
    value = data1["#{procedure.lat},#{procedure.long}"]

    if value
       result[procedure.specialty.name][0] += value.to_i
       result[procedure.specialty.name][1] += 1
    end
  end

  procedures_h2.each do |procedure|
    value = data1["#{procedure.lat},#{procedure.long}"]

    if value
       result[procedure.specialty.name][0] += value.to_i
       result[procedure.specialty.name][1] += 1
    end
  end

  result.each do |k,v|
    if v[1] != 0
      result[k] = ((v[0]/v[1])/60.0).round 2
    else
      result[k] = 0
    end
  end

  h1.close
  h2.close

  result
end

def main()
  procedures = get_procedures_travel_time

  fJson = File.open("public/procedures_travel_time.json","w")
  fJson.write(procedures.to_json)
  fJson.close()
end

main()
