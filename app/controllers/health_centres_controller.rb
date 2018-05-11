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

    # GET /health_centre_specialty/:hc_id/:id
    def health_centre_specialty
        health_centre = HealthCentre.find_by(id: params[:hc_id])
        procedures = health_centre.procedures

        procedures_specialties = procedures.where(specialty_id: params[:id]).pluck(:lat, :long);
        render json: procedures_specialties
    end

    # GET /health_centre_type/:hc_id/:id
    def health_centre_type
        health_centre = HealthCentre.find_by(id: params[:hc_id])
        procedures = health_centre.procedures

        procedures_type = procedures.where(treatment_type: params[:id]).pluck(:lat, :long);
        render json: procedures_type
    end

    # GET /health_centre_region/:hc_id/:id
    def health_centre_region
        health_centre = HealthCentre.find_by(id: params[:hc_id])
        procedures = health_centre.procedures
        procedures_region = procedures.where(PR: @@region_id_array[params[:id].to_i]).pluck(:lat, :long);
        # procedures_specialties = procedures.where(region: params[:spec_id])
        render json: procedures_region
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

    def distance_metric
        distance_metric = {'1': Procedure.where("distance <= ?", 1).count.to_s,
                            '5': Procedure.where("distance > ? AND distance <= ?", 1, 5).count.to_s,
                            '10': Procedure.where("distance > ? AND distance <= ?", 5, 10).count.to_s,
                            '10+': Procedure.where("distance > ?", 10).count.to_s
                          }

        render json: distance_metric
    end

    def shorter_distance_count
        shorter_distance_count = {'distance': Procedure.sum("distance_count").to_s}

        render json: shorter_distance_count
    end

end
