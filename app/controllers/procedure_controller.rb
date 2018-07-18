class ProcedureController < ApplicationController
	# Cons, AVOID USING NUMBERS, make a constant instead
	NUM_FILTERS = 19
	$MAX_SLIDERS = [351, 148, 99, 351, 100, 30]

	# GET /
	# Return "busca avancada" page
	def show
		@filters = ["Estabelecimento de ocorrência", "Faixa etária", "Especialidade do leito", "Caráter do atendimento", "Grupo étnico", "Nível de instrução", "Competência",
			"Grupo do procedimento autorizado", "Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Diagnóstico secundário 3 (CID-10)",
			"Tipo de financiamento", "Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", "Complexidade", "Gestão"]
		@sliders = ["Total geral de diárias", "Diárias UTI", "Diárias UI", "Dias de permanência", "Valor da parcela", "Distância de deslocamento(Km)"]

		# Values for filters
		health_centres = JSON.parse(File.read(Rails.root.join('public/health_centres.json')))
		age_group = JSON.parse(File.read(Rails.root.join('public/age_group.json')))
		specialties = JSON.parse(File.read(Rails.root.join('public/specialties.json')))
		treatments = [
			{ "id" => "1", "text" => "ELETIVO" },
			{ "id" => "2", "text" => "URGENCIA" },
			{ "id" => "3", "text" => "ACIDENTE NO LOCAL DE TRABALHO OU A SERVICO DA EMPRESA" },
			{ "id" => "5", "text" => "OUTROS TIPOS DE ACIDENTE DE TRANSITO" },
			{ "id" => "6", "text" => "OUTROS TIPOS DE LESOES E ENVENENAMENTOS POR AGENTES QUIMICOS OU FISICOS" },
		];
		race = JSON.parse(File.read(Rails.root.join('public/race.json')))
		lv_instruction = JSON.parse(File.read(Rails.root.join('public/lv_instruction.json')))
		cmpt = JSON.parse(File.read(Rails.root.join('public/cmpt.json')))
		proce_re = JSON.parse(File.read(Rails.root.join('public/proc_re.json')))
		cid = JSON.parse(File.read(Rails.root.join('public/CID10.json')))
		days = JSON.parse(File.read(Rails.root.join('public/total_days.json')))
		finance = JSON.parse(File.read(Rails.root.join('public/finance.json')))
		da = JSON.parse(File.read(Rails.root.join('public/DA.json')))
		pr = JSON.parse(File.read(Rails.root.join('public/PR.json')))
		sts = JSON.parse(File.read(Rails.root.join('public/STS.json')))
		crs = JSON.parse(File.read(Rails.root.join('public/CRS.json')))
		complexity = JSON.parse(File.read(Rails.root.join('public/complexity.json')))
		gestor = [{"id" => "00", "text" => "ESTADUAL"},
				  {"id" => "01", "text" => "MUNICIPAL"}];

		@options = [health_centres, age_group, specialties, treatments, race, lv_instruction, cmpt, proce_re, cid, cid, cid, cid, finance, da, pr, sts, crs, complexity, gestor]
	end

	# GET /procedure/update_session{data}
	# Ajax call, no template to render on browser
	# To pass the data add to your ajax call data = {values}
	# Session variable is updated
	def update_session
		if session[:filters] == nil || params[:filters] != nil
			session[:filters] = Array.new(NUM_FILTERS)
		end

		if params[:filters] != nil
			params[:filters].each_with_index do |filter, i|
				if filter != ""
					session[:filters][i] = filter.split(";")
				end
			end
		end

		if session[:sliders] == nil || params[:sliders] != nil
			session[:sliders] = Array.new(6)
		end

		if params[:sliders] != nil
			params[:sliders].each_with_index do |slider, i|
				session[:sliders][i] = [slider[1][0].to_i, slider[1][1].to_i]
			end
		end

		if params[:gender] != nil
			session[:genders] = params[:gender].to_s
			session[:genders] = session[:genders].split(",")
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

	# NO ROUTE, intern method
	# TODO - handle calls with no previous update_session. It probably throws a error now,
	# maybe send all data instead.
	# Return procedures based on the values passed in your last update_session
	def getProcedures
		filters_name = ["cnes_id", "age_code", "specialty_id", "treatment_type", "race", "lv_instruction", "cmpt", "proce_re", "cid_primary", "cid_secondary", "cid_secondary2",
		"cid_associated", "finance", "DA", "PR", "STS", "CRS", "complexity", "gestor_ide"]
		sliders_name = ["days", "days_uti", "days_ui", "days_total", "val_total", "distance"]

		update_session()

		if session[:genders].length < 2
			procedures = Procedure.where(gender: session[:genders])
		else
			procedures = Procedure.all
		end

		filters_name.each_with_index do |filter, i|
			if session[:filters][i] != nil
				procedures = procedures.where(filter => session[:filters][i])
			end
		end

		sliders_name.each_with_index do |slider, i|
			min =  session[:sliders][i][0]
			max = session[:sliders][i][1]
			if max == $MAX_SLIDERS[i]
				if min != 0
					procedures = procedures.where(slider + ' >= ?', min)
				end
			else
				procedures = procedures.where(slider + ' >= ? AND ' + slider + ' <= ?', min, max)
			end
		end

		if session[:start_date] != nil && session[:end_date] != nil
			procedures = procedures.where('date BETWEEN ? AND ?', session[:start_date], session[:end_date])
		end

		return procedures
	end


	# Procedures group by distance
	# GET /procedure/procedures_distance_group
	# Ajax call, no template to render on browser
	# Return JSON file
	def procedures_distance_group
		procedures = getProcedures()
		result = {"<= 1 Km" => procedures.where("distance <= ?", 1).count, "> 1 Km e <= 5 Km" =>  procedures.where("distance > ? AND distance <= ?", 1, 5).count, "> 5 Km e <= 10 Km" => procedures.where("distance > ? AND distance <= ?", 5, 10).count, "> 10 Km" => procedures.where("distance > ?", 10).count}
		render json: result
	end

	# Procedures group by month on metrics page
	# GET /procedure/procedures_distance_group
	# Ajax call, no template to render on browser
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
	# GET /procedure/procedures_distance_group
	# Ajax call, no template to render on browser
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
	# GET /procedure/procedures_distance_group
	# Ajax call, no template to render on browser
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
	# GET /procedure/procedures_distance_group
	# Ajax call, no template to render on browser
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
	# GET /procedure/procedures_distance_group
	# Ajax call, no template to render on browser
	def procedures_total
		render json: getProcedures().count
	end

	# Download csv file
	# Javascript is not allowed to download files, so this call is done with path_to rails method,
	# Because of this we cannot pass data directly in its call.
	# The workaround is first we use update_session to pass data to the controller then it's possible to
	# call this method to download filtered procedures.
	# TODO handle calls that maybe done before a update_session. *throws a error in current version *
	# Return CSV file.
	def download
	    procedures = getProcedures()

	    respond_to do |format|
	      format.html
	      format.csv { send_data procedures.copy_to_string, filename: "internacoes-hospitalares-#{Date.today}.csv", :disposition => "inline"}
	  	end
    end

	# Total number of procedures on metrics page
	# GET /procedure/health_centres_search
	# Ajax call, no template to render on browser
	# Returns JSON file(s).
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

	def procedures_latlong
		procedures = getProcedures().pluck(:lat, :long, :id);
		render json: procedures
	end

	# GET /procedure/procedure_info/:id
	# Given a procedure id returns its information
	def procedure_info
		procedure = Procedure.where(id: params[:id]).select(:cnes_id, :gender, :age_number, :cid_primary, :CRS, :date, :distance).to_a

		render json: procedure
	end
end
