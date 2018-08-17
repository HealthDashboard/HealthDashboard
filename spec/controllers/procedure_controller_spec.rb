require 'rails_helper'
require 'spec_helper'

describe ProcedureController, type: 'controller' do
	describe 'median calculation' do
		it 'should give the middle value when the array is odd' do
			groups = {0=>1, 1=>1, 2=>1, 3=>1, 4=>1, 5=>1, 6=>1}
			median = controller.median_calc groups
			expect(median).to eq(3)
		end

		it 'should give the first middle value only when the array is even' do
			groups = {0=>1, 1=>1, 2=>1, 3=>1, 4=>1, 5=>1, 6=>1, 7=>1}
			median = controller.median_calc groups
			expect(median).to eq(3)
		end

		it 'should give the middle value when the array have higher counters' do
			groups = {0=>10, 1=>5, 2=>20, 3=>2, 4=>10, 5=>1, 6=>1}
			median = controller.median_calc groups
			expect(median).to eq(2)
		end
	end
end
