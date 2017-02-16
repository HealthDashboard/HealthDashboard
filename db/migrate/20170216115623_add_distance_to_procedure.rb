class AddDistanceToProcedure < ActiveRecord::Migration[5.0]
  def change
    add_column :procedures, :distance, :float
  end
end
