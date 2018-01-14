require 'json'
require 'csv'
require 'rest-client'


ENV["RESOURCE_CATALOGUER_HOST"] ||= '143.107.45.126:30134/catalog/'
ENV["DATA_COLLECTOR_HOST"] ||= '143.107.45.126:30134/collector/'

AGE_GROUP = [ "TP_0A4", "TP_5A9", "TP_10A14", "TP_15A19", "TP_20A24", "TP_25A29", "TP_30A34",
              "TP_35A39", "TP_40A44", "TP_45A49", "TP_50A54", "TP_55A59", "TP_60A64", "TP_65A69",
              "TP_70A74", "TP_75A79", "TP_80A84", "TP_85A89", "TP_90A94", "TP_95A99", "TP_100OUMA"]


def get_specialties  
  specialties_csv_path = File.join(__dir__, "csv/specialties.csv")

  spec_items = {}

  CSV.foreach(specialties_csv_path, :headers => false) do |row|
    s = Specialty.create id: row[0], name: row[1]
    spec_items[s.name] = s.id
  end

  puts "#{spec_items.count} specialties successfully created."
  spec_items
end

def get_types
  # types_csv_path = File.join(__dir__, "csv/type.csv")

  # types = {}

  # CSV.foreach(types_csv_path, :headers => false) do |row|
  #   t = Type.create id: row[0].to_i, name: row[1]
  #   types[t.name] = t.id
  # end

  # puts "#{types.count} types successfully create"
  # types
  types = {}
  t = Type.create id: 1, name: "ELETIVO"
  types[t.name] = t.id
  t = Type.create id: 2, name: "URGÊNCIA"
  types[t.name] = t.id
  t = Type.create id: 3, name: "ACIDENTE NO LOCAL DE TRABALHO OU A SERVICO DA EMPRESA"
  types[t.name] = t.id
  t = Type.create id: 4, name: "ACIDENTE NO TRAJETO PARA O TRABALHO"
  types[t.name] = t.id
  t = Type.create id: 5, name: "OUTROS TIPOS DE ACIDENTE DE TRANSITO"
  types[t.name] = t.id
  t = Type.create id: 6, name: "OUTROS TIPOS DE LESOES E ENVENENAMENTOS POR AGENTES QUIMICOS OU FISICOS"
  types[t.name] = t.id
  types
end  


# def get_resources
#   begin
#     response = RestClient.get(
#       ENV["RESOURCE_CATALOGUER_HOST"] + "resources/search?capability=medical_procedure",
#     )
#     #puts "Success in get data"
#   rescue RestClient::Exception => e
#     puts "Could not send data: #{e.response}"
#   end
#   JSON.parse(response.body)
# end

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

# def get_procedures resource_uuid, spec_items, types
#   page = 0
#   last = false
#   while true

#     begin
#       procedure_data = {}
#       response = RestClient.post(
#         ENV["DATA_COLLECTOR_HOST"] + "resources/#{resource_uuid}/data?start=#{page}",  {capability: "medical_procedure"}   
#       )

#       #puts "Success in post data"
#       resp = JSON.parse(response.body)
#       resources = resp["resources"]
#       if !resources[0].nil?
#         capabilities = resources[0]["capabilities"]
#         pf = capabilities["medical_procedure"]
#         if pf.length == 1000
#           page += 1000
#         else
#           page = 0
#           last = true
#         end

#         pf.each do |procedure_fields|

#           spec_id = spec_items[procedure_fields["specialty"]]

#           if spec_id != nil && spec_id >= 1 && spec_id <= 9
#             spec = Specialty.where(id: spec_id.to_i).first
#           else
#             spec_id = 10
#             spec = Specialty.where(id: spec_id.to_i).first
#           end

#           patient = procedure_fields["patient"]
          
