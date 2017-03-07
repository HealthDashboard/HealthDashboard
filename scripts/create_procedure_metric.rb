#!/usr/bin/env ruby

require 'json'
require 'set'

APP_PATH = File.expand_path('../../config/application',  __FILE__)
require File.expand_path('../../config/boot',  __FILE__)
require APP_PATH
## set Rails.env here if desired
Rails.application.require_environment!


NUMBER_OF_SPECIALTIES = 9
$global_specialties = []


def infer_health_centre_specialty(health_centre, health_centres_specialties)
  id = health_centre.id
  health_centre.procedures.each do |procedure|
    break if health_centres_specialties[id].size() == NUMBER_OF_SPECIALTIES

    specialty = procedure.specialty.id
    next if health_centres_specialties[id].include?(specialty)

    health_centres_specialties[id].add(specialty)
  end
end

def get_specialties_array(specialties_set)
  specialties_array = []
  specialties_set.each do |id|
    specialties_array.push($global_specialties[id])
  end

  return specialties_array
end

def infer_all_health_centre_specialty(health_centres, health_centres_specialties)
  health_centres.each do |health_centre|
    next if health_centre.specialties != []

    puts("Infering specialties for #{health_centre.name} ...")
    health_centres_specialties[health_centre.id] = Set.new []
    infer_health_centre_specialty(health_centre, health_centres_specialties)
    specialties_array = get_specialties_array(health_centres_specialties[health_centre.id])
    health_centre.specialties = specialties_array
    health_centre.save()
  end
end

def count_closest_health_centres(procedures, health_centres_specialties, health_centres)
  count = 0

  procedures.each do |procedure|
    puts("Looking for closer health centre for procedure #{procedure.id}...")
    smaller_dist = procedure.calculate_distance

    health_centres.each do |health_centre|
      id = health_centre.id
      next if procedure.cnes.id == id
      next if not health_centres_specialties[id].include?(procedure.specialty.id)

      dist = Geocoder::Calculations.distance_between([procedure.lat, procedure.long], [health_centre.lat, health_centre.long])

      if dist < smaller_dist
        count += 1
        break
      end
    end
    
  end

  return count
end

def get_number_of_closest_health_centres_procedures_by_health_centre(health_centres, health_centres_specialties)
  health_centre_count = {}
  health_centres.each do |health_centre|
    id = health_centre.id
    health_centre_count[id] = 0
    procedures = health_centre.procedures

    procedures.each do |procedure|
      smaller_dist = procedure.calculate_distance
      health_centres.each do |hc|
        next if hc.id == id
        next if not health_centres_specialties[hc.id].include?(procedure.specialty.id)

        dist = Geocoder::Calculations.distance_between([procedure.lat, procedure.long], [hc.lat, hc.long])

        if dist < smaller_dist
          health_centre_count[id] += 1
          break
        end
      end
    end
  end

  return health_centre_count
end

def generate_global_specialties()
  $global_specialties.push(-1)
  for i in 1..9
    $global_specialties.push(Specialty.find_by(id: i))
  end
end

def main()
  health_centres = HealthCentre.all[1..10]
  procedures = [Procedure.last, Procedure.first]
  health_centres_specialties = {} 

  generate_global_specialties()

  puts('Infering all health centre specialties')
  infer_all_health_centre_specialty(health_centres, health_centres_specialties)
  puts("\n")

  puts('Count number of procedures that could be attended in a closer health centre')
  count = count_closest_health_centres(procedures, health_centres_specialties, health_centres)
  puts("\n")

  puts('Count number of procedures of a given health centre that could be made in a closer health centre')
  health_centre_count = get_number_of_closest_health_centres_procedures_by_health_centre(health_centres, health_centres_specialties)
  puts("\n\n")

  metric = {'count': count, 'health_centre_count': health_centre_count}

  puts('Save json file with results')
  fJson = File.open("metrics.json","w")
  fJson.write(metric.to_json)
  fJson.close()

end

main()
