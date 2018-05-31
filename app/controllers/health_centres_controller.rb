class HealthCentresController < ApplicationController
    @@region_id_array = ["dummy", "PIRITUBA / JARAGUA", "FREGUESIA / BRASILANDIA", "JABAQUARA", "VILA PRUDENTE", "SANTO AMARO", "ARICANDUVA / FORMOSA / CARRAO", "CAMPO LIMPO", "MBOI MIRIM", "VILA MARIANA", "CASA VERDE / CACHOEIRINHA", 
"SAO MIGUEL", "SAO MATEUS", "ITAQUERA", "PINHEIROS", "PENHA", "CIDADE TIRADENTES", "LAPA", "SAPOPEMBA", "GUAIANASES", "CAPELA DO SOCORRO", "SE", "BUTANTA", "ERMELINO MATARAZZO", "ITAIM PAULISTA", 
"IPIRANGA", "VILA MARIA / VILA GUILHERME", "SANTANA / TUCURUVI", "JACANA / TREMEMBE", "MOOCA"]

    # GET /
    def index
        health_centres = HealthCentre.all
    end

    # GET /points
    def points
        health_centres_points = HealthCentre.all
        render json: health_centres_points
    end

    # GET /procedures/:id
    def procedures
        health_centre = HealthCentre.find_by(id: params[:id])
        render json: health_centre.procedures.pluck(:lat, :long);
    end

    # GET /specialties/:id
    def specialties
        health_centre = HealthCentre.find_by(id: params[:id])
        procedures = health_centre.procedures.group(:specialty).count
        result = {}

        procedures.each do |key, value|
            result[key.name] = value
        end
        render json: result
    end

    # GET /specialties_count
    def specialties_count
        result = {}

        procedures = Procedure.where("specialty_id < ?", 10).order(:specialty_id).group(:specialty).count
        procedures.each do |key, value|
            result[key.name] = value
        end

        render json: result
    end

    # GET /specialties_procedure_distance_average
    def specialties_procedure_distance_average
        result = {}

        procedures = Procedure.where("specialty_id < ?", 10).order(:specialty_id).group(:specialty).average(:distance)
        procedures.each do |key, value|
            result[key.name] = value.round(2)
        end

        render json: result
    end

    # GET /distance_quartis/:id
    def distance_quartis
        health_centre = HealthCentre.find_by(id: params[:id])
        procedures = health_centre.procedures.pluck(:distance);
        distances = DescriptiveStatistics::Stats.new(procedures)
        q1 = distances.value_from_percentile(25).round(2).to_s
        q2 = distances.value_from_percentile(50).round(2).to_s
        q3 = distances.value_from_percentile(75).round(2).to_s
        distance_quartis = [q3, q2, q1]
        render json: distance_quartis
    end

    # GET /rank_health_centres
    def rank_health_centres
      health_centres = HealthCentre.all.to_a
      health_centres.sort! { |first, second|  first.procedure_count <=> second.procedure_count }
      result = {}

      health_centres.reverse.each_with_index do |health_centre, index|
        break if index == 10
        result[health_centre.name] = health_centre.procedure_count
      end
      render json: result
    end

    # GET /procedures_specialties/:id
    def procedures_specialties
        procedures = Procedure.where(specialty_id: params[:id])
        render json: procedures
    end

    # GET /distances/:id
    def distances
        health_centre = HealthCentre.find_by(id: params[:id])
        procedures = health_centre.procedures

        distances = Hash.new(0)
        distances_by_specialty = {}

        for i in 1..9
            distances_by_specialty[i] = Hash.new(0)
        end

        labels = ['1', '5', '10', '10+']

        procedures.each do |procedure|
            specialty = procedure.specialty.id

            if procedure.distance <= 1
                distances[labels[0]] += 1
                distances_by_specialty[specialty][labels[0]] += 1
            elsif procedure.distance <= 5
                distances[labels[1]] += 1
                distances_by_specialty[specialty][labels[1]] += 1
            elsif procedure.distance <= 10
                distances[labels[2]] += 1
                distances_by_specialty[specialty][labels[2]] += 1
            else
                distances[labels[3]] += 1
                distances_by_specialty[specialty][labels[3]] += 1
            end
        end

        total_info = {'distances': distances, 'specialty': distances_by_specialty}

        render json: total_info
    end

    # GET /distance_metric
    def distance_metric
        distance_metric = {'1': Procedure.where("distance <= ?", 1).count.to_s,
                            '5': Procedure.where("distance > ? AND distance <= ?", 1, 5).count.to_s,
                            '10': Procedure.where("distance > ? AND distance <= ?", 5, 10).count.to_s,
                            '10+': Procedure.where("distance > ?", 10).count.to_s
                          }

        render json: distance_metric
    end
end
