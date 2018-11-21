require 'rails_helper'
require 'spec_helper'

describe DashboardController, type: 'controller' do
	it 'sould initialize' do
		controller.send :initialize
	end
end