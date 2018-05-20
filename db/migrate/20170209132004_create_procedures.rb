class CreateProcedures < ActiveRecord::Migration[5.0]
  def change
    create_table :procedures do |t|
      t.float :lat
      t.float :long
      t.string :gender
      t.integer :age_number
      t.string :age_code
      t.integer :race
      t.integer :lv_instruction
      t.integer :cnes_id
      t.integer :gestor_ide
      t.integer :treatment_type
      t.integer :cmpt
      t.date :date
      t.date :date_in
      t.date :date_out
      t.integer :complexity
      t.integer :proce_re
      t.string :cid_primary
      t.string :cid_secondary
      t.string :cid_secondary2
      t.string :cid_associated
      t.integer :days
      t.integer :days_uti
      t.integer :days_ui
      t.integer :days_total
      t.integer :finance
      t.float :val_total
      t.string :DA
      t.string :PR
      t.string :STS
      t.string :CRS
      t.float :distance
      t.timestamps
    end
  end
end
