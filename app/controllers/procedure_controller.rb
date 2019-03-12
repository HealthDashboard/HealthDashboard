class ProcedureController < ApplicationController
	before_action :getProcedures, only: [:proceduresDistanceGroup, :proceduresPerMonth,
		:proceduresPerHealthCentre, :proceduresPerSpecialties, :proceduresDistance,
		:proceduresLatLong, :proceduresClusterPoints, :proceduresSetorCensitario, :download, :downloadCluster, :proceduresVariables, 
		:proceduresCompleteness, :proceduresPop, :proceduresCid10Specific]

	def initialize
		# Cons, AVOID USING NUMBERS, make a constant instead
		@NUM_FILTERS = 18
		@MAX_SLIDERS = [351,148,99,351,110786.71.ceil, 84.5.ceil]

		@establishment = ["Estabelecimento de ocorrência", "Gestão", "Especialidade do leito"]
		@procedure = ["Competência (aaaamm)", "Caráter do atendimento", "Diagnóstico principal (CID-10)", 
			"Diagnóstico principal específico (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Complexidade", "Tipo de financiamento"]
		@patient_info = ["Faixa etária", "Raça/Cor", "Nível de instrução", "Distrito Administrativo", "Subprefeitura",
			"Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde"]
		#'Hints' to display on each label

		@titles_establishment_filters = ["Estabelecimento do atendimento prestado.", "Secretaria responsável.", "Especialidade do leito de internação."]

		@titles_procedure_filters = ["Ano/mês de processamento da AIH. Ex: 201506(junho de 2015).", "Caráter da internação.",
									 "Motivo da internação.", "Motivo que levou ao diagnóstico principal (específico).", "Motivo que levou ao diagnóstico principal.", "Motivo que levou ao diagnóstico principal.", "Nível de atenção para realização do procedimento.",
									 "Tipo de financiamento da internação."]

		@titles_patient_info_filters = ["Faixa etária do paciente.", "Raça/Cor do paciente.", "Grau de instrução do paciente.", "Distrito administrativo da residência do paciente.", "Subprefeitura da residência do paciente.", "Supervisão Técnica de Saúde da residência do paciente.", "Coordenadoria Regional de Saúde da residência do paciente."]

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

		@options_establishment = [@health_centres, @gestor, @specialties]
		@options_procedure = [@cmpt, @treatments, @cid, [], @cid, @cid, @complexity, @finance]
		@options_patient_info = [@age_group, @race, @lv_instruction, @da, @pr, @sts, @crs]

		@filters_name = ["cnes_id", "gestor_ide", "specialty_id", "cmpt", "treatment_type", "cid_primary", "cid_primary", "cid_secondary", "cid_secondary2",
			"complexity", "finance", "age_code", "race", "lv_instruction", "DA", "PR", "STS", "CRS"]

		@sliders_name = ["days", "days_uti", "days_ui", "days_total", "val_total", "distance"]
		super
	end

	#AQUI
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
		@procedures.group_by_month(:date).count.each.with_index do |date, _index|
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

		perSpecialties = @procedures.order(:specialty_id).group(:specialty_id).count
		result = {}
		perSpecialties.each do |specialty|
			result[Specialty.find_by(id: specialty[0]).name] = specialty[1].to_i
		end
		render json: result, status: 200
	end

	#AQUI
	# GET /procedure/proceduresDistance{params}
	# Params: [filters values array]
	# Return: Hash of {specialty => distance_average}
	def proceduresDistance
		render json: "Bad request", status: 400 and return unless @procedures != nil

		result = {}
		@procedures.order(:specialty_id).group(:specialty_id)
				  .average(:distance).each.with_index do |p, i|
				 	result[Specialty.find_by(id: p[0]).name.to_s] = p[1].round(2).to_f
		end
		render json: result, status: 200
	end

	# GET /procedure/proceduresTotal
	# Params: none
	# Return: Procedures counter
	def proceduresTotal
		total = Rails.cache.fetch("proceduresTotal", expires_in: 24.hours) do
			Procedure.count
		end
		render json: total, status: 200
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
	# Params: [filters values array]
	# Return: An array of [lat, long, number_of_pacients]
	def proceduresClusterPoints
		render json: "Bad request", status: 400 and return unless @procedures != nil

		clusters = @procedures.group(:lat, :long, :cd_geocodi).count.to_a.flatten.each_slice(4) #Convert hash {[lat, long, cd_geocodi] => count} to array [lat, long, cd_geocodi, count]"

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

	# GET /procedure/proceduresCompleteness
	# Params: [filters values array]
	# Return: A hash with infos about each filter completeness
	def proceduresCompleteness
		render json: "Bad request", status: 400 and return unless @procedures != nil
    	filters_completeness = {}
		sliders_completeness = {}

    # Values for completeness at each filter
   	@filters_name.each.with_index do |name, i|
      	if name == "race"
			freq = @procedures.where(name.to_sym => [nil, '99']).count.to_f
      	elsif name != "gestor_ide" and name != "lv_instruction"
			freq = @procedures.where(name.to_sym => [nil, '0']).count.to_f
      	else
			freq = @procedures.where(name.to_sym => nil).count.to_f
      	end
      	filters_completeness[name] = ((1 - (freq / @procedures.all.count)) * 100).round(2)
    end

		# Values for completeness at each slider
		@sliders_name.each.with_index do |name, i|
			freq = @procedures.where(name.to_sym => [nil, '0']).count.to_f
			sliders_completeness[name] = ((1 - (freq / @procedures.all.count)) * 100).round(2)
		end

		completeness = {
			:filters => filters_completeness,
			:sliders => sliders_completeness
		}

    	render json: completeness, status: 200
	end

	# GET /procedure/proceduresVariables{params}
	# Params: [filter values array]
	# Return: A hash with infos about each variable
	def proceduresVariables
	    render json: "Bad request", status: 400 and return unless @procedures != nil

		result = Hash.new
		variables = [:cnes_id, :cmpt, :proce_re, :specialty_id, :treatment_type, :cid_primary, :cid_secondary,
			:cid_secondary2, :complexity, :finance, :age_code, :race, :lv_instruction,
			:gender, :DA, :PR, :STS, :CRS, :gestor_ide, :days, :days_uti, :days_ui, :days_total, :val_total, :distance];
		data = []
		variables.each do |var|
			data = []
			@procedures.group(var).count.each.with_index do |key, _index|
				data.append([key[0], key[1]])
			end
			result[var.to_s] = data
		end

		# Replace the values of STS 
		health_centres = @sts.map{|x| x["id"]}
		result["STS"].each.with_index do |key, index|
			unless key[0].nil?
				indexAux = health_centres.find_index(key[0].to_s)
				result["STS"][index][0] = @sts[indexAux]["text"]
			end
		end

		result["STS"] = (result["STS"].sort_by {|name, id| name }).reverse()

		# Replace the values of DA
		health_centres = @da.map{|x| x["id"]}
		result["DA"].each.with_index do |key, index|
			unless key[0].nil?
				indexAux = health_centres.find_index(key[0].to_s)
				result["DA"][index][0] = @da[indexAux]["text"]
			end
		end

		result["DA"] = result["DA"].select(&:first).sort + result["DA"].reject(&:first).reverse()
		
		# Replace the values of PR
		health_centres = @pr.map{|x| x["id"]}
		result["PR"].each.with_index do |key, index|
			unless key[0].nil?
				indexAux = health_centres.find_index(key[0].to_s)
				result["PR"][index][0] = @pr[indexAux]["text"]
			end
		end

		result["PR"] = result["PR"].select(&:first).sort + result["PR"].reject(&:first).reverse()

		# Replace the values of CRS
		health_centres = @crs.map{|x| x["id"]}
		result["CRS"].each.with_index do |key, index|
			unless key[0].nil?
				indexAux = health_centres.find_index(key[0].to_s)
				result["CRS"][index][0] = @crs[indexAux]["text"]
			end
		end

		result["CRS"] = (result["CRS"].sort_by {|name, id| name }).reverse()

		# Replace the values - HEALTH_CENTRES
		health_centres = @health_centres.map{|x| x["id"]}
		result["cnes_id"].each.with_index do |key, index|
			unless key[0].nil?
				indexAux = health_centres.find_index(key[0].to_s)
				result["cnes_id"][index][0] = @health_centres[indexAux]["text"]
			end
		end

		result["cnes_id"] = (result["cnes_id"].sort_by {|name, id| name }).reverse()
		
		# Replace the values - CMPT
		cmpt = @cmpt.map{|x| x["id"]}
		result["cmpt"].each.with_index do |key, index|
			unless key[0].nil?
				indexAux = cmpt.find_index(key[0].to_s)
				result["cmpt"][index][0] = @cmpt[indexAux]["text"]
			end
		end

		result["cmpt"] = result["cmpt"].select(&:first).sort + result["cmpt"].reject(&:first).reverse()
		
		# Replace the values - TREATMENT_TYPE
		treatment_type = @treatments.map{|x| x["id"]}
		result["treatment_type"].each.with_index do |key, index|
			unless key[0].nil?
				indexAux = treatment_type.find_index(key[0].to_s)
				result["treatment_type"][index][0] = @treatments[indexAux]["text"]
			end
		end

		# Replace the values - COMPLEXITY
		complexity = @complexity.map{|x| x["id"].to_s}
		result["complexity"].each.with_index do |key, index|
			unless key[0].nil?
				key[0] = "0"+key[0].to_s
				indexAux = complexity.find_index(key[0].to_s)
				result["complexity"][index][0] = @complexity[indexAux]["text"]
			end
		end

		# Replace the values - FINANCE
		finance = @finance.map{|x| x["id"].to_s}
		result["finance"].each.with_index do |key, index|
			unless key[0].nil?
				key[0] = "0"+key[0].to_s
				indexAux = finance.find_index(key[0].to_s)
				result["finance"][index][0] = @finance[indexAux]["text"]
			end
		end

		# Replace the values - AGE_CODE
		age_code = @age_group.map{|x| x["id"].to_s}
		result["age_code"].each.with_index do |key, index|
			unless key[0].nil?
				indexAux = age_code.find_index(key[0].to_s)
				result["age_code"][index][0] = @age_group[indexAux]["text"]
			end
		end
		result["age_code"] = result["age_code"].sort_by {|k, v| (k && k[0..2].to_i) || 0}

		# Replace the values - RACE		
		race = @race.map{|x| x["id"].to_s}
		result["race"].each.with_index do |key, index|
			unless key[0].nil?
				if (key[0].to_s).length < 2
					key[0] = "0"+key[0].to_s
				end
				indexAux = race.find_index(key[0].to_s)
				result["race"][index][0] = @race[indexAux]["text"]
			end
		end

		# Replace the values - LV_INSTRUCTION
		lv_instruction = @lv_instruction.map{|x| x["id"].to_s}
		result["lv_instruction"].each.with_index do |key, index|
			unless key[0].nil?
				indexAux = lv_instruction.find_index(key[0].to_s)
				result["lv_instruction"][index][0] = @lv_instruction[indexAux]["text"]
			end
		end

		# Replace the values - GESTOR
		gestor = @gestor.map{|x| x["id"].to_s}
		result["gestor_ide"].each.with_index do |key, index|
			unless key[0].nil?
				key[0] = "0"+key[0].to_s
				indexAux = gestor.find_index(key[0].to_s)
				result["gestor_ide"][index][0] = @gestor[indexAux]["text"]
			end
		end

		# Replace the values - SPECIALTIES
		specialties = @specialties.map{|x| x["id"].to_s}
		result["specialty_id"].each.with_index do |key, index|
			unless key[0].nil?
				key[0] = key[0].to_s
				unless specialties.find_index(key[0].to_s).nil?
					indexAux = specialties.find_index(key[0].to_s)
					result["specialty_id"][index][0] = @specialties[indexAux]["text"]
				end
			end
		end

		# Replace the values - DISTANCE
		result["distance"].each.with_index do |key, index|
			unless key[0].nil?
				key[0] = '%.2f' % key[0].to_f
				result["distance"][index][0] = (key[0].to_s)
			end
		end		
		result["distance"] = result["distance"].sort_by {|x, y| x.to_f }
		

		# Replace the values - VAL_TOTAL
		result["val_total"].each.with_index do |key, index|
			unless key[0].nil?
				key[0] = '%.2f' % key[0].to_f
				result["val_total"][index][0] = (key[0].to_s).gsub('.', ',')
			end
		end
		result["val_total"] = result["val_total"].sort_by {|x, y| x.to_f }


		result["val_total"] = result["val_total"].sort_by {|x, y| x.to_f }

		# Replace the values - CID_PRIMARY
		#"cid_primary", "cid_secondary", "cid_secondary2"
		cid_primary = @cid.map{|x| x["id"].to_s}
		result["cid_primary"].each.with_index do |key, index|
			unless key[0].nil?
				key[0] = key[0].to_s
				unless cid_primary.find_index(key[0].to_s).nil?
					indexAux = cid_primary.find_index(key[0].to_s)
					result["cid_primary"][index][0] = @cid[indexAux]["text"]
				end
			end
		end

		cid_secondary = @cid.map{|x| x["id"].to_s}
		result["cid_secondary"].each.with_index do |key, index|
			unless key[0].nil?
				key[0] = key[0].to_s
				unless cid_secondary.find_index(key[0].to_s).nil?
					indexAux = cid_secondary.find_index(key[0].to_s)
					result["cid_secondary"][index][0] = @cid[indexAux]["text"]
				end
			end
		end

		cid_secondary2 = @cid.map{|x| x["id"].to_s}
		result["cid_secondary2"].each.with_index do |key, index|
			unless key[0].nil?
				key[0] = key[0].to_s
				unless cid_secondary2.find_index(key[0].to_s).nil?
					indexAux = cid_secondary2.find_index(key[0].to_s)
					result["cid_secondary2"][index][0] = @cid[indexAux]["text"]
				end
			end
		end

		render json: result, status: 200
	end

	# GET /procedure/proceduresPop{params}
	# Params: [filter values array]
	# Return: A hash with pop counters by gender and race
	def proceduresPop
		render json: "Bad request", status: 400 and return unless @procedures != nil
		pop_info = Hash.new()
		result_gender = @procedures.group(:cd_geocodi).group(:gender).count
		result_race = @procedures.group(:cd_geocodi).group(:race).count
		pop_info[:gender] = result_gender
		pop_info[:race] = result_race
		render json: pop_info, status: 200
	end

	# GET /procedure/proceduresCid10Specific{params}
	# Params: [array containing the cid10 options selected in advanced search and filter values array]
	# Return: A hash containing the specific options of cid10
	def proceduresCid10Specific
		parsed_json = JSON.parse params[:data]
		render json: "Bad request", status: 400 and return unless @procedures != nil
		cid10_selected = parsed_json["filters"][5]
		cid10_options = Hash.new
		cid10_selected.each do |option|
			result = @procedures.where("cid_primary LIKE ?", "#{option}%").group(:cid_primary).count
			if result.empty? == false
				cid10_options[option] = result
			end
		end
		render json: cid10_options, status: 200
	end

	# GET /procedure/getSectorByCd_geocodi
	# Params: [cd_geocodi value]
	# Return: A hash containing the coordinates
	def getSectorByCd_geocodi
		render json: "Bad request", status: 400 and return unless params[:data] != nil
		sector = Sector.select(:coordinates).where(:cd_geocodi => params[:data])
		render json: sector, status: 200
	end

private
	# Used when downloading a specific cluster
	def downloadCluster
		latSet = Array.new()
		longSet = Array.new()
		parsed_json = params

		if @procedures == nil || parsed_json["latlong"] == nil
			@procedures = nil
			return
		end

		parsed_json["latlong"].each.with_index do |value, index|
			if index%2 == 0
				latSet.push(value.to_f)
			else
				longSet.push(value.to_f)
			end
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
				# Special case for cid filters, because some of the datas have 4 characters and some of them just 3 characters
				if i == 5 || i == 7 || i == 8
					tmp = parsed_json["filters"][i]
					tmp.map! {|word| "#{word}%"}
					@procedures = @procedures.where(filter + " LIKE ANY ( array[?] )", tmp)
				else
					@procedures = @procedures.where(filter => parsed_json["filters"][i])
				end
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
