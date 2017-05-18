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
    puts "Success in get data"
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
    puts "Success in post data"
    resp = JSON.parse(response.body)
    resources = resp["resources"]
    if !resources[0].nil?
      capabilities = resources[0]["capabilities"]
      procedure_fields = capabilities["medical_procedure"][0]["value"]
      procedure_items = eval(procedure_fields)
      
      spec_name = procedure_items[:specialty]
      spec = Specialty.where(name: spec_name)
     
       
      s = Specialty.new(id: spec_items[spec_name], name: spec_name)

      procedure_items[:specialty] = s
 
      #procedure_items = procedure_items.reduce({}){ |hash, (k, v)| hash.merge( k.to_s => v ) }
      puts "--------------------------------"
#####IMPORTANTE#############
###Precisamos instanciar um Specialty para não quebrar
###Pode-se pegar pelo nome 
##################################
    end
  rescue RestClient::Exception => e
    puts "Could not send data: #{e.response}"
  end 
    resources = resp
    p = Procedure.new(procedure_items)
    puts p
end

resources = get_resources

spec_items = get_specialties 

resources["resources"].each do |res|
  values = get_procedures(res["uuid"], spec_items)
end


# 
# print "\nCalculating procedure distance from associated health centre: "
# Procedure.all.each do |a|
#   a.distance = a.calculate_distance
#   a.save!
