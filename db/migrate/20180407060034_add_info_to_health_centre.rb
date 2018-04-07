class AddInfoToHealthCentre < ActiveRecord::Migration[5.0]
  def change
  	add_column :health_centres, :type, :string
  	add_column :health_centres, :adm, :string
  end
end
