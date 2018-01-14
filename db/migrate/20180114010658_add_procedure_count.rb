class AddProcedureCount < ActiveRecord::Migration[5.0]
  def change
    add_column :health_centres, :procedure_count, :integer
  end
end
