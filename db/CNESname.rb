require 'csv'

def change_name()
	hc_csv_path = File.join(__dir__, "csv/health_centres_real.csv")
	hc_counter = 0
  	CSV.foreach(hc_csv_path, :headers => true) do |row|
    	h = HealthCentre.where(cnes: row[0]).first
    	h.name = row[1]
    	h.save!
    	hc_counter += 1
    print "."
  	end
  	puts ""
  	puts "#{hc_counter} Health Centres successfully updated"
end

change_name()