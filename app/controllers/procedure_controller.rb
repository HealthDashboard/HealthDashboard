class ProcedureController < ApplicationController
	@@Procedimentos = nil
	def index
	end

	def show
		# @@Proc = Procedure.all
		# @npages = count / 500 
	end

	def allProcedures
		@allProcedures = Procedure.all
		render json: @allProcedures.to_a
	end

	def health_centres
		@health_centres = []
		hc = HealthCentre.all
		hc.each do |h|
			healthcentres = {}
			healthcentres[:id] = h.cnes
			healthcentres[:text] = h.name
			@health_centres << healthcentres
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
		age_group = nil
		cdi = nil
		treatment_type = nil
		region = nil

		genders = params[:gender].to_s
		genders = genders.split(",")

		if params[:region].to_s != ""
			region = params[:region].to_s
			region = region.split(",")
		end

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

		if params[:age_group].to_s != ""
			age_group = params[:age_group].to_s
			age_group = age_group.split(",")
		end

		if params[:cdi].to_s != ""
			cdi = params[:cdi].to_s
			cdi = cdi.split(",")
		end

		if params[:treatment_type] != ""
			treatment_type = params[:treatment_type].to_s
			treatment_type = treatment_type.split(",")
		end

		@Procedures = Procedure.where(gender: genders)

		if region != nil
			@Procedures = @Procedures.where(region: region)
		end

		if health_centres != nil
			@Procedures = @Procedures.where(cnes_id: health_centres)
		end

		if specialties != nil
			@Procedures = @Procedures.where(specialty_id: specialties)
		end

		if start_date != nil && end_date != nil
			@Procedures = @Procedures.where('date BETWEEN ? AND ?', start_date, end_date)
		end

		if age_group != nil
			@Procedures = @Procedures.where(age_code: age_group)
		end

		if cdi != nil
			@Procedures = @Procedures.where(cid_primary: cdi)
		end	

		if treatment_type != nil
			@Procedures = @Procedures.where(treatment_type: treatment_type)
		end

		# @Procedures = @Procedures.to_a
		# puts "HERE"
		# @Procedures.delete_if do |procedure|
		# 	dist = procedure.distance
		# 	if(dist == nil || dist < dist_min || (dist_max < 10 &&  dist > dist_max))
		# 		true
		# 	end
		# end

		# @@Procedimentos = @Procedures
		return @Procedures
	end

	def health_centres_search
		# if (@@Procedimentos == nil)
		# 	puts "TRUE"
		# 	@Procedures = getProcedures()
		# 	if (@@Procedimentos == nil)
		# 		puts "Not OK"
		# 	end
		# else
		# 	@Procedures = @@Procedimentos
		# 	@@Procedimentos = nil
		# end
		@Procedures = getProcedures()

		hc = [];
		@Procedures.each do |p|
			hc << p.cnes_id
		end

		@health_centres = HealthCentre.where(cnes: hc.uniq)
		@Procedures = @Procedures.select("long, lat, distance")
		@Procedures = @Procedures.to_a
		# puts "HERE"
		dist_min = params[:dist_min].to_f
		dist_max = params[:dist_max].to_f
		@Procedures.delete_if do |procedure|
			dist = procedure.distance
			if(dist == nil || dist < dist_min || (dist_max < 10 &&  dist > dist_max))
				true
			end
		end
		
		if params[:show_hc] == "true" and params[:show_rp] == "true"
			render json: {:health_centres => @health_centres, :procedures => @Procedures}
		elsif params[:show_hc] == "true"
			render json: {:health_centres => @health_centres}
		elsif params[:show_rp] == "true"
			# @Procedures = @Procedures.select("long, lat")
			render json: {:procedures => @Procedures}
		else
			render json: {:result => ""}
		end
			
	end

	def health_centres_procedure
		@health_centres = HealthCentre.where(cnes: params[:cnes].to_s)
		render json: @health_centres.to_a
	end

	def procedures_by_hc
		@Procedures = Procedure.where(cnes_id: params[:cnes].to_s)
		render json: @Procedures.to_a
	end

	def procedures_search
		if (@@Procedimentos == nil)
			puts "TRUE"
			@Procedures = getProcedures()
		else
			@Procedures = @@Procedimentos
			@@Procedimentos = nil
		end
		render json: @Procedures
	end
end
