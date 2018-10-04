require 'rails_helper'
require 'spec_helper'

describe HealthCentresController, type: 'controller' do

	describe 'Testing [points, health_centre_count, hospital] methods' do
		before :each  do
			HealthCentre.create id: 1, cnes: 1, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.054Z"
			HealthCentre.create id: 2, cnes: 2, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.054Z"
		end

		it 'should return two HealthCentres' do
			self.send(:get, 'points', format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq(HealthCentre.all.to_json)
		end

		it 'should return a counter of health centres' do
			self.send(:get, 'health_centre_count', format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq("2")
		end

		it 'should return Bad request when no id is given' do
			id = 1
			self.send(:get, 'hospital',params: {:id => id}, format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq(HealthCentre.find_by(id: 1).to_json())
		end

		it 'should return Bad request when there\'s no match for the id' do
			id = 10
			self.send(:get, 'hospital', params: {id: id}, format: :json)
			expect(response.status).to eq(400)
			expect(response.body).to eq("Bad request")
		end
	end

	describe 'Testing [health_centre_count, procedures, procedures_setor_healthcentre, specialties_count,
	specialties_procedure_distance_average] methods' do
		before :each do
			HealthCentre.create id: 1, cnes: 1, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.054Z"
			HealthCentre.create id: 2, cnes: 2, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.054Z"
			Specialty.create id: 1, name: "Specialty 1"
			Specialty.create id: 2, name: "Specialty 2"

			Procedure.create id: 2, cnes_id: 1, specialty_id: 1, age_code: "TP_0A4", distance: 6.0, lat: -12.9, long: -35.0
			Procedure.create id: 3, cnes_id: 1, specialty_id: 1, days: 50, distance: 7.0, lat: -12.9, long: -35.0
			Procedure.create id: 4, cnes_id: 1, specialty_id: 1, cmpt: 201502, distance: 8.0, lat: 3.3, long: 1.2
			Procedure.create id: 5, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 0.0, lat: -12.9, long: -35.0
			Procedure.create id: 6, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 6.0, lat: -12.9, long: -35.0

		end

		it 'Should return the average distance' do
			self.send(:get, 'total_distance_average', format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq("5.4")
		end

		it 'Should return an array of procedures coordinates for a specific health centre' do
			self.send(:get, 'procedures', params: {id: 1}, format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq(HealthCentre.find_by(id: 1).procedures.group(:lat, :long).count.to_a.flatten.each_slice(3).to_json)
		end

		it 'should return Bad request when there\'s no match for the id' do
			id = 10
			self.send(:get, 'procedures', params: {id: id}, format: :json)
			expect(response.status).to eq(400)
			expect(response.body).to eq("Bad request")
		end

		it 'Should return procedures in a specific coordinate for a given health centre' do
			params = {id: 1, lat: -12.9, long: -35.0}
			self.send(:get, 'procedures_setor_healthcentre', params: params, format: :json)
			expect(response.status).to eq(200)
			expect(JSON.parse response.body).to eq(HealthCentre.find_by(id: 1).procedures.where(lat: params[:lat], long: params[:long]).pluck(:id))
		end

		it 'should return Bad request when there\'s no match for the id' do
			id = 10
			self.send(:get, 'procedures_setor_healthcentre', params: {id: id}, format: :json)
			expect(response.status).to eq(400)
			expect(response.body).to eq("Bad request")
		end

		it 'Should return nil when no coordinates are given' do
			params = {id: 1, lat: nil, long: nil}
			self.send(:get, 'procedures_setor_healthcentre', params: params, format: :json)
			expect(response.status).to eq(200)
			expect(JSON.parse response.body).to eq(HealthCentre.find_by(id: 1).procedures.where(lat: params[:lat], long: params[:long]).pluck(:id))
		end

		it 'should return Bad request when there\'s no match for the id' do
			id = 10
			self.send(:get, 'specialties', params: {id: id}, format: :json)
			expect(response.status).to eq(400)
			expect(response.body).to eq("Bad request")
		end

		it 'Should return nil when no coordinates are given' do
			params = {id: 1, lat: nil, long: nil}
			self.send(:get, 'specialties', params: params, format: :json)
			expect(response.status).to eq(200)
			expect(JSON.parse response.body).to eq({"Specialty 1" => 3})
		end

		it 'should return status 200 and hash {name:count}' do
			self.send(:get, 'specialties_count', format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq('{"Specialty 1":3,"Specialty 2":2}')
		end

		it 'should return status 200 and hash {name:distance}' do
			self.send(:get, 'specialties_procedure_distance_average', format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq('{"Specialty 1":7.0,"Specialty 2":3.0}')
		end

		it '' do 
			id = 2
			self.send(:get, 'specialty_distance', params: {id: id}, format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq('{"0":{"0":"Specialty 2","1":"1","2":"","3":"1","4":"","5":""}}')
		end
	end
end