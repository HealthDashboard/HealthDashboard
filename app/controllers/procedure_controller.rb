class ProcedureController < ApplicationController
	# Cons, AVOID USING NUMBERS, make a constant instead
	NUM_FILTERS = 19
	$MAX_SLIDERS = [351,148,99,351,110786.71.ceil,52.4832033827607.ceil]

	# GET /
	# Return "busca avancada" page
	def show
		@filters = ["Estabelecimento de ocorrência", "Faixa etária", "Especialidade do leito", "Caráter do atendimento", "Raça/Cor", "Nível de instrução", "Competência (aaaamm)",
			"Grupo do procedimento autorizado", "Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Diagnóstico secundário 3 (CID-10)",
			"Tipo de financiamento", "Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", "Complexidade", "Gestão"]
		
		@diagnostic = ["Estabelecimento de ocorrência", "Competência (aaaamm)", "Grupo do procedimento autorizado", "Especialidade do leito", "Caráter do atendimento", 
		"Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Diagnóstico secundário 3 (CID-10)", "Complexidade"]
		@patient_info = ["Faixa etária", "Raça/Cor", "Nível de instrução"]
		@location = ["Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde"]
		@establishment = ["Gestão", "Tipo de financiamento"]

		#'Hints' to display on each label
		@titles_filters = ["Estabelecimento de ocorrência do procedimento de busca.", "Faixa etária dos pacientes internados.", "Especialidade do leito do paciente.", "Caráter da internação do paciente.", "Etnia do paciente.", "Escolaridade/grau de intrução do paciente.", "Competência de apresentação da AIH. Ex: 201506(junho de 2015).",
			"Grupo do procedimento autorizado ao paciente.", "Código do diagnóstico principal de internação.", "Código do diagnóstico secundário de internação.", "Código do diagnóstico secundário 2 de internação.", "Código do diagnóstico secundário 3 de internação.",
			"Tipo de financiamento da internação do paciente.", "Distrito administrativo da internação.", "Subprefeitura da internação.", "Supervisão técnica de saúde", "Coordenadoria regional de saúde", "Complexidade da internação.", "Gestão(Municipal/Estadual)."]
		
		@titles_diagnostic_filters = ["Estabelecimento de ocorrência do procedimento de busca.", "Competência de apresentação da AIH. Ex: 201506(junho de 2015).", "Grupo do procedimento autorizado ao paciente.", "Especialidade do leito do paciente.", "Caráter da internação do paciente.",
			"Código do diagnóstico principal de internação.", "Código do diagnóstico secundário de internação.", "Código do diagnóstico secundário 2 de internação.", "Código do diagnóstico secundário 3 de internação.", "Complexidade da internação."]

		@titles_patient_info_filters = ["Faixa etária dos pacientes internados.", "Etnia do paciente.", "Escolaridade/grau de intrução do paciente."]

		@titles_location_filters = ["Distrito administrativo da internação.", "Subprefeitura da internação.", "Supervisão técnica de saúde", "Coordenadoria regional de saúde"]

		@titles_establishment_filters = ["Gestão(Municipal/Estadual).", "Tipo de financiamento da internação do paciente."]

		@sliders = ["Total geral de diárias", "Diárias UTI", "Diárias UI", "Dias de permanência", "Valor da parcela", "Distância de deslocamento(Km)"]

		# 'Hints' to display on each slider
		@titles_sliders = ["Total geral de diárias de internações.", "Diárias de unidade de tratamento intensiva.", "Diárias de unidade intermediária.", "Dias de permanência do paciente internado.", "Valor da parcela de financiamento.", "Distância de deslocamento do paciente."]

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
		@options_diagnostic = [health_centres, cmpt, proce_re, specialties, treatments, cid, cid, cid, cid, complexity]
		@options_patient_info = [age_group, race, lv_instruction]
		@options_location = [da, pr, sts, crs]
		@options_establishment = [gestor, finance]

	end

	# GET /procedure/update_session{data}
	# Ajax call, no template to render on browser
	# To pass the data add to your ajax call data = {values}
	# Session variable is updated
	def update_session
		if params[:hasData] != nil
			session[:hasData] = true
		end

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
		#filters_name = ["cnes_id", "age_code", "specialty_id", "treatment_type", "race", "lv_instruction", "cmpt", "proce_re", "cid_primary", "cid_secondary", "cid_secondary2",
		#"cid_associated", "finance", "DA", "PR", "STS", "CRS", "complexity", "gestor_ide"]
		filters_name = ["cnes_id", "cmpt", "proce_re", "specialty_id", "treatment_type", "cid_primary", "cid_secondary", "cid_secondary2",
			"cid_associated", "complexity", "age_code", "race", "lv_instruction", "DA", "PR", "STS", "CRS", "finance", "gestor_ide"]
		
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
	# GET /procedure/procedures_total
	# Ajax call, no template to render on browser
	def procedures_total
		if params[:hasData] == nil
			render json: Procedure.all.count
		else
			render json: getProcedures().count
		end
	end

	# Download csv file
	# Javascript is not allowed to download files, so this call is done with path_to rails method,
	# Because of this we cannot pass data directly in its call.
	# The workaround is first we use update_session to pass data to the controller then it's possible to
	# call this method to download filtered procedures.
	# Return CSV file.

	def download
		if session[:filters] == nil
			procedures = Procedure.all
		else
			procedures = getProcedures()
		end

		procedures = procedures.select('id as "COD"', 'lat AS "LAT_SC"', 'long as "LONG_SC"', 'gender as "P_SEXO"', 
			'age_number as "P_IDADE"', 'race as "P_RACA"', 'lv_instruction as "LV_INSTRU"', 'cnes_id as "CNES"', 
			'gestor_ide as "GESTOR_ID"', 'treatment_type as "CAR_INTEN"', 'cmpt as "CMPT"', 'date as "DT_EMISSAO"', 
			'date_in as "DT_INTERNA"', 'date_out as "DT_SAIDA"', 'complexity as "COMPLEXIDA"', 'proce_re as "PROC_RE"', 
			'cid_primary as "DIAG_PR"', 'cid_secondary as "DIAG_SE1"', 'cid_secondary2 as "DIAG_SE2"', 
			'cid_associated as "DIAG_SE3"', 'days as "DIARIAS"', 'days_uti as "DIARIAS_UT"', 'days_ui as "DIARIAS_UI"', 
			'days_total as "DIAS_PERM"', 'finance as "FINANC"', 'replace(val_total::text, \'.\', \',\') as "VAL_TOT"', '"DA" as "DA"', '"PR" as "SUB"', 
			'"STS" as "STS"', '"CRS" as "CRS"', 'replace(distance::text, \'.\', \',\') as "DISTANCIA_KM"')

		enumerator = procedures.copy_to_enumerator(:buffer_lines => 100, :delimiter => ";")
		# Tell Rack to stream the content
		headers.delete("Content-Length")

		# Don't cache anything from this generated endpoint
		headers["Cache-Control"] = "no-cache"

		# Tell the browser this is a CSV file
		headers["Content-Type"] = "text/csv"

		# Make the file download with a specific filename
		headers["Content-Disposition"] = "inline; filename=\"internacoes-hospitalares-#{Date.today}.csv\""

		# Don't buffer when going through proxy servers
		headers["X-Accel-Buffering"] = "no"

		# Set an Enumerator as the body
		self.response_body = enumerator

		# Set the status to success
		response.status = 200
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
		procedure = Procedure.where(id: params[:id]).select(:cnes_id, :gender, :age_number, :cid_primary, :CRS, :date, :distance, :lat, :long).to_a

		render json: procedure
	end

	# GET /procedure/procedure_large_cluster
	# For search results of 50k or more points
	# Return a array of [[lat, long], number_of_pacients]
	def procedure_large_cluster
		if params[:hasData] == nil
			procedures = Procedure.all
		else
			procedures = getProcedures()
		end

		procedures = procedures.group(:lat, :long).count

		render json: procedures.to_a
	end

	def procedure_setor
		if session[:hasData] == true
			procedures = getProcedures()
		else
			procedures = Procedure.all
		end

		procedures = procedures.where(:lat => params[:lat], :long => params[:long]).pluck(:id)
		render json: procedures
	end

	# GET /procedure/max_values
	# return max filter values given the search parameters
	def max_values
		if params[:send_all] == "True"
			render json: [351,148,99,351,110786.71.ceil,52.4832033827607.ceil] #default value for faster load time
			return
		end

		procedure = getProcedures()
		max = []
		[:days, :days_uti, :days_ui, :days_total, :val_total, :distance].each do |filter|
			max.append((procedure.maximum(filter)).ceil)
		end
		render json: max
	end

	# GET /procedure/procedure_median
	# return the median for the filter values given the search parameters
	def procedure_median
		if params[:send_all] == "True"
			render json: [3.0,0.0,0.0,3.0,0.0,4.96823522661767] # default value for faster load time
			return
		end

		procedure = getProcedures()
		median = []
		# 1 - days(Total Geral de Diárias)
		days = procedure.pluck(:days)
		median.append(DescriptiveStatistics::Stats.new(days).median)
		# 2 - days_uti(Diárias UTI)
		days_uti = procedure.pluck(:days_uti)
		median.append(DescriptiveStatistics::Stats.new(days_uti).median)
		# 3 - days_ui(Diárias UI)
		days_ui = procedure.pluck(:days_ui)
		median.append(DescriptiveStatistics::Stats.new(days_ui).median)
		# 4 - days_total(Dias de permanência)
		days_total = procedure.pluck(:days_total)
		median.append(DescriptiveStatistics::Stats.new(days_total).median)
		# 5 - val_total(Valor da Parcela)
		val_total = procedure.pluck(:val_total)
		median.append(DescriptiveStatistics::Stats.new(val_total).median)
		# 6 - distance(Distância de Deslocamento)
		distance = procedure.pluck(:distance)
		median.append(DescriptiveStatistics::Stats.new(distance).median)
		render json: median
	end
end
