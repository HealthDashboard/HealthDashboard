class HealthCentreFilterController < ApplicationController
  # GET /
  def index
    @HealthCentreSpecialty = HealthCentreSpecialty.includes(:health_centre).all.to_a
    @Specialties = Specialty.where("id < ?", 10).to_a
  end
end
