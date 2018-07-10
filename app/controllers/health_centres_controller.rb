class HealthCentresController < ApplicationController
    # GET /
    def index
        health_centres = HealthCentre.all
    end

    # GET /points
    def points
        health_centres_points = HealthCentre.all
        render json: health_centres_points
    end

    # GET /hospital/:id
    def hospital
      health_centre = HealthCentre.find_by(id: params[:id])
      render json: health_centre
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
        render json: health_centre
    end

    # GET /specialty_distance/:id
    def specialty_distance
      health_centre = HealthCentre.find_by(id: params[:id])
      procedures = health_centre.procedures


      distance_metric = {0 => trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 0 AND distance < 1', :specialty_id).count(:specialty_id)),
                         1 => trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 1 AND distance < 5', :specialty_id).count(:specialty_id)),
                         2 => trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 5 AND distance < 10', :specialty_id).count(:specialty_id)),
                         3 => trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 10', :specialty_id).count(:specialty_id))}

      result = {}
      count = 0
      j = 0
      distance_metric[0].each do |dc|
        result[j] = {0 => dc[0], 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => ""}
        count += 1
        j+= 1
      end

      result.each do |r|
        i = 1
        while i < 5 do
          r[1][i] = distance_metric[i - 1][r[1][0]].to_s
          i += 1
        end
      end

      render json: result
    end

    def trata_specialty_distance(array)
      result = {}
      array.each do |a|
        if a[0][0] == true
          name = Specialty.find_by(id: a[0][1]).name
          result[name] = a[1]
        end
      end
      return result
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

        distance_metric = {'1': procedures.where("distance <= ?", 1).count.to_s,
                            '5': procedures.where("distance > ? AND distance <= ?", 1, 5).count.to_s,
                            '10': procedures.where("distance > ? AND distance <= ?", 5, 10).count.to_s,
                            '10+': procedures.where("distance > ?", 10).count.to_s
                          }

        render json: distance_metric
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
