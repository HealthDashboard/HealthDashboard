class ProcedureController < ApplicationController
	before_action :getProcedures, only: [:proceduresDistanceGroup, :proceduresPerMonth,
		:proceduresPerHealthCentre, :proceduresPerSpecialties, :proceduresDistance, 
		:proceduresLatLong, :proceduresClusterPoints, :proceduresSetorCensitario, :download, :downloadCluster]

	def initialize
		# Cons, AVOID USING NUMBERS, make a constant instead
		@NUM_FILTERS = 17
		@MAX_SLIDERS = [351,148,99,351,110786.71.ceil, 84.5.ceil]

		@procedure = ["Estabelecimento de ocorrência", "Competência (aaaamm)", "Especialidade do leito", "Caráter do atendimento",
					  "Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Complexidade", "Tipo de financiamento"]
		@patient_info = ["Faixa etária", "Raça/Cor", "Nível de instrução"]
		@establishment = ["Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", "Gestão"]

		#'Hints' to display on each label
		@titles_procedure_filters = ["Estabelecimento do atendimento prestado.", "Ano/mês de processamento da AIH. Ex: 201506(junho de 2015).", "Especialidade do leito de internação.", "Caráter da internação.",
									 "Motivo da internação.", "Motivo que levou ao diagnóstico principal.", "Motivo que levou ao diagnóstico principal.", "Nível de atenção para realização do procedimento.", "Tipo de financiamento da internação."]

		@titles_patient_info_filters = ["Faixa etária do paciente.", "Raça/Cor do paciente.", "Grau de instrução do paciente."]

		@titles_establishment_filters = ["Distrito administrativo da internação.", "Subprefeitura do estabelecimento.", "Supervisão técnica de saúde.", "Coordenadoria regional de saúde.", "Secretaria responsável."]

		@sliders = ["Total geral de diárias", "Diárias UTI", "Diárias UI", "Dias de permanência", "Valor da parcela", "Distância de deslocamento(Km)"]

		# 'Hints' to display on each slider
		@titles_sliders = ["Total geral de dias de internação.", "Diárias de unidade de tratamento intensiva.", "Diárias de unidade intermediária.", "Total de dias de internação.", "Valor do serviço.", "Distância de deslocamento do paciente."]

		# Values for filters
		@health_centres = JSON.parse(File.read(Rails.root.join('public/health_centres.json')))
		@age_group = JSON.parse(File.read(Rails.root.join('public/age_group.json')))
		@specialties = JSON.parse(File.read(Rails.root.join('public/specialties.json')))
		@treatments = [
			{ "id" => "1", "text" => "Eletivo" },
			{ "id" => "2", "text" => "Urgencia" },
			{ "id" => "3", "text" => "Acidente No Local De Trabalho Ou A Servico Da Empresa" },
			{ "id" => "5", "text" => "Outros Tipos De Acidente De Transito" },
			{ "id" => "6", "text" => "Outros Tipos De Lesoes E Envenenamentos Por Agentes Quimicos Ou Fisicos" },
		];
		@race = JSON.parse(File.read(Rails.root.join('public/race.json')))
		@lv_instruction = JSON.parse(File.read(Rails.root.join('public/lv_instruction.json')))
		@cmpt = JSON.parse(File.read(Rails.root.join('public/cmpt.json')))
		# @proce_re = JSON.parse(File.read(Rails.root.join('public/proc_re.json')))
		@cid = JSON.parse(File.read(Rails.root.join('public/CID10.json')))
		@finance = JSON.parse(File.read(Rails.root.join('public/finance.json')))
		@da = JSON.parse(File.read(Rails.root.join('public/DA.json')))
		@pr = JSON.parse(File.read(Rails.root.join('public/PR.json')))
		@sts = JSON.parse(File.read(Rails.root.join('public/STS.json')))
		@crs = JSON.parse(File.read(Rails.root.join('public/CRS.json')))
		@complexity = JSON.parse(File.read(Rails.root.join('public/complexity.json')))
		@gestor = [{"id" => "00", "text" => "ESTADUAL"},
				  {"id" => "01", "text" => "MUNICIPAL"}];

		@options_procedure = [@health_centres, @cmpt, @specialties, @treatments, @cid, @cid, @cid, @complexity, @finance]
		@options_patient_info = [@age_group, @race, @lv_instruction]
		@options_establishment = [@da, @pr, @sts, @crs, @gestor]

		@filters_name = ["cnes_id", "cmpt", "specialty_id", "treatment_type", "cid_primary", "cid_secondary", "cid_secondary2",
			"complexity", "finance", "age_code", "race", "lv_instruction", "DA", "PR", "STS", "CRS", "gestor_ide"]

		@sliders_name = ["days", "days_uti", "days_ui", "days_total", "val_total", "distance"]
		
		completeness = JSON.parse(File.read(Rails.root.join('public/completeness.json')))
		@filters_completeness = completeness['filters']
		@sliders_completeness = completeness['sliders']

		super
	end

	# GET /procedure/proceduresDistanceGroup{params}
	# Params: [filters values array]
	# Return: Hash of {interval => count_of_procedures}
	def proceduresDistanceGroup
		render json: "Bad request", status: 400 and return unless @procedures != nil

		result = {
			"<= 1 Km" => @procedures.where("distance <= ?", 1).count,
			"> 1 Km e <= 5 Km" =>  @procedures.where("distance > ? AND distance <= ?", 1, 5).count,
			"> 5 Km e <= 10 Km" => @procedures.where("distance > ? AND distance <= ?", 5, 10).count,
			"> 10 Km" => @procedures.where("distance > ?", 10).count
		}
		render json: result, status: 200
	end

	# GET /procedure/proceduresPerMonth{params}
	# Params: [filters values array]
	# Return: An array of [proceduresPerMonth]
	def proceduresPerMonth
		render json: "Bad request", status: 400 and return unless @procedures != nil

		result = []
		@procedures.where("date >= ? AND date <= ?", "2015-01-01", "2015-12-31")
		.group_by_month(:date).count.each.with_index do |date, _index|
			result.append([date[0], date[1]])
		end
		render json: result, status: 200
	end

	# GET /procedure/proceduresPerHealthCentre{params}
	# Params: [filters values array]
	# Return: Hash of {health_centre => total_of_procedures}
	def proceduresPerHealthCentre
		render json: "Bad request", status: 400 and return unless @procedures != nil

		result = {}
		@procedures.group(:cnes_id).order("count_id DESC").limit(10)
				  .count(:id).each.with_index do |p, i|
				result[HealthCentre.find_by(cnes: p[0]).name.to_s] = p[1].to_i
		end
		render json: result, status: 200
	end

	# GET /procedure/proceduresPerSpecialties{params}
	# Params: [filters values array]
	# Return: Hash of {specialty => total_of_procedures}
	def proceduresPerSpecialties
		render json: "Bad request", status: 400 and return unless @procedures != nil

		perSpecialties = @procedures.where("specialty_id < ?", 10).order(:specialty_id).group(:specialty_id).count
		result = {}
		perSpecialties.each do |specialty|
			result[Specialty.find_by(id: specialty[0]).name] = specialty[1].to_i
		end
		render json: result, status: 200
	end

	# GET /procedure/proceduresDistance{params}
	# Params: [filters values array]
	# Return: Hash of {specialty => distance_average}
	def proceduresDistance
		render json: "Bad request", status: 400 and return unless @procedures != nil

		result = {}
		@procedures.where("specialty_id < ?", 10).order(:specialty_id).group(:specialty_id)
				  .average(:distance).each.with_index do |p, i|
				 	result[Specialty.find_by(id: p[0]).name.to_s] = p[1].round(2).to_f
		end
		render json: result, status: 200
	end

	# GET /procedure/proceduresTotal
	# Params: none
	# Return: Procedures counter
	def proceduresTotal
		render json: Procedure.count, status: 200
	end

	# GET /procedure/proceduresInfo/{params}
	# Params: id
	# Return: Info about the procedure with the given id
	def proceduresInfo
		info = Procedure.where(id: params[:id]).select(:cnes_id, :gender, :age_number, :cid_primary, :CRS, :date, :distance, :lat, :long).to_a

		render json: info, status:  200
	end

	# Handles clustering for large amount of data
	# GET /procedure/proceduresClusterPoints/{params}
	# Params: [filters values array]render json: "Bad request", status: 400 and return unless @procedures != nil
	# Return: An array of [lat, long, number_of_pacients]
	def proceduresClusterPoints
		render json: "Bad request", status: 400 and return unless @procedures != nil

		clusters = @procedures.group(:lat, :long).count.to_a.flatten.each_slice(3) #Convert hash {[lat, long] => count} to array [lat, long,count]"

		render json: clusters, status: 200
	end



	# GET /procedure/proceduresSetorCensitario/{params}
	# Params: [filters values array]
	# Return: An array of [ids]
	def proceduresSetorCensitario
		render json: "Bad request", status: 400 and return unless @procedures != nil

		setor_cen = @procedures.where(:lat => params[:lat], :long => params[:long]).pluck(:id)
		render json: setor_cen, status: 200
	end

	# GET /procedure/proceduresMaxValues/{params}
	# Params: [filters values array]
	# Return: An array of [max for the filters values]
	def proceduresMaxValues
		parsed_json = JSON.parse params[:data]

		getProcedures()
		render json: "Bad request", status: 400 and return unless @procedures != nil

		max = []
		[:days, :days_uti, :days_ui, :days_total, :val_total, :distance].each do |filter|
			maximum = Rails.cache.fetch("max/#{filter}#{parsed_json}", expires_in: 12.hours) do
				@procedures.maximum(filter)
			end
			if maximum != nil
				max.append(maximum.ceil)
			else
				max.append(0)
			end
		end
		render json: max, status: 200
	end

	# GET /procedure/proceduresQuartiles
	# Params: [filter values array]
	# Return: An array of [q1, q2(median), q3 for the filter values]
	def proceduresQuartiles
		parsed_json = JSON.parse params[:data]

		getProcedures()
		render json: "Bad request", status: 400 and return unless @procedures != nil

		quartiles = []
		# 1 - days(Total Geral de Diárias)
		days = Rails.cache.fetch("quartiles/days#{parsed_json}", expires_in: 12.hours) do
			@procedures.group(:days).order(:days).count
		end
		# puts(days)
		quartiles.append(quartiles_calc(days))

		# 2 - days_uti(Diárias UTI)
		days_uti = Rails.cache.fetch("quartiles/diarias_uti#{parsed_json}", expires_in: 12.hours) do
			@procedures.group(:days_uti).order(:days_uti).count
		end
		quartiles.append(quartiles_calc(days_uti))

		# 3 - days_ui(Diárias UI)
		days_ui = Rails.cache.fetch("quartiles/diasrias_ui#{parsed_json}", expires_in: 12.hours) do
			@procedures.group(:days_ui).order(:days_ui).count
		end
		quartiles.append(quartiles_calc(days_ui))

		# 4 - days_total(Dias de permanência)
		days_total = Rails.cache.fetch("quartiles/days_total#{parsed_json}", expires_in: 12.hours) do 
			@procedures.group(:days_total).order(:days_total).count
		end
		quartiles.append(quartiles_calc(days_total))

		# 5 - val_total(Valor da Parcela)
		val_total = Rails.cache.fetch("quartiles/val_total#{parsed_json}", expires_in: 12.hours) do
			@procedures.group(:val_total).order(:val_total).count
		end
		quartiles.append(quartiles_calc(val_total))

		# 6 - distance(Distância de Deslocamento)
		distance = Rails.cache.fetch("quartiles/distance#{parsed_json}", expires_in: 12.hours) do
			@procedures.group(:distance).order(:distance).count
		end
		quartiles.append(quartiles_calc(distance))

		render json: quartiles, status: 200
	end

	# Download csv file
	# GET /procedure/download.csv
	# Params: [filters values array]
	# Return: CSV file.
	def download
	    if params[:ClusterDownload] == "True"
	    	downloadCluster()
	    end

	    render json: "Bad request", status: 400 and return unless @procedures != nil

		@downloadable = @procedures.select('id as "COD"', 'replace(lat::text, \'.\', \',\') AS "LAT_SC"', 'replace(long::text, \'.\', \',\') as "LONG_SC"',
			'gender as "P_SEXO"', 'age_number as "P_IDADE"', 'race as "P_RACA"', 'lv_instruction as "LV_INSTRU"', 'cnes_id as "CNES"',
			'gestor_ide as "GESTOR_ID"', 'treatment_type as "CAR_INTEN"', 'cmpt as "CMPT"', 'date as "DT_EMISSAO"',
			'date_in as "DT_INTERNA"', 'date_out as "DT_SAIDA"', 'complexity as "COMPLEXIDA"', 'proce_re as "PROC_RE"',
			'cid_primary as "DIAG_PR"', 'cid_secondary as "DIAG_SE1"', 'cid_secondary2 as "DIAG_SE2"',
			'days as "DIARIAS"', 'days_uti as "DIARIAS_UT"', 'days_ui as "DIARIAS_UI"',
			'days_total as "DIAS_PERM"', 'finance as "FINANC"', 'replace(val_total::text, \'.\', \',\') as "VAL_TOT"', '"DA" as "DA"', '"PR" as "SUB"',
			'"STS" as "STS"', '"CRS" as "CRS"', 'replace(distance::text, \'.\', \',\') as "DISTANCIA_KM"')

		@enumerator = @downloadable.copy_to_enumerator(:buffer_lines => 100, :delimiter => ";")
		# Tell Rack to stream the content
		headers.delete("Content-Length")

		# Don't cache anything from this generated endpoint
		headers["Cache-Control"] = "no-cache"

		# Tell the browser this is a CSV file
		headers["Content-Type"] = "text/csv"

		# Make the file download with a specific filename
		headers["Content-Disposition"] = "inline;"

		# Don't buffer when going through proxy servers
		headers["X-Accel-Buffering"] = "no"

		# Set an Enumerator as the body
		self.response_body = @enumerator

		# Set the status to success
		response.status = 200
	end

	# GET /procedure/healthCentresCnes{params}
	# Params: Cnes numbers
	# Return: An array of [health_centres]
	def healthCentresCnes
		cnes = params[:cnes].to_s
		cnes = cnes.split(",")
		health_centres = HealthCentre.where(cnes: cnes).pluck(:lat, :long)
		render json: health_centres, status: 200
	end

