require 'csv'

csv_text = File.read(File.join(__dir__, "csv/estab_saude.csv"), :encoding => 'UTF-8')
csv = CSV.parse(csv_text, :headers => false)
csv.each do |row|
  HealthCentre.create!(long: row[0], lat: row[1], cnes: row[5], name: row[3], beds: row[6], phone: row[4], census_district: row[2])
end

csv_text = File.read(File.join(__dir__, "csv/procedimentos.csv"), :encoding => 'UTF-8')
csv = CSV.parse(csv_text, { :headers => false })
csv.each_with_index do |row, index|
	        next if index == 0
		location = Geocoder.search(row[7]).first
		next if not location
	        location = location.data['geometry']['location'] 
                # ["AP_CODUNI;AP_CMP;AP_COIDADE;AP_NUIDADE;AP_SEXO;AP_RACACOR;AP_MUNPCN;AP_CEPPCN;AP_MNDIF;AP_CATEND;AP_CIDCAS;AP_CIDPRI;AP_CIDSEC;AP_ETNIA"]
		Procedure.create!(date: row[1],age_code: row[2], age_number: row[3], gender: row[4], race: row[5], cep_patient: row[7], different_district: row[8], cid_associated: row[10], cid_primary: row[11], cid_secondary: row[12], ethnicity: row[13], lat: location['lat'], long: location['lng'])
end


