require 'rails_helper'

RSpec.describe HealthCentre, type: :model do
	describe 'Health Centre Insert Test' do
		context 'successful' do
			before :each do
				@hc = HealthCentre.create id: 999, cnes: 782635, name: "ESTABELECIMENTO SP TESTE", beds: 221, long: -46.666458, lat: -23.555885, phone: nil, adm: "", DA: "", PR: "RIO DE JANEIRO", STS: "", CRS: ""
			end

			it 'should work' do
				expect(@hc.valid?).to be true
			end
		end


		context 'failure' do
			before :each do
				@hc = HealthCentre.create id: 1000, cnes: 782635, name: "ESTABELECIMENTO TESTE", beds: 221, long: -22.9027800, lat: -43.2075000, phone: nil, adm: "", DA: "", PR: "RIO DE JANEIRO", STS: "", CRS: "" 
			end

			it 'should fail' do
				expect(@hc.valid?).to be false
			end
		end
	end
end