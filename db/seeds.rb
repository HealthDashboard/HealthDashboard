require 'json'
require 'csv'
require 'rest-client'

ENV["RESOURCE_CATALOGUER_HOST"] ||= '143.107.45.126:30134/catalog/'
ENV["DATA_COLLECTOR_HOST"] ||= '143.107.45.126:30134/collector/'

AGE_GROUP = ["TP_0A4", "TP_5A9", "TP_10A14", "TP_15A19", "TP_20A24", "TP_25A29", "TP_30A34",
             "TP_35A39", "TP_40A44", "TP_45A49", "TP_50A54", "TP_55A59", "TP_60A64", "TP_65A69",
             "TP_70A74", "TP_75A79", "TP_80A84", "TP_85A89", "TP_90A94", "TP_95A99", "TP_100OUMA"]


def get_specialties()
  puts "Saving Specialties."
  specialties_csv_path = File.join(__dir__, "csv/specialties.csv")
  spec_counter = 0
  CSV.foreach(specialties_csv_path, :headers => false) do |row|
    Specialty.create id: row[0], name: row[1]
    spec_counter += 1
    print "."
  end
  puts ""
  puts "#{spec_counter} specialties successfully created."
end

def get_health_centres()
  puts "Getting Health Centres."
  hc_csv_path = File.join(__dir__, "csv/health_centres_real.csv")

  hc_counter = 0
  CSV.foreach(hc_csv_path, :headers => true) do |row|
    h = HealthCentre.new cnes: row[0], name: row[1], beds: row[2], long: row[3], lat: row[4]
    h.procedure_count = 0
    h.save!
    hc_counter += 1
    print "."
  end
  puts ""
  puts "#{hc_counter} Health Centres successfully created"
end

def create_procedures()
  puts "Saving procedures."
  procedure_csv_path = File.join(__dir__, "csv/procedures.csv")
  specialties = []
  health_centres = {}

  Specialty.all.each do |specialty|
    specialties[specialty.id] = specialty
  end

  HealthCentre.all.each do |health_centre|
    health_centres[health_centre.cnes] = health_centre
  end

  procedures_counter = 0
  CSV.foreach(procedure_csv_path, :headers => true) do |row|

    age_code = get_age_code(row[4].to_i)
    spec = specialties[row[17].to_i]

    p = Procedure.new cnes_id: row[9], lat: row[1], long: row[2], gender: row[3], age_number: row[4], date: row[13], specialty: spec, cid_primary: row[19], 
    cid_secondary: row[20], cid_associated: row[21], treatment_type: row[11], age_code: age_code, race: row[5], region: row[33]
    p.distance = p.calculate_distance
    p.save!
    print "."
    procedures_counter += 1
  end

  puts ""
  puts "#{procedures_counter} procedures successfully created"
end

def procedures_counter()
  Procedure.group(:cnes_id).count.each do |data|
    health_centre = HealthCentre.find_by(cnes: data[0])
    health_centre.procedure_count = data[1]
    health_centre.save!
  end
end

def health_centre_specialty()
  HealthCentre.all.each do |health_centre|
    Specialty.all.each do |specialty|
      if Procedure.where(specialty_id: specialty.id, cnes: health_centre.cnes).count > 0
        HealthCentreSpecialty.create({:health_centre => health_centre, :specialty => specialty})
      end
    end
  end
end

def get_age_code(age)
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

get_health_centres()
get_specialties()
create_procedures()
procedures_counter()
health_centre_specialty()
