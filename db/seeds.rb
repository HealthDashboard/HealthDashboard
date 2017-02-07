require 'csv'

csv_text = File.read(File.join(__dir__, "csv/estab_saude.csv"), :encoding => 'UTF-8')
csv = CSV.parse(csv_text, :headers => false)
csv.each do |row|
  HealthCentre.create!(long: row[0], lat: row[1], cnes: row[5], name: row[3], beds: row[6], phone: row[4], census_district: row[2])
end
