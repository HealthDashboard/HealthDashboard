class HealthCentre < ApplicationRecord
  has_many :procedures, foreign_key: :cnes_id, primary_key: :cnes
end
