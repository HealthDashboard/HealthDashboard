require 'test_helper'

class HealthCentreFilterControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get health_centre_filter_index_url
    assert_response :success
  end

end
