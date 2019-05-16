require 'rails_helper'
require 'spec_helper'

describe HealthCentresController, type: 'controller' do
        describe 'without a logged in user' do
                ['points', 'hospital', 'procedures', 'procedures_setor_healthcentre', 'specialties', 'specialty_distance', 'specialties_count', 'specialties_procedure_distance_average', 'distance_quartis', 'distances', 'distance_metric'].each do |method|
                        describe "#{method}" do
                                it 'is expected to redirect to sign in' do
                                  self.send(:get, method, format: :json, params: {id: 1})

                                  expect(response.status).to eq(401) # unauthorized
                                end
                        end
                end
        end

        describe 'with a logged in user' do
                before do
                        @user =  User.create!(email: 'test@test.com', password: 'test123')
                        sign_in @user
                end


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

                it 'should return status 200 and specialty distances' do
                    id = 1
                    self.send(:get, 'specialty_distance', params: {id: id}, format: :json)
                    expect(response.status).to eq(200)
                    expect(response.body).to eq('{"0":{"0":"Specialty 1","1":0,"2":0,"3":3,"4":0}}')
                    id = 2
                    self.send(:get, 'specialty_distance', params: {id: id}, format: :json)
                    expect(response.status).to eq(200)
                    expect(response.body).to eq('{"0":{"0":"Specialty 2","1":1,"2":0,"3":1,"4":0}}')
        		end
        	end

                describe 'Testing distance_metrics method' do
                        before :each do
                                HealthCentre.create id: 1, cnes: 1, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.
        054Z"
                                HealthCentre.create id: 2, cnes: 2, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.
        054Z"
                                Specialty.create id: 1, name: "Specialty 1"
                                Specialty.create id: 2, name: "Specialty 2"

                                Procedure.create id: 2, cnes_id: 1, specialty_id: 1, age_code: "TP_0A4", distance: 6.0, lat: -12.9, long: -35.0
                                Procedure.create id: 3, cnes_id: 1, specialty_id: 1, days: 50, distance: 7.0, lat: -12.9, long: -35.0
                                Procedure.create id: 4, cnes_id: 1, specialty_id: 1, cmpt: 201502, distance: 2.0, lat: 3.3, long: 1.2
                                Procedure.create id: 5, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 0.5, lat: -12.9, long: -35.0
                                Procedure.create id: 6, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 16.0, lat: -12.9, long: -35.0

                                Procedure.create id: 7, cnes_id: 1, specialty_id: 1, age_code: "TP_0A4", distance: 1.0, lat: -12.9, long: -35.0
                                Procedure.create id: 8, cnes_id: 1, specialty_id: 1, days: 50, distance: 5.0, lat: -12.9, long: -35.0
                                Procedure.create id: 9, cnes_id: 1, specialty_id: 1, cmpt: 201502, distance: 10.0, lat: 3.3, long: 1.2
                                Procedure.create id: 10, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 500, lat: -12.9, long: -35.0
                                Procedure.create id: 11, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 160.0, lat: -12.9, long: -35.0
                        end

                        it 'Should return the distance metrics' do
                                self.send(:get, 'distance_metric', format: :json)
                                expect(response.status).to eq(200)
                                expect(response.body).to eq("{\"\\u003c 1 km\":2,\"\\u003e 1 km e \\u003c 5 km\":2,\"\\u003e 5 km e \\u003c 10 km\":3,\"\\u003e 10 km\":3}")
                        end
        	end

                describe 'Testing distances method' do
                        before :each do
                                HealthCentre.create id: 1, cnes: 1, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.054Z"
                                HealthCentre.create id: 2, cnes: 2, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.054Z"
                                Specialty.create id: 1, name: "Specialty 1"
                                Specialty.create id: 2, name: "Specialty 2"

                                Procedure.create id: 2, cnes_id: 1, specialty_id: 1, age_code: "TP_0A4", distance: 6.0, lat: -12.9, long: -35.0
                                Procedure.create id: 3, cnes_id: 1, specialty_id: 1, days: 50, distance: 7.0, lat: -12.9, long: -35.0
                                Procedure.create id: 4, cnes_id: 1, specialty_id: 1, cmpt: 201502, distance: 2.0, lat: 3.3, long: 1.2
                                Procedure.create id: 5, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 0.5, lat: -12.9, long: -35.0
                                Procedure.create id: 6, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 16.0, lat: -12.9, long: -35.0

                                Procedure.create id: 7, cnes_id: 1, specialty_id: 1, age_code: "TP_0A4", distance: 1.0, lat: -12.9, long: -35.0
                                Procedure.create id: 8, cnes_id: 1, specialty_id: 1, days: 50, distance: 5.0, lat: -12.9, long: -35.0
                                Procedure.create id: 9, cnes_id: 1, specialty_id: 1, cmpt: 201502, distance: 10.0, lat: 3.3, long: 1.2
                                Procedure.create id: 10, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 500, lat: -12.9, long: -35.0
                                Procedure.create id: 11, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 160.0, lat: -12.9, long: -35.0
                        end

                        it 'Should return the average distance' do
        			id = 1
                                self.send(:get, 'distances', params: {id: id}, format: :json)
                                expect(response.status).to eq(200)
                                expect(response.body).to eq("{\"\\u003c 1 km\":1,\"\\u003e 1 km e \\u003c 5 km\":2,\"\\u003e 5 km e \\u003c 10 km\":3,\"\\u003e 10 km\":0}")
                        end
                        it 'Should return the average distance' do
                                id = 2
                                self.send(:get, 'distances', params: {id: id}, format: :json)
                                expect(response.status).to eq(200)
                                expect(response.body).to eq("{\"\\u003c 1 km\":1,\"\\u003e 1 km e \\u003c 5 km\":0,\"\\u003e 5 km e \\u003c 10 km\":0,\"\\u003e 10 km\":3}")
                        end
                        it 'Should return not found' do
                                id = 10
                                self.send(:get, 'distances', params: {id: id}, format: :json)
                                expect(response.status).to eq(404)
        			expect(response.body).to eq("Not found")
                        end
                end
            describe 'Testing distance_quartis method' do
                before :each do
                    HealthCentre.create id: 1, cnes: 1, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.054Z"
                    HealthCentre.create id: 2, cnes: 2, lat: -23.555885, long: -46.666458, created_at: "2018-10-01T17:18:05.054Z", updated_at: "2018-10-01T17:18:05.054Z"
                    Specialty.create id: 1, name: "Specialty 1"
                    Specialty.create id: 2, name: "Specialty 2"

                    Procedure.create id: 2, cnes_id: 1, specialty_id: 1, age_code: "TP_0A4", distance: 6.0, lat: -12.9, long: -35.0
                    Procedure.create id: 3, cnes_id: 1, specialty_id: 1, days: 50, distance: 7.0, lat: -12.9, long: -35.0
                    Procedure.create id: 4, cnes_id: 1, specialty_id: 1, cmpt: 201502, distance: 2.0, lat: 3.3, long: 1.2
                    Procedure.create id: 5, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 0.5, lat: -12.9, long: -35.0
                    Procedure.create id: 6, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 16.0, lat: -12.9, long: -35.0

                    Procedure.create id: 7, cnes_id: 1, specialty_id: 1, age_code: "TP_0A4", distance: 1.0, lat: -12.9, long: -35.0
                    Procedure.create id: 8, cnes_id: 1, specialty_id: 1, days: 50, distance: 5.0, lat: -12.9, long: -35.0
                    Procedure.create id: 9, cnes_id: 1, specialty_id: 1, cmpt: 201502, distance: 10.0, lat: 3.3, long: 1.2
                    Procedure.create id: 10, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 500, lat: -12.9, long: -35.0
                    Procedure.create id: 11, cnes_id: 2, specialty_id: 2, age_code: "TP_0A4", distance: 160.0, lat: -12.9, long: -35.0
                end

                it 'distance_quartis for health centre 1' do
                    self.send(:get, 'distance_quartis', params: {id: 1}, format: :json)
                    expect(response.status).to eq(200)
                    expect(JSON.parse(response.body)).to eq(["10.0", "6.0", "5.0"])
                end
                it 'distance_quartis for health centre 2' do
                    self.send(:get, 'distance_quartis', params: {id: 2}, format: :json)
                    expect(response.status).to eq(200)
                    expect(JSON.parse(response.body)).to eq(["500.0", "160.0", "16.0"])
                end
            end
    end
end
