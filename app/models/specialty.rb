class Specialty < ApplicationRecord
  has_many :procedures
  has_many :health_centre_specialties
  has_many :health_centres, through: :health_centre_specialties
end
