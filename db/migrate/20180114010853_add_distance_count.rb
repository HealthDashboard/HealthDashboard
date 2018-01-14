class AddDistanceCount < ActiveRecord::Migration[5.0]
  def change
  	   add_column :procedures, :distance_count, :integer
  end
end
