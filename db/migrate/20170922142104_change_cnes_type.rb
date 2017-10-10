class ChangeCnesType < ActiveRecord::Migration[5.0]
  def change
  	change_column :health_centres, :cnes, 'integer USING CAST(cnes AS integer)'
  end
end
