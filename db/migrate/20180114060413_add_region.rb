class AddRegion < ActiveRecord::Migration[5.0]
  def change
  	 add_column :procedures, :region, :string
  end
end
