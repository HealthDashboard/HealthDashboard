class Type < ApplicationRecord
  has_many :health_centre_types
  has_many :health_centres, through: :health_centre_types
end
