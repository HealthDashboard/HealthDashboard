class ProcedureController < ApplicationController
	helper_method :health_centres, :specialties, :allProcedures, :health_centres_search

	def index
	end

	def show
	end

	def allProcedures
		@allProcedures = Procedure.all
		render json: @allProcedures.to_a
	end

	def health_centres
		@procedures = Procedure.all
		@health_centres = []
		@procedures.each do |procedure|
			health_center = {}
			hc  = procedure.cnes
			if hc != nil
				health_center[:id] = hc.cnes
				health_center[:text] = hc.name
				@health_centres << health_center
			end
		end
		render json: @health_centres
	end



	def specialties
		@spec = []
		Specialty.all.each_with_index do |specialty, index|
			if specialty != nil
				sp = {}
				sp[:id] = index
				sp[:text] = specialty.name
				@spec << sp
			end
		end
		render json: @spec
	end

	def getProcedures
		health_centres = nil
		genders = nil
		specialties = nil
		start_date = nil
		end_date = nil

		genders = params[:gender].to_s
		genders = genders.split(",")

		if params[:cnes].to_s != ""
			health_centres = params[:cnes].to_s
			health_centres = health_centres.split(",")
		end

		if params[:specialties].to_s != ""
			specialties = params[:specialties].to_s
			specialties = specialties.split(",")
		end

		if params[:start_date].to_s != ""
			start_date = params[:start_date]
			start_date = Date.parse start_date
		end

		if params[:end_date].to_s != ""
			end_date = params[:end_date]
			end_date = Date.parse end_date
		end

		@Procedures = Procedure.where(gender: genders)

		if health_centres != nil
			@Procedures = @Procedures.where(cnes_id: health_centres)
		end

		if specialties != nil
			@Procedures = @Procedures.where(specialty_id: specialties)
		end

		if start_date != nil && end_date != nil
			@Procedures = @Procedures.where('date BETWEEN ? AND ?', start_date, end_date)
		end
		return @Procedures
	end

	def health_centres_search
		@Procedures = getProcedures()
		hc = [];
		@Procedures.each do |p|
			hc << p.cnes_id
		end
		# puts health_centres
		# health_centres = params[:cnes_ids]
		# health_centres = health_centres.split(",")

		@health_centres = HealthCentre.where(cnes: hc)

		render json: @health_centres
	end 

	def procedures_search
		# health_centres = nil
		# genders = nil
		# specialties = nil
		# start_date = nil
		# end_date = nil

		# genders = params[:gender].to_s
		# genders = genders.split(",")

		# if params[:cnes].to_s != ""
		# 	health_centres = params[:cnes].to_s
		# 	health_centres = health_centres.split(",")
		# end

		# if params[:specialties].to_s != ""
		# 	specialties = params[:specialties].to_s
		# 	specialties = specialties.split(",")
		# end

		# if params[:start_date].to_s != ""
		# 	start_date = params[:start_date]
		# 	start_date = Date.parse start_date
		# end

		# if params[:end_date].to_s != ""
		# 	end_date = params[:end_date]
		# 	end_date = Date.parse end_date
		# end

		# @Procedures = Procedure.where(gender: genders)

		# if health_centres != nil
		# 	@Procedures = @Procedures.where(cnes_id: health_centres)
		# end

		# if specialties != nil
		# 	@Procedures = @Procedures.where(specialty_id: specialties)
		# end

		# if start_date != nil && end_date != nil
		# 	@Procedures = @Procedures.where('date BETWEEN ? AND ?', start_date, end_date)
		# end
		@Procedures = getProcedures()

		render json: @Procedures.to_a
	end
end
