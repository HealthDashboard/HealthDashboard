require 'csv'

def addTypes
  Type.create id: 0, name: "HOSPITAL/DIA - ISOLADO"
  Type.create id: 1, name: "HOSPITAL GERAL"
  Type.create id: 2, name: "HOSPITAL ESPECIALIZADO"
  Type.create id: 3, name: "CLÍNICA/CENTRO DE ESPECIALIDADE"
end

def linkTypeHealthCentre
	hc_csv_path = File.join(__dir__, "csv/health_centres_real.csv")
	hc_counter = 0
  	CSV.foreach(hc_csv_path, :headers => true) do |row|
    	t = Type.find_by(name: row[5])
      HealthCentre.find_by(cnes: row[0]).types << t
      hc_counter += 1
    print "."
  	end
  	puts ""
  	puts "#{hc_counter} Health Centres successfully updated"
end

# addTypes()
linkTypeHealthCentre()