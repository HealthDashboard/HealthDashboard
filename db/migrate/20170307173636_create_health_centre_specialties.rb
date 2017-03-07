class CreateHealthCentreSpecialties < ActiveRecord::Migration[5.0]
  def change
    create_table :health_centre_specialties do |t|
      t.references :health_centre, foreign_key: true
      t.references :specialty, foreign_key: true

      t.timestamps
    end
  end
end
