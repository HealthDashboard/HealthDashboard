class HealthCentresController < ApplicationController
    def index
        @health_centres = HealthCentre.all
    end

    def points
        @health_centres_points = HealthCentre.all
        render json: @health_centres_points.to_json(only: [:lat, :long])
    end
end
