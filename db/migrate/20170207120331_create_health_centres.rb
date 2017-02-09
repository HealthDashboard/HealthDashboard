class CreateHealthCentres < ActiveRecord::Migration[5.0]
  def change
    create_table :health_centres do |t|
      t.float :long
      t.float :lat
      t.string :cnes
      t.string :name
      t.integer :beds
      t.string :phone
      t.string :census_district
      t.timestamps
    end
  end
end
