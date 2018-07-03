require 'rails_helper'

RSpec.describe HealthCentre, type: :model do
	describe 'Health Centre Insert Test' do
		it 'should work' do
			 hc_csv_path = Rails.root.join('db/csv/health_centres_real.csv')
				CSV.foreach(hc_csv_path, :headers => true) do |row|
					teste = HealthCentre.new cnes: row[0], name: row[1], beds: row[2], long: row[4], lat: row[3], phone: row[7], adm: row[8], DA: row[9], PR: row[10], STS: row[11], CRS: row[12]
		      		expect(teste.save!).to be true
		      	end
		end

		it 'should fail' do
			teste = HealthCentre.new(cnes: 782635, name: "ESTABELECIMENTO TESTE", beds: 221, long: -22.9027800, lat: -43.2075000, phone: nil, adm: "", DA: "", PR: "RIO DE JANEIRO", STS: "", CRS: "")
      		expect(teste.save).to be false
		end
	end
end