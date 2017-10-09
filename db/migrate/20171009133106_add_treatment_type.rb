class AddTreatmentType < ActiveRecord::Migration[5.0]
  def change
    add_column :procedures, :treatment_type, :integer
  end
end
