class Procedure < ApplicationRecord
  require 'csv'
  belongs_to :specialty
  belongs_to :cnes, :class_name => 'HealthCentre', foreign_key: :cnes_id, primary_key: :cnes
  acts_as_mappable lat_column_name: :lat, lng_column_name: :long

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

  def self.to_csv
    attributes = %w{id lat long gender age_number age_code race lv_instruction cnes_id gestor_ide treatment_type cmpt date complexity 
      proce_re cid_primary cid_secondary cid_secondary2 cid_associated days days_uti days_ui days_total finance 
      val_total DA PR STS CRS distance specialty_id}

    CSV.generate(headers: true) do |csv|
      csv << attributes

      all.each do |p|
        csv << attributes.map{ |attr| p.send(attr) }
      end
    end
  end

end
