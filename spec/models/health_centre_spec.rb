require 'rails_helper'

RSpec.describe HealthCentre, type: :model do
	describe 'Health Centre Insert Test' do
		it 'should work' do
			teste = HealthCentre.new(cnes: 2068974, name: "PAM VARZEA DO CARMO NGA 63 SAO PAULO", beds: 0, long: -23.555872, lat: -46.624901, phone: nil, adm: "", DA: "CAMBUCI", PR: "SE", STS: "SE", CRS: "CENTRO")
      		expect(teste.save!).to be true
		end

		it 'should fail' do
			teste = HealthCentre.new(cnes: 782635, name: "ESTABELECIMENTO TESTE", beds: 221, long: -22.9027800, lat: -43.2075000, phone: nil, adm: "", DA: "", PR: "RIO DE JANEIRO", STS: "", CRS: "")
      		expect(teste.save).to be false
		end
	end
end