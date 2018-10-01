require 'rails_helper'
require 'spec_helper'

describe HealthCentresController, type: 'controller' do

	describe 'Testing points method' do
		before :each  do
			HealthCentre.create id: 1, cnes: 1, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.054Z"
			HealthCentre.create id: 2, cnes: 2, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.054Z"
		end

		it 'should return two HealthCentres' do
			data = {"send_all" => "True"}.to_json
			self.send(:get, 'points', params: {data: data}, format: :json)
			expect(response.status).to eq(200)
			expect(JSON.parse(response.body)).to eq([{"CRS"=>nil, "DA"=>nil, "PR"=>nil, "STS"=>nil, "adm"=>nil, "beds"=>nil, "cnes"=>1, "created_at"=>"2018-10-01T17:18:05.054Z", "id"=>1, "lat"=>-23.555885, "long"=>-46.666458, "name"=>nil, "name_r"=>nil, "phone"=>nil, "updated_at"=>"2018-10-01T17:18:05.054Z"},
													 {"CRS"=>nil, "DA"=>nil, "PR"=>nil, "STS"=>nil, "adm"=>nil, "beds"=>nil, "cnes"=>2, "created_at"=>"2018-10-01T17:18:05.054Z", "id"=>2, "lat"=>-23.555885, "long"=>-46.666458, "name"=>nil, "name_r"=>nil, "phone"=>nil, "updated_at"=>"2018-10-01T17:18:05.054Z"}])
		end




	end
end