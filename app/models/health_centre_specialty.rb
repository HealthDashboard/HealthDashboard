class HealthCentreSpecialty < ApplicationRecord
  belongs_to :health_centre
  belongs_to :specialty
  validates_uniqueness_of :health_centre_id, :scope => :specialty_id
end
