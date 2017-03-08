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
        procedures = health_centre.procedures
        result = {}

        procedures.each do |procedure|
           specialty_name = procedure.specialty.name
           if result.keys.include?(specialty_name)
              result[specialty_name] += 1
           else
              result[specialty_name] = 1
           end
        end
        render json: result
    end

    # GET /specialties_count
    def specialties_count
        result = {}

        for spec_id in 1..9
            procedures = Procedure.where(specialty_id: spec_id)
            result[Specialty.find_by(id: spec_id).name] = procedures.count
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

end
