require 'json'
require 'csv'
require 'rest-client'


ENV["RESOURCE_CATALOGUER_HOST"] ||= '172.19.5.29:8000/catalog/'
ENV["DATA_COLLECTOR_HOST"] ||= '172.19.5.29:8000/collector/'


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
      # puts item
      counter += 1  	
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


# 
# print "\nCalculating procedure distance from associated health centre: "
# Procedure.all.each do |a|
#   a.distance = a.calculate_distance
#   a.save!
