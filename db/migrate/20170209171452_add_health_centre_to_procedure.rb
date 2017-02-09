class AddHealthCentreToProcedure < ActiveRecord::Migration[5.0]
  def change
    add_reference :procedures, :health_centre, foreign_key: true
  end
end
