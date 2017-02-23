class AddSpecialtyToProcedure < ActiveRecord::Migration[5.0]
  def change
    add_reference :procedures, :specialty, index:true, foreign_key: true 
  end
end
