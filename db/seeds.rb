require 'json'
require 'csv'
require 'rest-client'

AGE_CODE = ["TP_0A4", "TP_0A4", "TP_0A4", "TP_0A4", "TP_0A4", "TP_5A9", "TP_5A9", "TP_5A9",
 "TP_5A9", "TP_5A9", "TP_10A14", "TP_10A14", "TP_10A14", "TP_10A14", "TP_10A14", "TP_15A19", 
 "TP_15A19", "TP_15A19", "TP_15A19", "TP_15A19", "TP_20A24", "TP_20A24", "TP_20A24", "TP_20A24", 
 "TP_20A24", "TP_25A29", "TP_25A29", "TP_25A29", "TP_25A29", "TP_25A29", "TP_30A34", "TP_30A34", 
 "TP_30A34", "TP_30A34", "TP_30A34", "TP_35A39", "TP_35A39", "TP_35A39", "TP_35A39", "TP_35A39", 
 "TP_40A44", "TP_40A44", "TP_40A44", "TP_40A44", "TP_40A44", "TP_45A49", "TP_45A49", "TP_45A49", 
 "TP_45A49", "TP_45A49", "TP_50A54", "TP_50A54", "TP_50A54", "TP_50A54", "TP_50A54", "TP_55A59", 
 "TP_55A59", "TP_55A59", "TP_55A59", "TP_55A59", "TP_60A64", "TP_60A64", "TP_60A64", "TP_60A64", 
 "TP_60A64", "TP_65A69", "TP_65A69", "TP_65A69", "TP_65A69", "TP_65A69", "TP_70A74", "TP_70A74", 
 "TP_70A74", "TP_70A74", "TP_70A74", "TP_75A79", "TP_75A79", "TP_75A79", "TP_75A79", "TP_75A79", 
 "TP_80A84", "TP_80A84", "TP_80A84", "TP_80A84", "TP_80A84", "TP_85A89", "TP_85A89", "TP_85A89", 
 "TP_85A89", "TP_85A89", "TP_90A94", "TP_90A94", "TP_90A94", "TP_90A94", "TP_90A94", "TP_95A99", 
 "TP_95A99", "TP_95A99", "TP_95A99", "TP_95A99", "TP_100OUMA"]

def get_age_code(age)
  if age >= 0 && age <= 99
    return AGE_CODE[age]
  elsif age > 99
    return AGE_CODE[100]
  else
    return nil
  end
end


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
    h = HealthCentre.new cnes: row[0], name: row[1], name_r: row[2], beds: row[3], lat: row[4], long: row[5], 
    phone: row[8], adm: row[9], DA: row[10], PR: row[11], STS: row[12], CRS: row[13]
    h.save!
    hc_counter += 1
    print "."
  end
  puts ""
  puts "#{hc_counter} Health Centres successfully created"
end

def create_procedures()
  puts "Saving SIH data."
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
  counter = 0
  list  = []
  CSV.foreach(procedure_csv_path, :headers => true) do |row|

    age_code = get_age_code(row[15].to_i)
    spec = specialties[row[3].to_i]
    p = Procedure.new long: row[1], lat: row[2], specialty: spec, cmpt: row[4], date: row[5], date_in: row[6], 
    date_out: row[7], proce_re: row[8], treatment_type: row[9], cid_primary: row[10], cid_secondary: row[11],
    cid_secondary2: row[12], gender: row[13], race: row[14], age_number: row[15], age_code: age_code, lv_instruction: row[16],
    gestor_ide: row[17], days: row[18], days_uti: row[19], days_ui: row[20], complexity: row[21], finance: row[22],
    val_total: row[23], days_total: row[24], cnes_id: row[25], DA: row[32], PR: row[33], STS: row[34], CRS: row[35]
    p.distance = p.calculate_distance
    list << p

    counter += 1    
    if counter == 1000
      Procedure.import list
      list = []

      procedures_counter += counter
      counter = 0
      progress = ((procedures_counter.to_f / 554202.0) * 100.0)
      printf("\rProgress: [%-100s] %d%%", "=" * progress, progress)
    end
  end

  Procedure.import list
  printf("\rProgress: [%-100s] %d%%", "=" * 100, 100)
  procedures_counter += counter
  puts ""
  puts "#{procedures_counter} rows successfully saved"
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

def addTypes
  Type.create id: 0, name: "HOSPITAL/DIA - ISOLADO"
  Type.create id: 1, name: "HOSPITAL GERAL"
  Type.create id: 2, name: "HOSPITAL ESPECIALIZADO"
  Type.create id: 3, name: "CLÍNICA/CENTRO DE ESPECIALIDADE"
end

def linkTypeHealthCentre
  hc_csv_path = File.join(__dir__, "csv/health_centres_real.csv")
  hc_counter = 0
    CSV.foreach(hc_csv_path, :headers => true) do |row|
      t = Type.find_by(name: row[6])
      HealthCentre.find_by(cnes: row[0]).types << t
      hc_counter += 1
      print "."
    end
    puts ""
    puts "#{hc_counter} Health Centres successfully updated"
end

get_health_centres()
get_specialties()
create_procedures()
health_centre_specialty()
addTypes()
linkTypeHealthCentre()