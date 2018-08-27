require 'rails_helper'

RSpec.describe HealthCentre, type: :model do
	describe 'Health Centre Insert Test' do
		it 'should work' do
			teste = HealthCentre.new cnes: 2058391, name: "HOSP ALBERT EINSTEIN", beds: 38, long: -46.714676, lat: -23.59913, phone: "(11)3747-1233", adm: "MUNICIPAL", DA: "MORUMBI", PR: "BUTANTÃ", STS: "BUTANTÃ", CRS: "OESTE"
	  		expect(teste.save!).to be true
		end

		it 'should fail' do
			teste = HealthCentre.new(cnes: 782635, name: "ESTABELECIMENTO TESTE", beds: 221, long: -22.9027800, lat: -43.2075000, phone: nil, adm: "", DA: "", PR: "RIO DE JANEIRO", STS: "", CRS: "")
      		expect(teste.save).to be false
		end
	end
end