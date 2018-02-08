class ProcedureController < ApplicationController
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

	def procedures_count
		@total = Procedure.all.count
		render json: @total
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
		dist_min = params[:dist_min].to_f
		dist_max = params[:dist_max].to_f
		# distance = nil

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

		if (dist_max == 30)
			@Procedures = @Procedures.where('distance >= ?', dist_min)
		else
			@Procedures = @Procedures.where('distance BETWEEN ? AND ?', dist_min, dist_max)
		end
		
		return @Procedures
	end

	def health_centres_search
		@Procedures = getProcedures()

		hc = [];
		@Procedures.each do |p|
			hc << p.cnes_id
		end

		@health_centres = HealthCentre.where(cnes: hc.uniq)
		@Procedures = @Procedures.select("long, lat, distance")
		@Procedures = @Procedures.to_a

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
		oeste_points = [[-23.538900, -46.732634], [-23.538270, -46.689376], [-23.585633, -46.732806], [-23.578710, -46.676673]]

		norte_points = [[-23.440030, -46.738127], [-23.456408, -46.611785], [-23.482862, -46.724395], [-23.488529, -46.624144]]

		leste_points = [[-23.511041, -46.425704], [-23.514189, -46.479949], [-23.585633, -46.437377], [-23.584059, -46.490248]]

		sudeste_points = [[-23.533549, -46.549987], [-23.579182, -46.552047], [-23.589408, -46.595992], [-23.611116, -46.621226]]

		sul_points = [[-23.639425, -46.741389], [-23.660496, -46.654872], [-23.715830, -46.693324], [-23.813707, -46.709288]]

		centro_points = [[-23.568577, -46.631364], [-23.548680, -46.636640]]

		procedures_points = getProcedures()

		oeste = @Procedures.where(region: "OESTE");
		norte = @Procedures.where(region: "NORTE");
		sul = @Procedures.where(region: "SUL");
		leste = @Procedures.where(region: "LESTE");
		centro = @Procedures.where(region: "CENTRO");
		sudeste = @Procedures.where(region: "SUDESTE");

		oeste1 = oeste.where(region_number: 0).count
		oeste2 = oeste.where(region_number: 1).count
		oeste3 = oeste.where(region_number: 2).count
		oeste4 = oeste.where(region_number: 3).count

		norte1 = norte.where(region_number: 0).count
		norte2 = norte.where(region_number: 1).count
		norte3 = norte.where(region_number: 2).count
		norte4 = norte.where(region_number: 3).count

		leste1 = leste.where(region_number: 0).count
		leste2 = leste.where(region_number: 1).count
		leste3 = leste.where(region_number: 2).count
		leste4 = leste.where(region_number: 3).count

		sul1 = sul.where(region_number: 0).count
		sul2 = sul.where(region_number: 1).count
		sul3 = sul.where(region_number: 2).count
		sul4 = sul.where(region_number: 3).count

		sudeste1 = sudeste.where(region_number: 0).count
		sudeste2 = sudeste.where(region_number: 1).count
		sudeste3 = sudeste.where(region_number: 2).count
		sudeste4 = sudeste.where(region_number: 3).count

		centro1 = centro.where(region_number: 0).count
		centro2 = centro.where(region_number: 1).count

		@JS = [[oeste1, oeste2, oeste3, oeste4],
		[norte1, norte2, norte3, norte4],
		[leste1, leste2, leste3, leste4],
		[sul1, sul2, sul3, sul4],
		[sudeste1, sudeste2, sudeste3, sudeste4],
		[centro1, centro2]];

		render json: @JS
	end
end
