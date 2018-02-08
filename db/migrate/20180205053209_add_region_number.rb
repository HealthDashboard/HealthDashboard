class AddRegionNumber < ActiveRecord::Migration[5.0]
  def change
  	 add_column :procedures, :region_number, :integer
  end
end
