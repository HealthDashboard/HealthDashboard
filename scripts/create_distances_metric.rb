#!/usr/bin/env ruby

require 'json'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!

LABELS = ['1', '5', '10', '10+']

def get_procedures_distances(procedures)
    distances = Hash.new(0)
    procedures.each do |procedure|
        puts("Calculating distance metric for procedure #{procedure.id}...")
        if procedure.distance <= 1
            distances[LABELS[0]] += 1
        elsif procedure.distance <= 5
            distances[LABELS[1]] += 1
        elsif procedure.distance <= 10
            distances[LABELS[2]] += 1
        else
            distances[LABELS[3]] += 1
        end
    end

    return distances
end

def main()
  procedures = Procedure.all
  distances = get_procedures_distances(procedures)

  fJson = File.open("distance_metric.json","w")
  fJson.write(distances.to_json)
  fJson.close()
end

main()
