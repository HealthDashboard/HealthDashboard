class HealthCentresController < ApplicationController
    # GET /
    def index
        @health_centres = HealthCentre.all
    end

    # GET /points
    def points
        @health_centres_points = HealthCentre.all
        render json: @health_centres_points
    end

    # GET /procedures/:id
    def procedures
        @health_centre = HealthCentre.find_by(id: params[:id])
        render json: @health_centre.procedures
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

        procedures = Procedure.where("specialty_id < ?", 10).group(:specialty).count
        procedures.each do |key, value|
            result[key.name] = value
        end

        render json: result
    end

    # GET /specialties_procedure_distance_average
    def specialties_procedure_distance_average
        result = {}

        procedures = Procedure.where("specialty_id < ?", 10).group(:specialty).average(:distance)
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

    # GET /health_centre_specialty/:hc_id/:spec_id
    def health_centre_specialty
        health_centre = HealthCentre.find_by(id: params[:hc_id])
        procedures = health_centre.procedures

        procedures_specialties = procedures.where(specialty_id: params[:spec_id])
        render json: procedures_specialties
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
