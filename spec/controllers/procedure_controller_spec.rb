require 'rails_helper'
require 'spec_helper'

describe ProcedureController, type: 'controller' do
	describe 'quartiles calculation' do
		it 'should return a array of [q1, q2(median), q3]' do
			groups = {0=>25, 1=>25, 2=>25, 3=>25}
			median = controller.quartiles_calc groups
			expect(median).to eq([0, 1.0, 2])
		end

		it 'should return a array of [q1, q2(median), q3] for a array without counters' do
			groups = {0=>1, 1=>1, 2=>1, 3=>1, 4=>1, 5=>1, 6=>1, 7=>1}
			median = controller.quartiles_calc groups
			expect(median).to eq([1, 3, 5])
		end

		it 'should return a array of [q1, q2(median), q3] for an array with counters' do
			groups = {0=>10, 1=>5, 2=>20, 3=>2, 4=>10, 5=>1, 6=>1}
			median = controller.quartiles_calc groups
			expect(median).to eq([1, 2, 3])
		end
	end

	describe 'Testing procedures quartiles method' do
		it 'should return default values when send all is set' do
			self.send(:get, 'procedure_quartiles', params: {data: "True", send_all: "True"},format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to_not be_nil
			expect(JSON.parse(response.body)).to eq([[2, 3.0, 6], [0, 0.0, 0], [0, 0.0, 0], [2, 3.0, 6], 
				[0.0, 0.0, 0.0], [2.34493573228911, 4.96823522661767, 10.4606915236337]])
		end

		it 'requires send_all parameter to be set' do
			expect{self.send(:get, 'procedure_quartiles', params: {data: nil})}.to raise_error(ActionController::ParameterMissing)
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

		it 'should return nil for a call without parameters' do
			expect(controller.getProcedures()).to eq(nil)
		end

		it 'should return nil to a call without matching parameters' do
			filters = ["12455"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(nil)
		end

		it 'should return all values in Procedure table with send_all set true' do
			controller.params[:send_all] = "True"
			expect(controller.getProcedures).to eq(Procedure.all)
			expect(controller.getProcedures.count).to eq(Procedure.count)
		end

		# Testing to see if its filtering correctly
		it 'should return the correct procedure for cnes_id' do
			filters = ["431"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:cnes_id => 431))
		end

		it 'shoud return the correct procedure for cmpt' do
			filters = ["", "201502"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:cmpt => 201502))
		end

		it 'shoud return the correct procedure for proce_re' do
			filters = ["",  "",  "3030"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:proce_re => 3030))
		end

		it 'shoud return the correct procedure for specialty_id' do
			filters = ["",  "", "",  "2"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:specialty_id => 2))
		end

		it 'shoud return the correct procedure for treatment_type' do
			filters = ["", "",  "", "", "1"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:treatment_type => 1))
		end

		it 'shoud return the correct procedure for cid_primary' do
			filters = ["", "", "", "", "",  "A42"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:cid_primary => "A42"))
		end

		it 'shoud return the correct procedure for cid_secondary' do
			filters = ["",  "",  "",  "", "",  "", "B21"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:cid_secondary => "B21"))
		end

		it 'shoud return the correct procedure for cid_secondary2' do
			filters = ["", "", "", "", "", "", "", "Z12"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:cid_secondary2 => "Z12"))
		end

		it 'shoud return the correct procedure for cid_associated' do
			filters = ["", "", "", "", "", "", "", "", "G92"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:cid_associated => "G92"))
		end

		it 'shoud return the correct procedure for complexity' do
			filters = ["", "", "", "", "", "", "", "", "", "3"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:complexity => 3))
		end

		it 'shoud return the correct procedure for finance' do
			filters = ["", "", "", "", "", "", "", "", "", "","6"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:finance => 6))
		end

		it 'should return the correct procedure for age_code' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","TP_0A4"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:age_code => "TP_0A4"))
		end

		it 'shoud return the correct procedure for race' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "1"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:race => 1))
		end

		it 'shoud return the correct procedure for lv_instruction' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "0"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:lv_instruction => 0))
		end

		it 'shoud return the correct procedure for DA' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "", "REPUBLICA"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:DA => "REPUBLICA"))
		end

		it 'shoud return the correct procedure for PR' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "", "", "SE"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:PR => "SE"))
		end

		it 'shoud return the correct procedure for STS' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "SE"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:STS => "SE"))
		end

		it 'shoud return the correct procedure for CRS' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "", "CENTRO"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:CRS => "CENTRO"))
		end

		it 'shoud return the correct procedure for gestor_ide' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "", "", "1"]
			controller.params[:filters] = filters
			expect(controller.getProcedures).to eq(Procedure.where(:gestor_ide => 1))
		end
	end

	describe 'Testing update session method' do
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

		it 'should be nil if the parameters is not passed' do
			controller.update_session
			expect(controller.session[:hasData]).to eq(nil)
		end

		# Testing to see if its updating correctly
		it 'should update the session var for cnes_id' do
			filters = ["431"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][0]).to eq(["431"])
		end

		it 'should update the session var for cmpt' do
			filters = ["", "201502"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][1]).to eq(["201502"])
		end

		it 'should update the session var for proce_re' do
			filters = ["",  "",  "3030"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][2]).to eq(["3030"])
		end

		it 'should update the session var for specialty_id' do
			filters = ["",  "", "",  "2"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][3]).to eq(["2"])
		end

		it 'should update the session var for treatment_type' do
			filters = ["", "",  "", "", "1"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][4]).to eq(["1"])
		end

		it 'should update the session var for cid_primary' do
			filters = ["", "", "", "", "",  "A42"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][5]).to eq(["A42"])
		end

		it 'should update the session var for cid_secondary' do
			filters = ["",  "",  "",  "", "",  "", "B21"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][6]).to eq(["B21"])
		end

		it 'should update the session var for cid_secondary2' do
			filters = ["", "", "", "", "", "", "", "Z12"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][7]).to eq(["Z12"])
		end

		it 'should update the session var for cid_associated' do
			filters = ["", "", "", "", "", "", "", "", "G92"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][8]).to eq(["G92"])
		end

		it 'should update the session var for complexity' do
			filters = ["", "", "", "", "", "", "", "", "", "3"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][9]).to eq(["3"])
		end

		it 'should update the session var for finance' do
			filters = ["", "", "", "", "", "", "", "", "", "","6"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][10]).to eq(["6"])
		end

		it 'should update the session var for age_code' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","TP_0A4"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][11]).to eq(["TP_0A4"])
		end

		it 'should update the session var for race' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "1"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][12]).to eq(["1"])
		end

		it 'should update the session var for lv_instruction' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "0"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][13]).to eq(["0"])
		end

		it 'should update the session var for DA' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "", "REPUBLICA"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][14]).to eq(["REPUBLICA"])
		end

		it 'should update the session var for PR' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "", "", "SE"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][15]).to eq(["SE"])
		end

		it 'should update the session var for STS' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "SE"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][16]).to eq(["SE"])
		end

		it 'should update the session var for CRS' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "", "CENTRO"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][17]).to eq(["CENTRO"])
		end

		it 'should update the session var for gestor_ide' do
			filters = ["", "", "", "", "", "", "", "", "", "", "","", "", "", "", "", "", "", "1"]
			controller.params[:filters] = filters
			controller.update_session
			expect(controller.session[:filters][18]).to eq(["1"])
		end
	end
end