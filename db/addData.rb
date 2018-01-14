require 'csv'


AGE_GROUP = [ "TP_0A4", "TP_5A9", "TP_10A14", "TP_15A19", "TP_20A24", "TP_25A29", "TP_30A34",
              "TP_35A39", "TP_40A44", "TP_45A49", "TP_50A54", "TP_55A59", "TP_60A64", "TP_65A69",
              "TP_70A74", "TP_75A79", "TP_80A84", "TP_85A89", "TP_90A94", "TP_95A99", "TP_100OUMA"]

def get_age_code age
  if age >= 0 && age <= 4
    return AGE_GROUP[0]
  elsif age >= 5 && age <= 9
    return AGE_GROUP[1]
  elsif age >= 10 && age <= 14
    return AGE_GROUP[2]
  elsif age >= 15 && age <= 19
    return AGE_GROUP[3]
  elsif age >= 20 && age <= 24
    return AGE_GROUP[4]
  elsif age >= 25 && age <= 29
    return AGE_GROUP[5]
  elsif age >= 30 && age <= 34
    return AGE_GROUP[6]
  elsif age >= 35 && age <= 39
    return AGE_GROUP[7]
  elsif age >= 40 && age <= 44
    return AGE_GROUP[8]
  elsif age >= 45 && age <= 49
    return AGE_GROUP[9]
  elsif age >= 50 && age <= 54
    return AGE_GROUP[10]
  elsif age >= 55 && age <= 59
    return AGE_GROUP[11]
  elsif age >= 60 && age <= 64
    return AGE_GROUP[12]
  elsif age >= 65 && age <= 69
    return AGE_GROUP[13]
  elsif age >= 70 && age <= 74
    return AGE_GROUP[14]
  elsif age >= 75 && age <= 79
    return AGE_GROUP[15]
  elsif age >= 80 && age <= 84
    return AGE_GROUP[16]
  elsif age >= 85 && age <= 89
    return AGE_GROUP[17]
  elsif age >= 90 && age <= 94
    return AGE_GROUP[18]
  elsif age >= 95 && age <= 99
    return AGE_GROUP[19]
  elsif age >= 100
    return AGE_GROUP[20]
  else
    return AGE_GROUP[0]
  end
end

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

create_procedures()