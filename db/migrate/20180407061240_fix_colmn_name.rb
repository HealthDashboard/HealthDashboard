class FixColmnName < ActiveRecord::Migration[5.0]
  def change
  	rename_column :health_centres, :type, :hc_type
  end
end
