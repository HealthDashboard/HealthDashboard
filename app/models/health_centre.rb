class HealthCentre < ApplicationRecord
  has_many :procedures, foreign_key: :cnes_id, primary_key: :cnes
  has_many :health_centre_specialties
  has_many :specialties, through: :health_centre_specialties
  has_many :health_centre_types
  has_many :types, through: :health_centre_types
end
