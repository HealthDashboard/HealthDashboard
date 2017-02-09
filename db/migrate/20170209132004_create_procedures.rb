class CreateProcedures < ActiveRecord::Migration[5.0]
  def change
    create_table :procedures do |t|
      t.string :date
      t.string :age_code
      t.string :age_number
      t.string :gender
      t.string :race
      t.string :different_district
      t.string :cep_patient
      t.string :cid_associated
      t.string :cid_primary
      t.string :cid_secundary
      t.string :ethnicity
      t.float :long
      t.float :lat

      t.timestamps
    end
  end
end
