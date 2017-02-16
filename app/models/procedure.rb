class Procedure < ApplicationRecord
  belongs_to :cnes, :class_name => 'HealthCentre', foreign_key: :cnes_id, primary_key: :cnes
  acts_as_mappable lat_column_name: :lat, lng_column_name: :long

  def calculate_distance
    health_centre = self.cnes
    self.distance_to([health_centre.lat, health_centre.long]) if health_centre
  end
end
