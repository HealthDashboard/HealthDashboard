class CreateHealthCentreTypes < ActiveRecord::Migration[5.0]
  def change
    create_table :health_centre_types do |t|
      t.references :health_centre, foreign_key: true
      t.references :type, foreign_key: true

      t.timestamps
    end
  end
end