#           procedure_data[:cnes_id] = procedure_fields["cnes_id"]
#           if spec != nil 
#             procedure_data[:specialty] = spec
#           end
#           procedure_data[:gender] = patient["gender"].to_s
#           procedure_data[:lat] = patient["lat"]
#           procedure_data[:long] = patient["lon"]
#           procedure_data[:date] = Date.parse procedure_fields["date"].to_s
#           procedure_data[:age_number] = procedure_fields["age"].to_i
#           procedure_data[:age_code] = get_age_code(procedure_fields["age"].to_i)
#           procedure_data[:cid_primary] = procedure_fields["cid_primary"]
#           procedure_data[:cid_secondary] = procedure_fields["cid_secondary"]
#           procedure_data[:cid_associated] = procedure_fields["cid_associated"]

#           procedure_data[:treatment_type] = types[procedure_fields["treatment_type"]]

#           cnesid = procedure_data[:cnes_id].to_i
#           hc = HealthCentre.where(cnes: cnesid).first
#           specialty = {}

#           if hc != nil
#             if procedure_data[:specialty] != nil
#               specialty[:health_centre] = hc
#               specialty[:specialty] = procedure_data[:specialty]
#             end
#             if Specialty != {}
#               HealthCentreSpecialty.create(specialty)
#             end
#             p = Procedure.create(procedure_data)
#             p.distance = p.calculate_distance
#             p.save!
#           end
#         end
#       else
#         return
#       end

#       resources = resp
#       if last == true
#         return 1
#       end
           
#     rescue RestClient::Exception => e
#       puts "Could not send data: #{e.response}"
#       return -1
#     end
#   end

#   return 1
# end

# def create_procedures resources, spec_items, types
#   number_procedures = 0
#   resources["resources"].each do |res|
#     if ( get_procedures(res["uuid"], spec_items, types) == 1)
#       number_procedures += 1
#     end
#   end
#   puts "#{number_procedures} procedures successfully created."
# end


# def get_health_centres resources
#   health_centre_instance = 0
#   resources["resources"].each do |resource|
#     begin
#       uuid = resource["uuid"]
#       response = RestClient.get(
#          ENV["RESOURCE_CATALOGUER_HOST"] + "resources/#{uuid}",
#       )
#       puts "Success in get data"
#     rescue RestClient::Exception => e
#       puts "Could not send data: #{e.response}"
#     end
#     response = JSON.parse(response.body)
#     puts response

#     item = response["data"]

#     regex = /.*CNES (\d+).* NAME ([A-Z ]+).* BEDS (\d+).*/
#     # response["resources"].each do |item|
#     if (item["capabilities"][0] == "medical_procedure")
#     	description = item["description"]

#    		if !(get_match = regex.match(description)).nil?
#    			cnes = get_match[1].to_i
#    			name = get_match[2]
#    			beds = get_match[3]
        		
# 			  h = HealthCentre.create(long: item["lon"], lat: item["lat"], cnes: cnes, 
#           name: name, beds: beds, census_district: item["neighborhood"])
        
#         health_centre_instance+=1
#    		end
#    	end	
#     # end
#   end
#   puts "#{health_centre_instance} health_centre successfully created."
# end

# resources = get_resources

# get_health_centres(resources)

def get_health_centres()
  hc_csv_path = File.join(__dir__, "csv/health_centres_real.csv")

  # spec_items = {}
  hc_counter = 0
  CSV.foreach(hc_csv_path, :headers => true) do |row|
    h = HealthCentre.create cnes: row[0], name: row[1], beds: row[2], long: row[3], lat: row[4]
    h.procedure_count = 0
    hc_counter += 1
  end
  puts "#{hc_counter} Health Centres successfully created"
end

def create_procedures()
  hc_csv_path = File.join(__dir__, "csv/procedures.csv")

  # spec_items = {}
  procedures_counter = 0
  counter = 0
  CSV.foreach(hc_csv_path, :headers => true) do |row|
    counter += 1
    next if counter < 188802

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
    p.save
    
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

# get_health_centres()

# spec_items = get_specialties

# types = get_types

create_procedures()

# create_procedures(resources, spec_items, types)
