class RemoveInvalidDates < ActiveRecord::Migration[5.0]
	def change
		Procedure.where("date < ?", Date.parse("2013-12-31")).destroy_all
	end
end
