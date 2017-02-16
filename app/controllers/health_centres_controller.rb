class HealthCentresController < ApplicationController
    def index
        @health_centres = HealthCentre.all
    end

    def points
        @health_centres_points = HealthCentre.all
        render json: @health_centres_points
    end

    def procedures
        @health_centre = HealthCentre.find_by(id: params[:id])
        render json: @health_centre.procedures
    end

end
