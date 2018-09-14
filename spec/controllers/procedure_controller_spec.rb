require 'rails_helper'
require 'spec_helper'

describe ProcedureController, type: 'controller' do
	describe 'quartiles calculation' do
		it 'should return a array of [q1, q2(median), q3]' do
			groups = {0=>25, 1=>25, 2=>25, 3=>25}
			median = controller.send :quartiles_calc, groups
			expect(median).to eq([0, 1.0, 2])
		end

		it 'should return a array of [q1, q2(median), q3] for a array without counters' do
			groups = {0=>1, 1=>1, 2=>1, 3=>1, 4=>1, 5=>1, 6=>1, 7=>1}
			median = controller.send :quartiles_calc, groups
			expect(median).to eq([1, 3, 5])
		end

		it 'should return a array of [q1, q2(median), q3] for an array with counters' do
			groups = {0=>10, 1=>5, 2=>20, 3=>2, 4=>10, 5=>1, 6=>1}
			median = controller.send :quartiles_calc, groups
			expect(median).to eq([1, 2, 3])
		end
	end

	describe 'Testing procedures quartiles method' do
		it 'should return default values when send all is set' do
			data = {"send_all" => "True"}.to_json
			self.send(:get, 'proceduresQuartiles', params: {data: data}, format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to_not be_nil
			expect(JSON.parse(response.body)).to eq([[2, 3.0, 6], [0, 0.0, 0], [0, 0.0, 0], [2, 3.0, 6],
				[0.0, 0.0, 0.0], [3.6, 6.9, 13.9]])
		end
	end

	describe 'Testing healthCentresCnes method' do
		before :each do
			HealthCentre.create id: 1, cnes: 1010, lat: -23.555885, long: -46.666458
			HealthCentre.create id: 2, cnes: 2, lat: -23.59913, long: -46.714676
		end

		it 'Should return an empty JSON when no CNES is passed' do
			self.send(:get, 'healthCentresCnes', format: :json)
			expect(response.status).to eq(200)
			expect(JSON.parse(response.body)).to eq([])
		end

		it 'Should return [lat, long] for the HealthCentre' do
			self.send(:get, 'healthCentresCnes', params: {cnes: 1010}, format: :json)
			expect(response.status).to eq(200)
			expect(JSON.parse(response.body)).to eq([[-23.555885, -46.666458]])
		end

		it 'Should return an empty JSON for wrong CNES' do
			self.send(:get, 'healthCentresCnes', params: {cnes: 2234}, format: :json)
			expect(response.status).to eq(200)
			expect(JSON.parse(response.body)).to eq([])
		end

		it 'Should return a list of [lat, long] for more than one CNES' do
			self.send(:get, 'healthCentresCnes', params: {cnes: "1010, 2"}, format: :json)
			expect(response.status).to eq(200)
			expect(JSON.parse(response.body)).to eq([[-23.555885, -46.666458], [-23.59913, -46.714676]])
		end

		it 'Should return only the [lat, long] for the right CNES' do
			self.send(:get, 'healthCentresCnes', params: {cnes: "1010, 2542"}, format: :json)
			expect(response.status).to eq(200)
			expect(JSON.parse(response.body)).to eq([[-23.555885, -46.666458]])
		end
	end

	describe 'Testing proceduresPerHealthCentre method' do
		before :each do
			HealthCentre.create id: 1, name: "Teste1",cnes: 1, lat: -23.555885, long: -46.666458
			HealthCentre.create id: 2, name: "Teste2", cnes: 2, lat: -23.555885, long: -46.666458

			Specialty.create id: 1, name: "Specialty 1"

			Procedure.create id: 1, cnes_id: 2, specialty_id: 1
			Procedure.create id: 2, cnes_id: 1, specialty_id: 1, age_code: "TP_0A4"
			Procedure.create id: 3, cnes_id: 1, specialty_id: 1, days: 50
		 	Procedure.create id: 4, cnes_id: 1, specialty_id: 1, cmpt: 201502
		 	Procedure.create id: 5, cnes_id: 1, specialty_id: 1, proce_re: 3030
		 	Procedure.create id: 6, cnes_id: 1, specialty_id: 1
		 	Procedure.create id: 7, cnes_id: 1, specialty_id: 1, treatment_type: 1
		 	Procedure.create id: 8, cnes_id: 1, specialty_id: 1, cid_primary: "A42"
		end

		it 'should return bad request for calls without params' do
			data = {}.to_json
			self.send(:get, 'proceduresPerHealthCentre', params: {data: data}, as: :json)
			expect(response.status).to eq(400)
			expect(response.body).to eq("Bad request")
		end

		it 'should return nil for wrong parameters' do
			data = {"filters" => [["3"]]}.to_json
			self.send(:get, 'proceduresPerHealthCentre', params: {data: data}, as: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq("{}")
		end

		it 'should return a hash of [HealthCentre => counter]' do
			data = {"filters" => [["1"]]}.to_json
			self.send(:get, 'proceduresPerHealthCentre', params: {data: data}, as: :json)
			expect(response.status).to eq(200)
			procedures = Procedure.where(cnes_id: 1)
			hc = HealthCentre.find_by(cnes: 1)
			expect(response.body).to eq({hc.name => procedures.count}.to_json)
		end

		it 'should return a hash of [HealthCentre => counter] for multiple cnes' do
			data = {"filters" => [["1", "2"], [], []]}.to_json
			self.send(:get, 'proceduresPerHealthCentre', params: {data: data}, as: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq({"Teste1" => 7, "Teste2" => 1}.to_json)
		end
	end

	describe 'Testing proceduresSetorCensitario method' do
		before :each do
			HealthCentre.create id: 1, cnes: 1, lat: -23.555885, long: -46.666458
			Specialty.create id: 1, name: "Specialty 1"

			Procedure.create id: 1, cnes_id: 1, specialty_id: 1, lat: -23.555885, long: -46.666458
			Procedure.create id: 2, cnes_id: 1, specialty_id: 1, lat: -23.555885, long: -46.666458
			Procedure.create id: 3, cnes_id: 1, specialty_id: 1, lat: -23.555885, long: -46.666458
		 	Procedure.create id: 4, cnes_id: 1, specialty_id: 1, lat: -1.5, long: -2.6
		 	Procedure.create id: 5, cnes_id: 1, specialty_id: 1, lat: -1.5, long: -2.6
		 	Procedure.create id: 6, cnes_id: 1, specialty_id: 1, lat: -1.5, long: -2.6
		 	Procedure.create id: 7, cnes_id: 1, specialty_id: 1, lat: -1.5, long: -2.6
		end

		it 'should return bad request when a call has no params' do
			self.send(:get, 'proceduresSetorCensitario', params: {data: {}.to_json}, as: :json)
			expect(response.status).to eq(400)
			expect(response.body).to eq("Bad request")
		end

		it 'should return empty json when a call has wrong parameters' do
			data = {"filters" => [["3"]]}.to_json
			self.send(:get, 'proceduresSetorCensitario', params: {data: data}, as: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq("[]")
		end

		it 'should return a array of ids when a call has correct parameters' do
			data = {"filters" => [["1"]]}.to_json
			self.send(:get, 'proceduresSetorCensitario', params: {data: data, "lat" => -23.555885, "long" => -46.666458}, as: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq("[1,2,3]")
		end
	end

	describe 'Testing getProcedures method' do
		# Always use before :each, before :all saves the data leading to erros later on
		before :each  do
			HealthCentre.create id: 1, cnes: 431, lat: -23.555885, long: -46.666458
			HealthCentre.create id: 2, cnes: 1, lat: -23.555885, long: -46.666458

			Specialty.create id: 1, name: "Specialty 1"
			Specialty.create id: 2, name: "Specialty 2"

			Procedure.create id: 1, cnes_id: 431, specialty_id: 1
			Procedure.create id: 2, cnes_id: 1, specialty_id: 1, age_code: "TP_0A4", gender: "M"
			Procedure.create id: 3, cnes_id: 1, specialty_id: 1, days: 50, gender: "F"
		 	Procedure.create id: 4, cnes_id: 1, specialty_id: 1, cmpt: 201502, gender: "M"
		 	Procedure.create id: 5, cnes_id: 1, specialty_id: 1, proce_re: 3030, days: 5
		 	Procedure.create id: 6, cnes_id: 1, specialty_id: 2, days: 1, date: Date.parse("20180909")
		 	Procedure.create id: 7, cnes_id: 1, specialty_id: 1, treatment_type: 1, days: 22
		 	Procedure.create id: 8, cnes_id: 1, specialty_id: 1, cid_primary: "A42", date: Date.parse("20180101")
		 	Procedure.create id: 9, cnes_id: 1, specialty_id: 1, cid_secondary: "B21"
		 	Procedure.create id: 10, cnes_id: 1, specialty_id: 1, cid_secondary2: "Z12"
		 	Procedure.create id: 11, cnes_id: 1, specialty_id: 1, cid_associated: "G92"
		 	Procedure.create id: 12, cnes_id: 1, specialty_id: 1, complexity: 3
		 	Procedure.create id: 13, cnes_id: 1, specialty_id: 1, finance: 6
		 	Procedure.create id: 14, cnes_id: 1, specialty_id: 1, race: 1
		 	Procedure.create id: 15, cnes_id: 1, specialty_id: 1, lv_instruction: 0
		 	Procedure.create id: 16, cnes_id: 1, specialty_id: 1, DA: "REPUBLICA"
		 	Procedure.create id: 17, cnes_id: 1, specialty_id: 1, PR: "SE"
		 	Procedure.create id: 18, cnes_id: 1, specialty_id: 1, STS: "SE"
		 	Procedure.create id: 19, cnes_id: 1, specialty_id: 1, CRS: "CENTRO"
		 	Procedure.create id: 20, cnes_id: 1, specialty_id: 1, gestor_ide: 1
		end

		it 'should raise an error for a call without parameters' do
			expect{controller.send :getProcedures}.to raise_error(ActionController::ParameterMissing)
		end

		it 'should return empty Active relation to a call without matching parameters' do
			filters = [["12455"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:cnes_id => 12455))
		end

		it 'should return all values in Procedure table with send_all set true' do
			data = {"send_all" => "True"}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.all)
			expect(assigns(:procedures).count).to eq(Procedure.count)
		end

		# Testing to see if its filtering correctly
		it 'should return the correct procedures for date' do
			data = {"start_date" => "20180811", "end_date" => "20181010"}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where("date BETWEEN ? AND ?", Date.parse("20180811"), Date.parse("20181010")))
		end

		it 'should return the correct procedures for genders' do
			genders = ["M"]
			data = {"genders" => genders}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(gender: genders))
		end

		it 'should return the correct procedures for slider days' do
			sliders= [[0, 5]]
			data = {"sliders" => sliders}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where("days >= 0 AND days <= 5"))
		end

		it 'should ignore the Slider_max delimiter value when it\'s equal to max' do
			sliders= [[3, 351]]
			data = {"sliders" => sliders}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where("days >= 3"))
		end

		it 'should return the correct procedure for cnes_id' do
			filters = [["431"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:cnes_id => 431))
		end

		it 'shoud return the correct procedure for cmpt' do
			filters = [[], ["201502"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:cmpt => 201502))
		end

		it 'shoud return the correct procedure for proce_re' do
			filters = [[],  [],  ["3030"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:proce_re => 3030))
		end

		it 'shoud return the correct procedure for specialty_id' do
			filters = [[],  [], [],  ["2"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:specialty_id => 2))
		end

		it 'shoud return the correct procedure for treatment_type' do
			filters = [[], [],  [], [], ["1"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:treatment_type => 1))
		end

		it 'shoud return the correct procedure for cid_primary' do
			filters = [[], [], [], [], [],  ["A42"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:cid_primary => "A42"))
		end

		it 'shoud return the correct procedure for cid_secondary' do
			filters = [[],  [],  [],  [], [],  [], ["B21"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:cid_secondary => "B21"))
		end

		it 'shoud return the correct procedure for cid_secondary2' do
			filters = [[], [], [], [], [], [], [], ["Z12"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:cid_secondary2 => "Z12"))
		end

		it 'shoud return the correct procedure for cid_associated' do
			filters = [[], [], [], [], [], [], [], [], ["G92"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:cid_associated => "G92"))
		end

		it 'shoud return the correct procedure for complexity' do
			filters = [[], [], [], [], [], [], [], [], [], ["3"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:complexity => 3))
		end

		it 'shoud return the correct procedure for finance' do
			filters = [[], [], [], [], [], [], [], [], [], [], ["6"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:finance => 6))
		end

		it 'should return the correct procedure for age_code' do
			filters = [[], [], [], [], [], [], [], [], [], [], [], ["TP_0A4"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:age_code => "TP_0A4"))
		end

		it 'shoud return the correct procedure for race' do
			filters = [[], [], [], [], [], [], [], [], [], [], [],[], ["1"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:race => 1))
		end

		it 'shoud return the correct procedure for lv_instruction' do
			filters = [[], [], [], [], [], [], [], [], [], [], [],[], [], ["0"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:lv_instruction => 0))
		end

		it 'shoud return the correct procedure for DA' do
			filters = [[], [], [], [], [], [], [], [], [], [], [],[], [], [], ["REPUBLICA"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:DA => "REPUBLICA"))
		end

		it 'shoud return the correct procedure for PR' do
			filters = [[], [], [], [], [], [], [], [], [], [], [],[], [], [], [], ["SE"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:PR => "SE"))
		end

		it 'shoud return the correct procedure for STS' do
			filters = [[], [], [], [], [], [], [], [], [], [], [],[], [], [], [], [], ["SE"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:STS => "SE"))
		end

		it 'shoud return the correct procedure for CRS' do
			filters = [[], [], [], [], [], [], [], [], [], [], [],[], [], [], [], [], [], ["CENTRO"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:CRS => "CENTRO"))
		end

		it 'shoud return the correct procedure for gestor_ide' do
			filters = [[], [], [], [], [], [], [], [], [], [], [],[], [], [], [], [], [], [], ["1"]]
			data = {"filters" => filters}.to_json
			controller.params[:data] = data
			controller.send :getProcedures
			expect(assigns(:procedures)).to eq(Procedure.where(:gestor_ide => 1))
		end
	end

    describe 'Testing proceduresTotal method' do
            before :each  do
                    HealthCentre.create id: 1, cnes: 431, lat: -23.555885, long: -46.666458
                    HealthCentre.create id: 2, cnes: 1, lat: -23.555885, long: -46.666458

                    Specialty.create id: 1, name: "Specialty 1"
                    Specialty.create id: 2, name: "Specialty 2"

                    Procedure.create id: 1, cnes_id: 431, specialty_id: 1
                    Procedure.create id: 2, cnes_id: 1, specialty_id: 1, age_code: "TP_0A4"
                    Procedure.create id: 3, cnes_id: 1, specialty_id: 1, days: 50
                    Procedure.create id: 4, cnes_id: 1, specialty_id: 1, cmpt: 201502
                    Procedure.create id: 5, cnes_id: 1, specialty_id: 1, proce_re: 3030
                    Procedure.create id: 6, cnes_id: 1, specialty_id: 2
                    Procedure.create id: 7, cnes_id: 1, specialty_id: 1, treatment_type: 1
                    Procedure.create id: 8, cnes_id: 1, specialty_id: 1, cid_primary: "A42"
                    Procedure.create id: 9, cnes_id: 1, specialty_id: 1, cid_secondary: "B21"
                    Procedure.create id: 10, cnes_id: 1, specialty_id: 1, cid_secondary2: "Z12"
                    Procedure.create id: 11, cnes_id: 1, specialty_id: 1, cid_associated: "G92"
                    Procedure.create id: 12, cnes_id: 1, specialty_id: 1, complexity: 3
                    Procedure.create id: 13, cnes_id: 1, specialty_id: 1, finance: 6
                    Procedure.create id: 14, cnes_id: 1, specialty_id: 1, race: 1
                    Procedure.create id: 15, cnes_id: 1, specialty_id: 1, lv_instruction: 0
                    Procedure.create id: 16, cnes_id: 1, specialty_id: 1, DA: "REPUBLICA"
                    Procedure.create id: 17, cnes_id: 1, specialty_id: 1, PR: "SE"
                    Procedure.create id: 18, cnes_id: 1, specialty_id: 1, STS: "SE"
                    Procedure.create id: 19, cnes_id: 1, specialty_id: 1, CRS: "CENTRO"
                    Procedure.create id: 20, cnes_id: 1, specialty_id: 1, gestor_ide: 1
            end

            it 'should return 20' do
		data = {"send_all" => "True"}.to_json
                    self.send(:get, 'proceduresTotal', params: {data: data},format: :json)
                    expect(response.status).to eq(200)
                    expect(response.body).to eq(Procedure.count.to_s)
            end
    end

	describe 'Testing proceduresInfo method' do
		before :each  do
			HealthCentre.create id: 1, cnes: 431, lat: -23.555885, long: -46.666458

			Specialty.create id: 1, name: "Specialty 1"

			Procedure.create id: 1, cnes_id: 431, specialty_id: 1, gender: 'F', age_number: 20, cid_primary: 'B22', CRS: "CENTRO", date: 20150829, distance: 4.5, lat: -23.49, long: -46.641791
			Procedure.create id: 2, cnes_id: 431, specialty_id: 1, gender: 'F', age_number: 20, cid_primary: 'B22', CRS: "CENTRO", date: 20150829, distance: 4.5, lat: -23.49
		end

		it 'should send the correct info and return 200' do
			self.send(:get, 'proceduresInfo', params: {id: 1})
			expect(response.status).to eq(200)
			expect(response.body).to eq(Procedure.where(id: 1).select(:cnes_id, :gender, :age_number, :cid_primary, :CRS, :date, :distance, :lat, :long).to_a.to_json)
		end

		it "sholud return [] when id don't exist" do
			self.send(:get, 'proceduresInfo', params: {id: 0})
			expect(response.status).to eq(200)
			expect(response.body).to eq("[]")
		end

		it "should raise an error when id is null" do
			expect{self.send(:get, 'proceduresInfo', params: {id: nil})}.to raise_error(ActionController::UrlGenerationError)
		end
	end

	describe 'Testing proceduresMaxValues method' do
		before :each do
			HealthCentre.create id: 1, cnes: 431, lat: -23.555885, long: -46.666458
			HealthCentre.create id: 2, cnes: 1, lat: -23.555885, long: -46.666458

			Specialty.create id: 1, name: "Specialty 1"
			Specialty.create id: 2, name: "Specialty 2"

			Procedure.create id: 1, cnes_id: 431, specialty_id: 1, days_ui: 2, days: 11, days_total: 2, days_uti: 2, val_total: 2, distance: 4
			Procedure.create id: 2, cnes_id: 431, specialty_id: 1, days_ui: 5, days: 5, days_total: 5, days_uti: 5, val_total: 5, distance: 4
			Procedure.create id: 3, cnes_id: 1, specialty_id: 1, days_ui: 7, days: 7, days_total: 7, days_uti: 7, val_total: 7, distance: 4
		end

		it 'should return 400' do
			data = {}.to_json
			self.send(:get, 'proceduresMaxValues', params: {data: data}, as: :json)
			expect(response.status).to eq(400)
			expect(response.body).to eq("Bad request")
		end

		it 'should return a constant when send_all == true' do
			data = {}.to_json
			self.send(:get, 'proceduresMaxValues', params: {data: data, send_all: "True"}, as: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq("[351,148,99,351,110787,85]")
		end

		it 'should return the max filtered values' do
			filters = [["431"]]
			data = {"filters" => filters}.to_json
			self.send(:get, 'proceduresMaxValues', params: {data: data}, as: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq("[11,5,5,5,5,4]")
		end

		it "should return [0,0,0,0,0,0] if there's no matches for the selected filter" do
			filters = [["2"]]
			data = {"filters" => filters}.to_json
			self.send(:get, 'proceduresMaxValues', params: {data: data}, as: :json)
			expect(response.status).to eq(200)
			expect(response.body).to eq("[0,0,0,0,0,0]")
		end
	end
end
