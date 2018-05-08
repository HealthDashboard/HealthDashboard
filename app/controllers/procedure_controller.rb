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
			"Grupo do procedimento autorizado", "Diagnóstico principal (CDI-10)", "Diagnóstico secundário (CDI-10)", "Diagnóstico secundário 2 (CDI-10)", "Diagnóstico secundário 3 (CDI-10)", "Total geral de diárias", 
			"Diárias UTI", "Diárias UI", "Dias de permanência", "Tipo de financiamento", "Valor Total", "Distrito Administrativo", "Subprefeitura", "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", "Complexidade", "Gestão"]
	end

	def getProcedures
		filters_name = ["cnes_id", "age_code", "specialty_id", "treatment_type", "race", "lv_instruction", "cmpt", "proce_re", "cid_primary", "cid_secondary", "cid_secondary2", 
		"cid_associated", "days", "days_uti", "days_ui", "days_total", "finance", "val_total", "DA", "PR", "STS", "CRS", "complexity", "gestor_ide"]

		filters = Array.new(24)
		genders = nil
		start_date = nil
		end_date = nil
		dist_min = params[:dist_min].to_f
		dist_max = params[:dist_max].to_f

		genders = params[:gender].to_s
		genders = genders.split(",")

		params[:filters].each_with_index do |filter, i|
			if filter != ""
				filters[i] = filter.split(",")
			end
		end

		if params[:start_date].to_s != ""
			start_date = params[:start_date]
			start_date = Date.parse start_date
		end

		if params[:end_date].to_s != ""
			end_date = params[:end_date]
			end_date = Date.parse end_date
		end

		procedures = Procedure.where(gender: genders)

		filters_name.each_with_index do |n, i|
			if filters[i] != nil
				procedures = procedures.where(n => filters[i])
			end
		end

		if start_date != nil && end_date != nil
			procedures = procedures.where('date BETWEEN ? AND ?', start_date, end_date)
		end

		if (dist_max == 30)
			procedures = procedures.where('distance >= ?', dist_min)
		else
			procedures = procedures.where('distance >= ? AND distance <= ?', dist_min, dist_max)
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

		oeste = procedures.where(CRS: "OESTE").pluck(:long, :lat);
		norte = procedures.where(CRS: "NORTE").pluck(:long, :lat);
		sul = procedures.where(CRS: "SUL").pluck(:long, :lat);
		leste = procedures.where(CRS: "LESTE").pluck(:long, :lat);
		centro = procedures.where(CRS: "CENTRO").pluck(:long, :lat);
		sudeste = procedures.where(CRS: "SUDESTE").pluck(:long, :lat);

  		k = 4
  		oeste1 = [{"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}]
  		norte1 = [{"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}]
  		sul1 = [{"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}]
  		leste1 = [{"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}]
  		centro1 = [{"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}]
  		sudeste1 = [{"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}, {"centroid" => "[0, 0]", "number":"0"}]

  		if oeste.count > 0
  			kmeans_oeste = KMeansClusterer.run k, oeste, runs: 1, max_iter: 1
  			kmeans_oeste.clusters.each_with_index do |cluster, index|
  				oeste1[index] = {"centroid" => cluster.centroid.to_s, "number" => cluster.points.count.to_s}
  		 	end
  		end

  		if norte.count > 0
  			kmeans_norte = KMeansClusterer.run k, norte, runs: 1, max_iter: 1
  			kmeans_norte.clusters.each_with_index do |cluster, index|
  				norte1[index] = {"centroid" => cluster.centroid.to_s, "number" => cluster.points.count.to_s}
  			end
  		end
  		if sul.count > 0
  			kmeans_sul = KMeansClusterer.run k, sul, runs: 1, max_iter: 1
  			kmeans_sul.clusters.each_with_index do |cluster, index|
  				sul1[index] = {"centroid" => cluster.centroid.to_s, "number" => cluster.points.count.to_s}
  			end
  		end

  		if leste.count > 0
	   		kmeans_leste = KMeansClusterer.run k, leste, runs: 1, max_iter: 1
  			kmeans_leste.clusters.each_with_index do |cluster, index|
  				leste1[index] = {"centroid" => cluster.centroid.to_s, "number" => cluster.points.count.to_s}
  			end
  		end

  		if centro.count > 0
  			kmeans_centro = KMeansClusterer.run 2, centro, runs: 1, max_iter: 1
  			kmeans_centro.clusters.each_with_index do |cluster, index|
  				centro1[index] = {"centroid" => cluster.centroid.to_s, "number" => cluster.points.count.to_s}
  			end
  		end

  		if sudeste.count > 0
  			kmeans_sudeste = KMeansClusterer.run k, sudeste, runs: 1, max_iter: 1
  			kmeans_sudeste.clusters.each_with_index do |cluster, index|
  				sudeste1[index] = {"centroid" => cluster.centroid.to_s, "number" => cluster.points.count.to_s}
  			end
  		end
		js = [{"oeste" => oeste1,"norte" => norte1,"leste" => leste1,"sul" => sul1,"sudeste" => sudeste1,"centro" => centro1}]
		render json: js
	end
end
