class CreateSectors < ActiveRecord::Migration[5.0]
  def change
    create_table :sectors do |t|
      t.string :cd_geocodi
      t.string :DA
      t.string :coordinates
      t.timestamps
    end
  end
end
