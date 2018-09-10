class Procedure < ApplicationRecord
  belongs_to :specialty
  # change cnes => healthCentre
  belongs_to :cnes, :class_name => 'HealthCentre', foreign_key: :cnes_id, primary_key: :cnes
  acts_as_mappable lat_column_name: :lat, lng_column_name: :long
  acts_as_copy_target

  def calculate_distance
    health_centre = self.cnes
    self.distance_to([health_centre.lat, health_centre.long]).round(1) if health_centre
  end
end
