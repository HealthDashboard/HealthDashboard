class AddProcedureToHealthCentre < ActiveRecord::Migration[5.0]
  def change
    add_reference :health_centres, :procedures, foreign_key: true
  end
end
