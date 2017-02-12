require 'csv'

health_centre_csv_path = File.join(__dir__, "csv/estab_saude.csv")
procedure_csv_path = File.join(__dir__, "csv/procedimentos.csv")

health_centres = []
procedures = []

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
  Procedure.create!(date: row[1], age_code: row[2], age_number: row[3],
                   gender: row[4], race: row[5], cep_patient: row[7],
                   different_district: row[8], cid_associated: row[10],
                   cid_primary: row[11], cid_secondary: row[12],
                   ethnicity: row[13])
  print '.'
end
