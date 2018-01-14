require 'csv'

def create_procedures()
  hc_csv_path = File.join(__dir__, "csv/procedures.csv")
  counter = 0

  # spec_items = {}
  procedures_counter = 0
  CSV.foreach(hc_csv_path, :headers => true) do |row|

  	counter += 1
  	next if counter < 52153

    age_code = get_age_code(row[4].to_i)
    spec = nil
    if row[17].to_i > 1 and row[17].to_i <= 9
      spec = Specialty.where(id: row[17].to_i).first
    else
      spec = Specialty.where(id: 10).first
    end

    hc = HealthCentre.where(cnes: row[9].to_i).first
    specialty = {}

    if hc != nil
      if spec.id != 10 
        specialty[:health_centre] = hc
        specialty[:specialty] = spec
        HealthCentreSpecialty.create(specialty)
      end
    end

    p = Procedure.create cnes_id: row[9], lat: row[1], long: row[2], gender: row[3], age_number: row[4], date: row[13], specialty: spec, cid_primary: row[19], cid_secondary: row[20], cid_associated: row[21], treatment_type: row[11], age_code: age_code, race: row[5], region: row[33]
    p.distance = p.calculate_distance
    p.distance_count = 0
    # Figure out if there're a health centre closer to the pacient
    health_centres_specialty = HealthCentreSpecialty.where(specialty_id: p.specialty_id)
    health_centres_specialty.each { |hcs|
      centre = hcs.health_centre
      result = p.calculate_distance_to(centre.lat, centre.long)
      if result == true
        p.distance_count = 1
        break
      end
    }
    p.save!
    
    if hc != nil
      if hc.procedure_count == nil
        hc.procedure_count = 0
      end
      hc.procedure_count += 1
      hc.save!
    end

    procedures_counter += 1
  end
  puts "#{procedures_counter} procedures successfully created"
end