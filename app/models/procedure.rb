class Procedure < ApplicationRecord
  belongs_to :specialty
  # change cnes => healthCentre
  belongs_to :cnes, :class_name => 'HealthCentre', foreign_key: :cnes_id, primary_key: :cnes
  acts_as_mappable lat_column_name: :lat, lng_column_name: :long
  acts_as_copy_target

  def calculate_distance
    health_centre = self.cnes
    self.distance_to([health_centre.lat, health_centre.long]) if health_centre
  end

  def dist_to(latlong)
  	return self.distance_to(latlong);
  end

  def calculate_distance_to(lat, long)
 	  if self.distance != nil and self.distance < self.distance_to([lat, long])
 		 return true
 	  else
 		 return false
 	  end
  end
end
