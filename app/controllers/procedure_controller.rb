class ProcedureController < ApplicationController
	# Cons, AVOID USING NUMBERS, make a constant instead
	NUM_FILTERS = 19
	$MAX_SLIDERS = [351,148,99,351,110786.71.ceil,52.4832033827607.ceil]

	# GET /
	# Params: None
	# Return: "busca avancada" page
	def show
		@procedure = ["Estabelecimento de ocorrência", "Competência (aaaamm)", "Grupo do procedimento autorizado", "Especialidade do leito", "Caráter do atendimento", 
		"Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Diagnóstico secundário 3 (CID-10)", "Complexidade", "Tipo de financiamento"]
		@patient_info = ["Faixa etária", "Raça/Cor", "Nível de instrução"]
		@establishment = ["Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", "Gestão"]

		#'Hints' to display on each label
		@titles_filters = ["Estabelecimento do atendimento prestado.", "Faixa etária do paciente.", "Especialidade do leito de internação.", "Caráter da internação.", "Raça/Cor do paciente.", "Grau de instrução do paciente.", "Ano/mês de processamento da AIH. Ex: 201506(junho de 2015).",
			"Grupo do procedimento.", "Motivo da internação.", "Motivo que levou ao diagnóstico principal.", "Motivo que levou ao diagnóstico principal.", "Motivo que levou ao diagnóstico principal.",
			"Tipo de financiamento da internação.", "Divisão administrativa da internação.", "Subprefeitura do estabelecimento.", "Supervisão técnica de saúde.", "Coordenadoria regional de saúde.", "Nível de atenção para realização do procedimento.", "Secretaria responsável."]
		
		@titles_procedure_filters = ["Estabelecimento do atendimento prestado.", "Ano/mês de processamento da AIH. Ex: 201506(junho de 2015).", "Grupo do procedimento autorizado ao paciente.", "Especialidade do leito de internação.", "Caráter da internação.",
			"Motivo da internação.", "Motivo que levou ao diagnóstico principal.", "Motivo que levou ao diagnóstico principal.", "Motivo que levou ao diagnóstico principal.", "Nível de atenção para realização do procedimento.", "Tipo de financiamento da internação."]

		@titles_patient_info_filters = ["Faixa etária do paciente.", "Raça/Cor do paciente.", "Grau de instrução do paciente."]

		@titles_establishment_filters = ["Distrito administrativo da internação.", "Subprefeitura do estabelecimento.", "Supervisão técnica de saúde.", "Coordenadoria regional de saúde.", "Secretaria responsável."]

		@sliders = ["Total geral de diárias", "Diárias UTI", "Diárias UI", "Dias de permanência", "Valor da parcela", "Distância de deslocamento(Km)"]

		# 'Hints' to display on each slider
		@titles_sliders = ["Total geral de dias de internação.", "Diárias de unidade de tratamento intensiva.", "Diárias de unidade intermediária.", "Total de dias de internação.", "Valor do serviço.", "Distância de deslocamento do paciente."]

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
		finance = JSON.parse(File.read(Rails.root.join('public/finance.json')))
		da = JSON.parse(File.read(Rails.root.join('public/DA.json')))
		pr = JSON.parse(File.read(Rails.root.join('public/PR.json')))
		sts = JSON.parse(File.read(Rails.root.join('public/STS.json')))
		crs = JSON.parse(File.read(Rails.root.join('public/CRS.json')))
		complexity = JSON.parse(File.read(Rails.root.join('public/complexity.json')))
		gestor = [{"id" => "00", "text" => "ESTADUAL"},
				  {"id" => "01", "text" => "MUNICIPAL"}];

		@options = [health_centres, age_group, specialties, treatments, race, lv_instruction, cmpt, proce_re, cid, cid, cid, cid, finance, da, pr, sts, crs, complexity, gestor]
		@options_procedure = [health_centres, cmpt, proce_re, specialties, treatments, cid, cid, cid, cid, complexity, finance]
		@options_patient_info = [age_group, race, lv_instruction]
		@options_establishment = [da, pr, sts, crs, gestor]

	end

	# Ajax call, no template to render on browser
	# To pass the data add to your ajax call data = {values}
	# GET /procedure/update_session{params}
	# Params: [filters values array]
	# Return: Session variable is updated
	def update_session
		if params[:hasData] != nil
			session[:hasData] = true
		end

		if session[:filters] == nil || params[:filters] != nil
			session[:filters] = Array.new(NUM_FILTERS)
		end

		if params[:filters] != nil
			params[:filters].each_with_index do |filter, i|
					session[:filters][i] = filter.split(";") unless filter == ""
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
	# Params: [filters values array]
	# Return: procedures based on the values passed in your last update_session
	# TODO - handle calls with no previous update_session. It probably throws a error now,
	# maybe send all data instead.
	def getProcedures
		filters_name = ["cnes_id", "cmpt", "proce_re", "specialty_id", "treatment_type", "cid_primary", "cid_secondary", "cid_secondary2",
			"cid_associated", "complexity", "finance", "age_code", "race", "lv_instruction", "DA", "PR", "STS", "CRS", "gestor_ide"]
		
		sliders_name = ["days", "days_uti", "days_ui", "days_total", "val_total", "distance"]

		update_session()

		procedures = session[:genders].length < 2 ? Procedure.where(gender: session[:genders]) : procedures = Procedure.all

		filters_name.each_with_index do |filter, i|
				procedures = procedures.where(filter => session[:filters][i]) unless session[:filters][i] == nil
		end

		sliders_name.each_with_index do |slider, i|
			min =  session[:sliders][i][0]
			max = session[:sliders][i][1]
			if max == $MAX_SLIDERS[i]
					procedures = procedures.where(slider + ' >= ?', min) unless min == 0
			else
				procedures = procedures.where(slider + ' >= ? AND ' + slider + ' <= ?', min, max)
			end
		end

		if session[:start_date] != nil && session[:end_date] != nil
			procedures = procedures.where('date BETWEEN ? AND ?', session[:start_date], session[:end_date])
		end

		return procedures
	end


	# GET /procedure/procedures_distance_group{params}
	# Params: [filters values array]
	# Return: Hash of {interval => count_of_procedures}
	def procedures_distance_group
		procedures = getProcedures()
		result = {"<= 1 Km" => procedures.where("distance <= ?", 1).count, "> 1 Km e <= 5 Km" =>  procedures.where("distance > ? AND distance <= ?", 1, 5).count, "> 5 Km e <= 10 Km" => procedures.where("distance > ? AND distance <= ?", 5, 10).count, "> 10 Km" => procedures.where("distance > ?", 10).count}
		render json: result
	end

	# GET /procedure/procedures_per_month{params}
	# Params: [filters values array]
	# Return: An array of [procedures_per_month]
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

	# GET /procedure/procedures_per_health_centre{params}
	# Params: [filters values array]
	# Return: Hash of {helath_centre => total_of_procedures}
	def procedures_per_health_centre
		procedures = getProcedures()
		result = {}
		procedures.group(:cnes_id).order("count_id DESC").limit(10)
				  .count(:id).each_with_index do |p, i|
				result[HealthCentre.find_by(cnes: p[0]).name.to_s] = p[1].to_i
		end
		render json: result
	end

	# GET /procedure/procedures_per_specialties{params}
	# Params: [filters values array]
	# Return: Hash of {specialty => total_of_procedures}
	def procedures_per_specialties
		procedures = getProcedures()
		procedures = procedures.where("specialty_id < ?", 10).order(:specialty_id).group(:specialty_id).count
		result = {}
		procedures.each do |p|
			result[Specialty.find_by(id: p[0]).name] = p[1].to_i
		end
		render json: result
	end

	# GET /procedure/procedures_distance{params}
	# Params: [filters values array]
	# Return: Hash of {specialty => distance_average}
	def procedures_distance
		procedures = getProcedures()
		result = {}
		procedures.where("specialty_id < ?", 10).order(:specialty_id).group(:specialty_id)
				  .average(:distance).each_with_index do |p, i|
				 	result[Specialty.find_by(id: p[0]).name.to_s] = p[1].round(2).to_f
		end
		render json: result
	end

	# GET /procedure/procedures_total{params}
	# Params: [filters values array]
	# Return: Procedures counter
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
	# GET /procedure/download.csv
	# Params: [filters values array]
	# Return: CSV file.
	def download
		if session[:filters] == nil
			procedures = Procedure.all
		else
			procedures = getProcedures()
		end

		procedures = procedures.select('id as "COD"', 'replace(lat::text, \'.\', \',\') AS "LAT_SC"', 'replace(long::text, \'.\', \',\') as "LONG_SC"', 
			'gender as "P_SEXO"', 'age_number as "P_IDADE"', 'race as "P_RACA"', 'lv_instruction as "LV_INSTRU"', 'cnes_id as "CNES"', 
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

	# GET /procedure/health_centres_procedure{params}
	# Params: Cnes numbers
	# Return: An array of [health_centres]
	def health_centres_procedure
		cnes = params[:cnes].to_s
		cnes = cnes.split(",")
		health_centres = HealthCentre.where(cnes: cnes).pluck(:lat, :long)
		render json: health_centres
	end

	# GET /procedure/procedures_by_hc/{params}
	# Params: Cnes number
	# Return: An array of [procedures_per_health_centre]
	def procedures_by_hc
		procedures = Procedure.where(cnes_id: params[:cnes].to_s)
		render json: procedures.to_a
	end

	# GET /procedure/procedures_latlong/{params}
	# Params: [filters values array]
	# Return: An array of [procedures_latlong]
	def procedures_latlong
		procedures = getProcedures().pluck(:lat, :long, :id);
		render json: procedures
	end

	# GET /procedure/procedure_info/{params}
	# Params: id
	# Return: Info about the procedure with the given id 
	def procedure_info
		procedure = Procedure.where(id: params[:id]).select(:cnes_id, :gender, :age_number, :cid_primary, :CRS, :date, :distance, :lat, :long).to_a

		render json: procedure
	end

	# Handles clustering for large amount of data
	# GET /procedure/procedure_large_cluster/{params}
	# Params: [filters values array]
	# Return: An array of [lat, long, number_of_pacients]
	def procedure_large_cluster
		if params[:hasData] == nil
			procedures = Procedure.all
		else
			procedures = getProcedures()
		end

		procedures = procedures.group(:lat, :long).count.to_a.flatten.each_slice(3).to_a #Convert hash {[lat, long] => count} to array [lat, long, count]

		render json: procedures
	end

	# GET /procedure/procedure_setor/{params}
	# Params: [filters values array]
	# Return: An array of [ids]
	def procedure_setor
		if session[:hasData] == true
			procedures = getProcedures()
		else
			procedures = Procedure.all
		end

		procedures = procedures.where(:lat => params[:lat], :long => params[:long]).pluck(:id)
		render json: procedures
	end

	# GET /procedure/max_values/{params}
	# Params: [filters values array]
	# Return: An array of [max for the filters values]
	def max_values
		if params[:send_all] == "True"
			render json: [351,148,99,351,110786.71.ceil,52.4832033827607.ceil] #default value for faster load time
			return
		end

		procedure = getProcedures()
		max = []
		[:days, :days_uti, :days_ui, :days_total, :val_total, :distance].each do |filter|
			maximum  = procedure.maximum(filter)
			if maximum != nil
				max.append(maximum.ceil)
			else
				max.append(0)
			end
		end
		render json: max
	end

	# NO Route, intern method
	# Params: A hash of {value => counter}
	# Return: The median value for the hash table
	def quartiles_calc(groups)
		total = 0
		groups.each do |group| 
			total += group[1]  # To avoid calling .count on procedure, may be a little slower but uses less memory
		end
		quartiles = []
		m_value = (total + 1) / 2 # For odd values takes the floor one not the mean of the two in the middle
		q1_value = (total + 1) / 4 # For odd values takes the floor one not the mean of the two in the middle
		q3_value = (total + 1) * 3 / 4 # For odd values takes the floor one not the mean of the two in the middle
		# each loop will calculate the quartiles until the variables values are not zero
		groups.each do |group|
			if q1_value > 0
				q1_value = q1_value - group[1]
			end
			if q1_value <= 0
				quartiles.append(group[0])
				break
			end
		end
		groups.each do |group|
			if m_value > 0
				m_value = m_value - group[1]
			end
			if m_value <= 0
				quartiles.append(group[0])
				break
			end
		end		
		groups.each do |group|			
			if q3_value > 0
				q3_value = q3_value - group[1]
			end
			if q3_value <= 0
				quartiles.append(group[0])
				break
			end
		end
		return quartiles
	end

	# GET /procedure/procedure_quartiles
	# Params: [filter values array]
	# Return: An array of [q1, q2(median), q3 for the filter values]
	def procedure_quartiles
		params.require(:send_all)

		if params[:send_all] == "True"
			render json: [[2, 3.0, 6], [0, 0.0, 0], [0, 0.0, 0], [2, 3.0, 6], [0.0, 0.0, 0.0], [2.34493573228911, 4.96823522661767, 10.4606915236337]], status: 200 # default value for faster load time
			return
		end

		procedure = getProcedures()
		quartiles = []
		# 1 - days(Total Geral de Diárias)
		days = procedure.group(:days).order(:days).count
		quartiles.append(quartiles_calc(days))
		days = nil
		# 2 - days_uti(Diárias UTI)
		days_uti = procedure.group(:days_uti).order(:days_uti).count
		quartiles.append(quartiles_calc(days_uti))
		days_uti = nil
		# 3 - days_ui(Diárias UI)
		days_ui = procedure.group(:days_ui).order(:days_ui).count
		quartiles.append(quartiles_calc(days_ui))
		days_ui = nil
		# 4 - days_total(Dias de permanência)
		days_total = procedure.group(:days_total).order(:days_total).count
		quartiles.append(quartiles_calc(days_total))
		days_total = nil
		# 5 - val_total(Valor da Parcela)
		val_total = procedure.group(:val_total).order(:val_total).count
		quartiles.append(quartiles_calc(val_total))
		val_total = nil
		# 6 - distance(Distância de Deslocamento)
		distance = procedure.group(:distance).order(:distance).count
		quartiles.append(quartiles_calc(distance))
		distance = nil

		render json: quartiles
	end

	def quartiles(array)
		median = array.median
		q1 = array.value_from_percentile(25)
		q3 = array.value_from_percentile(75)
		return [q1, median, q3]
	end
end