private
	# Used when downloading a specific cluster
	def downloadCluster
		latSet = Array.new()
		longSet = Array.new()
		parsed_json = params


		if @procedures == nil || parsed_json["lat"] == nil || parsed_json["long"] == nil
			@procedures = nil
			return
		end
		
		parsed_json["lat"].each do |_index, value|
			latSet.push(value.to_f)
		end
		
		parsed_json["long"].each do |_index, value|
			longSet.push(value.to_f)
		end

		@procedures = @procedures.where(:lat => latSet, :long => longSet)
	end

	# Params: [filters values array]
	def getProcedures
		params.require(:data)
		parsed_json = JSON.parse params[:data]
		@procedures = Procedure.where(nil)

		if parsed_json["send_all"] == "True"
			@procedures = Procedure.all
			return
		end

		if parsed_json["genders"] != nil && parsed_json["genders"] != []
			@procedures = Procedure.where(gender: parsed_json["genders"])
		end

		@filters_name.each.with_index do |filter, i|
			if parsed_json["filters"] != nil && !(parsed_json["filters"][i].to_a.empty?)
				@procedures = @procedures.where(filter => parsed_json["filters"][i])
			end
		end

		if parsed_json["sliders"] != nil
			@sliders_name.each.with_index do |slider, i|
				if parsed_json["sliders"] != nil && parsed_json["sliders"][i] != nil
					min =  parsed_json["sliders"][i][0]
					max = parsed_json["sliders"][i][1]
				else
					next
				end

				if max == @MAX_SLIDERS[i]
					@procedures = @procedures.where(slider + ' >= ?', min) unless min == 0
				else
					@procedures = @procedures.where(slider + ' >= ? AND ' + slider + ' <= ?', min, max)
				end
			end
		end

		if !(parsed_json["start_date"].to_s.empty?) || !(parsed_json["end_date"].to_s.empty?)
			start_date = Date.parse parsed_json["start_date"]
			end_date = Date.parse parsed_json["end_date"]
			@procedures = @procedures.where('date BETWEEN ? AND ?', start_date, end_date)
		end

		@procedures = nil unless @procedures != Procedure.where(nil)
	end

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

end
