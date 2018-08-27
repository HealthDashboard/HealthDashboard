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
			self.send(:get, 'procedure_quartiles', params: {send_all: "True"},format: :json)
			expect(response.status).to eq(200)
			expect(response.body).to_not be_nil
			expect(JSON.parse(response.body)).to eq([[2, 3.0, 6], [0, 0.0, 0], [0, 0.0, 0], [2, 3.0, 6], 
				[0.0, 0.0, 0.0], [2.34493573228911, 4.96823522661767, 10.4606915236337]])
		end

		it 'requires send_all parameter to be set' do
			expect{self.send(:get, 'procedure_quartiles', params: {send_all: nil})}.to raise_error(ActionController::ParameterMissing)
		end
	end
end