class HealthCentreSpecialty < ApplicationRecord
  belongs_to :health_centre
  belongs_to :specialty
end
