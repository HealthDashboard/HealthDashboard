require 'csv'
require 'json'

health_centre_csv_path = File.join(__dir__, "csv/estab_saude.csv")
procedure_csv_path = File.join(__dir__, "csv/procedimentos.csv")
locations_json_path = File.join(__dir__, "scripts/latlng.json")

health_centres = []
procedures = []

if File.exists?(locations_json_path)
 file = File.read(locations_json_path)
 locations = JSON.parse(file)
else
  locations = {}
end

puts "Seeding"
print "HealthCentres: "
CSV.foreach(health_centre_csv_path, :headers => true) do |row|
  HealthCentre.create!(long: row[0], lat: row[1], cnes: row[5],
                      name: row[3], beds: row[6], phone: row[4],
                      census_district: row[2])
  print '.'
end

print "\nProcedure"
CSV.foreach(procedure_csv_path, :headers => true) do |row|
  if locations.key?(row[7]) and locations[row[7]]
    location = locations[row[7]]
  else
    next
  end

  Procedure.create!(cnes_id: row[0], date: row[1], age_code: row[2], age_number: row[3],
                   gender: row[4], race: row[5], cep_patient: row[7],
                   different_district: row[8], cid_associated: row[10],
                   cid_primary: row[11], cid_secondary: row[12],
                   ethnicity: row[13], lat: location['lat'], long: location['lng'])
  print '.'
end

Procedure.all.each do |a|
  a.distance = a.calculate_distance
  a.save!
end
