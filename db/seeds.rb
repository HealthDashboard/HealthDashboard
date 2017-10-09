require 'json'
require 'csv'
require 'rest-client'


ENV["RESOURCE_CATALOGUER_HOST"] ||= '172.19.5.29:8000/catalog/'
ENV["DATA_COLLECTOR_HOST"] ||= '172.19.5.29:8000/collector/'

AGE_GROUP = [ "TP_0A4", "TP_5A9", "TP_10A14", "TP_15A19", "TP_20A24", "TP_25A29", "TP_30A34",
              "TP_35A39", "TP_40A44", "TP_45A49", "TP_50A54", "TP_55A59", "TP_60A64", "TP_65A69",
              "TP_70A74", "TP_75A79", "TP_80A84", "TP_85A89", "TP_90A94", "TP_95A99", "TP_100OUMA"]

CID = [ "A00", "A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A15", "A16", "A17", "A18", "A19",
"A20", "A21", "A22", "A23", "A24", "A25", "A26", "A27", "A28", "A30", "A31", "A32", "A33", "A34", "A35", "A36",
"A37", "A38", "A39", "A40", "A41", "A42", "A43", "A44", "A46", "A48", "A49", "A50", "A51", "A52", "A53", "A54",
"A55", "A56", "A57", "A58", "A59", "A60", "A63", "A64", "A65", "A66", "A67", "A68", "A69", "A70", "A71", "A74",
"A75", "A77", "A78", "A79", "A80", "A81", "A82", "A83", "A84", "A85", "A86", "A87", "A88", "A89", "A90", "A91",
"A92", "A93", "A94", "A95", "A96", "A98", "A99", "B00", "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", 
"B09", "B15", "B16", "B17", "B18", "B19", "B20", "B21", "B22", "B23", "B24", "B25", "B26", "B27", "B30", "B33",
"B34", "B35", "B36", "B37", "B38", "B39", "B40", "B41", "B42", "B43", "B44", "B45", "B46", "B47", "B48", "B49", "B50", 
"B51", "B52", "B53", "B54", "B55", "B56", "B57", "B58", "B59", "B60", "B64", "B65", "B66", "B67", "B68", "B69", 
"B70", "B71", "B72", "B73", "B74", "B75", "B76", "B77", "B78", "B79", "B80", "B81", "B82", "B83", "B85", "B86", 
"B87", "B88", "B89", "B90", "B91", "B92", "B94", "B95", "B96", "B97", "B99"]

TREATMENT_TYPE = [1, 2, 3, 4, 5, 6]

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


def get_resources
  begin
    response = RestClient.get(
      ENV["RESOURCE_CATALOGUER_HOST"] + "resources/search?capability=medical_procedure",
    )
    #puts "Success in get data"
  rescue RestClient::Exception => e
    puts "Could not send data: #{e.response}"
  end
  JSON.parse(response.body)
end

def get_procedures resource_uuid, spec_items
  begin
    procedure_data = {}
    response = RestClient.post(
      ENV["DATA_COLLECTOR_HOST"] + "resources/#{resource_uuid}/data",  {capability: "medical_procedure"}   
    )
    #puts "Success in post data"
    resp = JSON.parse(response.body)
    resources = resp["resources"]
    if !resources[0].nil?
      capabilities = resources[0]["capabilities"]
      procedure_fields = capabilities["medical_procedure"][0]

      spec_name = procedure_fields["specialty"]
      spec = Specialty.where(name: spec_name).first
      patient = procedure_fields["patient"]
      
      procedure_data[:cnes_id] = procedure_fields["cnes_id"]
      procedure_data[:specialty] = spec
      procedure_data[:gender] = patient["gender"].to_s
      procedure_data[:different_district] = patient["different_district"].to_s
      procedure_data[:lat] = patient["lat"]
      procedure_data[:long] = patient["lon"]
      procedure_data[:date] = Date.parse procedure_fields["date"].to_s
      procedure_data[:age_code] = AGE_GROUP.sample
      procedure_data[:cid_primary] = CID.sample
      procedure_data[:treatment_type] = TREATMENT_TYPE.sample
    else
      return
    end
         
  rescue RestClient::Exception => e
    puts "Could not send data: #{e.response}"
  end 

  resources = resp
  specialty = {}

  cnesid = procedure_data[:cnes_id].to_i
  hc = HealthCentre.where(cnes: cnesid).first

  if hc != nil
    specialty[:health_centre] = hc
    specialty[:specialty] = procedure_data[:specialty]
    HealthCentreSpecialty.create(specialty)
  end

  p = Procedure.create(procedure_data)
  p.distance = p.calculate_distance
  p.save!
  return 1
end

def create_procedures resources, spec_items
  number_procedures = 0
  resources["resources"].each do |res|
    if ( get_procedures(res["uuid"], spec_items) == 1)
      number_procedures += 1
    end
  end
  puts "#{number_procedures} procedures successfully created."
end


def get_health_centres
 	begin
    response = RestClient.get(
      ENV["RESOURCE_CATALOGUER_HOST"] + "resources?capability=medical_procedure",
    )
    puts "Success in get data"
  rescue RestClient::Exception => e
    puts "Could not send data: #{e.response}"
  end
  response = JSON.parse(response.body)

  health_centre_instance = 0
  regex = /.*CNES (\d+).* NAME ([A-Z ]+).* BEDS (\d+).*/
  response["resources"].each do |item|
    if (item["capabilities"][0] == "medical_procedure")
    	description = item["description"]

   		if !(get_match = regex.match(description)).nil?
   			cnes = get_match[1].to_i
   			name = get_match[2]
   			beds = get_match[3]
        		
			  h = HealthCentre.create(long: item["lon"], lat: item["lat"], cnes: cnes, 
          name: name, beds: beds, census_district: item["neighborhood"])
        
        health_centre_instance+=1
   		end
   	end	
  end
  puts "#{health_centre_instance} health_centre successfully created."
end

resources = get_resources

get_health_centres

spec_items = get_specialties 

create_procedures(resources, spec_items)
