class AddRegionToHealthCentre < ActiveRecord::Migration[5.0]
  def change
  	add_column :health_centres, :DA, :string
  	add_column :health_centres, :PR, :string
  	add_column :health_centres, :STS, :string
  	add_column :health_centres, :CRS, :string
  end
end
