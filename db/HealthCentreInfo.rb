require 'csv'

def add_info()
	hc_csv_path = File.join(__dir__, "csv/health_centres_real.csv")
	hc_counter = 0
  	CSV.foreach(hc_csv_path, :headers => true) do |row|
    	h = HealthCentre.where(cnes: row[0]).first
      h.hc_type = row[5]
      h.phone = row[7]
      h.adm = row[8]
      h.DA = row[9]
      h.PR = row[10]
      h.STS = row[11]
      h.CRS = row[12]
    	h.save!
    	hc_counter += 1
    print "."
  	end
  	puts ""
  	puts "#{hc_counter} Health Centres successfully updated"
end

add_info()
