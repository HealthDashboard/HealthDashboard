class ProcedureController < ApplicationController
	def allProcedures
		allProcedures = Procedure.all
		render json: allProcedures.to_a
	end

	def procedures_count
		total = Procedure.all.count
		render json: total
	end

	def show
		@filters = ["Estabelecimento de ocorrência", "Faixa etária", "Especialidade do leito", "Caráter do atendimento", "Grupo étnico", "Nível de instrução", "Competência",
			"Grupo do procedimento autorizado", "Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Diagnóstico secundário 3 (CID-10)", "Total geral de diárias", 
			"Diárias UTI", "Diárias UI", "Dias de permanência", "Tipo de financiamento", "Valor Total", "Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", "Complexidade", "Gestão"]
	end

	def update_session
		if session[:filters] == nil || params[:filters] != nil 
			session[:filters] = Array.new(24)
		end

		if params[:dist_min] != nil
			session[:dist_min] = params[:dist_min].to_f
		end

		if params[:dist_max] != nil
			session[:dist_max] = params[:dist_max].to_f
		end

		if params[:gender] != nil
			session[:genders] = params[:gender].to_s
			session[:genders] = session[:genders].split(",")
		end

		if params[:filters] != nil
			params[:filters].each_with_index do |filter, i|
				if filter != ""
					session[:filters][i] = filter.split(";")
				end
			end
		end

		if params[:start_date] != nil && params[:start_date].to_s != ""
			session[:start_date] = params[:start_date]
			session[:start_date] = Date.parse session[:start_date]
		elsif params[:start_date].to_s == ""
			session[:start_date] = nil
		end

		if params[:end_date] != nil && params[:end_date].to_s != ""
			session[:end_date] = params[:end_date]
			session[:end_date] = Date.parse session[:end_date]
		elsif params[:end_date].to_s == ""
			session[:end_date] = nil
		end
		return
	end

	def getProcedures
		filters_name = ["cnes_id", "age_code", "specialty_id", "treatment_type", "race", "lv_instruction", "cmpt", "proce_re", "cid_primary", "cid_secondary", "cid_secondary2", 
		"cid_associated", "days", "days_uti", "days_ui", "days_total", "finance", "val_total", "DA", "PR", "STS", "CRS", "complexity", "gestor_ide"]

		update_session()

		procedures = Procedure.where(gender: session[:genders])

		filters_name.each_with_index do |n, i|
			if session[:filters][i] != nil
				procedures = procedures.where(n => session[:filters][i])
			end
		end

		if session[:start_date] != nil && session[:end_date] != nil
			procedures = procedures.where('date BETWEEN ? AND ?', session[:start_date], session[:end_date])
		end

		if (session[:dist_max] == 30)
			procedures = procedures.where('distance >= ?', session[:dist_min])
		else
			procedures = procedures.where('distance >= ? AND distance <= ?', session[:dist_min], session[:dist_max])
		end
		
		return procedures
	end

	# Procedures group by month on metrics page
	def procedures_per_month
		procedures = getProcedures()
		result = Array.new(12)
		year = 2015
		procedures.where("date >= ? AND date <= ?", "2015-01-01", "2015-12-31")
		.group_by_month(:date).count.each_with_index do |d, i|
			result[i] = [year, i+1, d[1]]
		end
		render json: result
	end

	# Procedures group by health centre on metrics page
	def procedures_per_health_centre
		procedures = getProcedures()
		result = {}
		procedures.group(:cnes_id).order("count_id DESC").limit(10)
				  .count(:id).each_with_index do |p, i|
				result[HealthCentre.find_by(cnes: p[0]).name.to_s] = p[1].to_i
		end
		render json: result
	end

	# Procedures group by specialties count metrics page
	def procedures_per_specialties
		procedures = getProcedures()
		procedures = procedures.where("specialty_id < ?", 10).order(:specialty_id).group(:specialty_id).count
		result = {}
		procedures.each do |p|
			result[Specialty.find_by(id: p[0]).name] = p[1].to_i
		end
		render json: result
	end

	# Procedures group by specialties distance avarega on metrics page
	def procedures_distance
		procedures = getProcedures()
		result = {}
		procedures.where("specialty_id < ?", 10).order(:specialty_id).group(:specialty_id)
				  .average(:distance).each_with_index do |p, i|
				 	result[Specialty.find_by(id: p[0]).name.to_s] = p[1].round(2).to_f
		end
		render json: result
	end

	# Total number of procedures on metrics page
	def procedures_total
		render json: getProcedures().count
	end

	# Download csv file
	def download
	    procedures = getProcedures()

	    respond_to do |format|
	      format.html
	      format.csv { send_data procedures.copy_to_string, filename: "internacoes-hospitalares-#{Date.today}.csv", :disposition => "inline"}
	  	end
    end

	def health_centres_search
		procedures = getProcedures()

		hc = [];
		procedures.each do |p|
			hc << p.cnes_id
		end

		health_centres = HealthCentre.where(cnes: hc.uniq)
		procedures = procedures.select("long, lat, distance")
		procedures = procedures.to_a

		dist_min = params[:dist_min].to_f
		dist_max = params[:dist_max].to_f
		procedures.delete_if do |procedure|
			dist = procedure.distance
			if(dist == nil || dist < dist_min || (dist_max < 10 &&  dist > dist_max))
				true
			end
		end
		
		if params[:show_hc] == "true" and params[:show_rp] == "true"
			render json: {:health_centres => health_centres, :procedures => Procedures}
		elsif params[:show_hc] == "true"
			render json: {:health_centres => health_centres}
		elsif params[:show_rp] == "true"
			render json: {:procedures => Procedures}
		else
			render json: {:result => ""}
		end	
	end

	def health_centres_procedure
		cnes = params[:cnes].to_s
		cnes = cnes.split(",")
		health_centres = HealthCentre.where(cnes: cnes)
		render json: health_centres.to_a
	end

	def procedures_by_hc
		procedures = Procedure.where(cnes_id: params[:cnes].to_s)
		render json: procedures.to_a
	end

	def procedures_search
		procedures = getProcedures()
		oeste = procedures.where(CRS: "OESTE").count
		norte = procedures.where(CRS: "NORTE").count
		sul = procedures.where(CRS: "SUL").count
		leste = procedures.where(CRS: "LESTE").count
		centro = procedures.where(CRS: "CENTRO").count
		sudeste = procedures.where(CRS: "SUDESTE").count
		js = [{"oeste" => oeste,"norte" => norte,"leste" => leste,"sul" => sul,"sudeste" => sudeste,"centro" => centro}]
		render json: js
	end

	def procedures_latlong
		procedures = getProcedures().pluck(:lat, :long);
		render json: procedures
	end
end
