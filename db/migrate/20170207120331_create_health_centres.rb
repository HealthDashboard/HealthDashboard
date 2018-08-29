class CreateHealthCentres < ActiveRecord::Migration[5.0]
  def change
    create_table :health_centres do |t|
      t.integer :cnes
      t.string :name
      t.string :name_r
      t.integer :beds
      t.float :long
      t.float :lat
      t.string :phone
      t.string :adm
      t.string :DA
      t.string :PR
      t.string :STS
      t.string :CRS
      t.timestamps
    end
  end
end
