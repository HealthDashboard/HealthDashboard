require 'json'
require 'csv'
require 'rest-client'


ENV["RESOURCE_CATALOGUER_HOST"] ||= 'localhost:3000/'
ENV["DATA_COLLECTOR_HOST"] ||= 'localhost:4000/'


def get_specialties
  spec_items = {}
  Specialty.all.each do |item|
    name = item["name"]
    spec_items[name] = item["id"]
  end
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
    response = RestClient.post(
      ENV["DATA_COLLECTOR_HOST"] + "resources/#{resource_uuid}/data",  {capability: "medical_procedure"}   
    )
    #puts "Success in post data"
    resp = JSON.parse(response.body)
    resources = resp["resources"]
    if !resources[0].nil?
      capabilities = resources[0]["capabilities"]
      procedure_fields = capabilities["medical_procedure"][0]["value"]
      procedure_items = eval(procedure_fields)
      
      spec_name = procedure_items[:specialty]
      spec = Specialty.where(name: spec_name)
     
     #######IMPORTANTE##############
     ###Apenas criar a instância do Specialty se não existir no banco
     ###############################
      s = Specialty.create(id: spec_items[spec_name], name: spec_name)
      
      procedure_items[:specialty] = s
 
    end
  rescue RestClient::Exception => e
    puts "Could not send data: #{e.response}"
  end 
    resources = resp
    p = Procedure.create(procedure_items)

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
   			cnes = get_match[1]
   			name = get_match[2]
   			beds = get_match[3]
		
			  h = HealthCentre.create(cnes: cnes, name: name, beds: beds)
        health_centre_instance+=1
   		end
   	end	
  end

  puts "#{health_centre_instance} health_centre successfully created."
end



resources = get_resources

get_health_centres

spec_items = get_specialties 

resources["resources"].each do |res|
  values = get_procedures(res["uuid"], spec_items)
end


# 
# print "\nCalculating procedure distance from associated health centre: "
# Procedure.all.each do |a|
#   a.distance = a.calculate_distance
#   a.save!
