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

    # GET /procedures_specialties/:id
    def procedures_specialties
        procedures = Procedure.where(specialty_id: params[:id])
        render json: procedures
    end

end
