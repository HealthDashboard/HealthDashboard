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

$hc_specialties_array = {}

def infer_health_centre_specialty(health_centre, health_centres_specialties)
  id = health_centre.id
  health_centre.procedures.each do |procedure|
    break if health_centres_specialties[id].size() == NUMBER_OF_SPECIALTIES

    specialty = procedure.specialty.id
    next if health_centres_specialties[id].include?(specialty)
    next if specialty == nil
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
    puts("Infering specialties for #{health_centre.name} ...")
    health_centres_specialties[health_centre.id] = Set.new []
    infer_health_centre_specialty(health_centre, health_centres_specialties)
    specialties_array = get_specialties_array(health_centres_specialties[health_centre.id])
    specialties_array = specialties_array.reject(&:blank?)
    # puts specialties_array.lenth
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
      next if procedure.cnes == nil
      next if procedure.cnes.id == id
      flag = false
      procedure.cnes.types.each do |type|
        health_centre.types.each do |type_hc|
          flag = true if type.id == type_hc.id
          break if flag
        end
      end
      next if not flag
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
        next if procedure.cnes.id == id
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

#New method ***********************************************

def health_centres_specialties(procedures, health_centres)
  spec = Specialty.second
  puts spec.name
  h = HealthCentreSpecialty.where(specialty_id: spec.id)
  # puts h
  h.each do |hc|
    puts hc.health_centre_id
  end
end

def main()
  health_centres = HealthCentre.all
  procedures = Procedure.all

  health_centres_specialties(procedures, health_centres)

  $hc_specialties_array.each_with_index do |hcs, index|
    puts index
    hcs.each do |hc|
      puts hc;
    end

  end
  # health_centres_specialties = {} 

  # generate_global_specialties()

  # puts('Infering all health centre specialties')
  # infer_all_health_centre_specialty(health_centres, health_centres_specialties)
  # puts("\n")

  # puts('Count number of procedures that could be attended in a closer health centre')
  # count = count_closest_health_centres(procedures, health_centres_specialties, health_centres)
  # puts("\n")

  # puts('Count number of procedures of a given health centre that could be made in a closer health centre')
  # health_centre_count = get_number_of_closest_health_centres_procedures_by_health_centre(health_centres, health_centres_specialties)
  # puts("\n\n")

  # metric = {'count': count, 'health_centre_count': health_centre_count}

  # puts('Save json file with results')
  # fJson = File.open(Rails.root.join("public/metrics.json"),"w")
  # fJson.write(metric.to_json)
  # fJson.close()

end

main()
