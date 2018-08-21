class HealthCentresController < ApplicationController
    # GET /
    # Params: None
    # Return: "Estabeleciementos" Page
    def index
        health_centres = HealthCentre.all
    end

    # GET /points
    # Params: None
    # Return: Return all helth centres
    def points
        health_centres_points = HealthCentre.all
        render json: health_centres_points
    end

    # GET /health_centre_count
    # Params: None
    # Return: Return the number of health centres
    def health_centre_count
        render json: HealthCentre.count
    end

    # GET /total_distance_average
    # Params: None
    # Return: the average distance between pacients and health centre
    def total_distance_average
        render json: Procedure.average(:distance).to_f.round(1)
    end

    # GET /hospital/:id
    # Params: id
    # Return: health centre details given a id
    def hospital
      health_centre = HealthCentre.find_by(id: params[:id])
      render json: health_centre
    end

    # GET /procedures/:id
    # Params: id
    # Return: [lat, long] for all procedures from a health centre(id)
    def procedures
        health_centre = HealthCentre.find_by(id: params[:id])
        procedures = health_centre.procedures
        procedures = procedures.group(:lat, :long).count.to_a.flatten.each_slice(3)
        render json: procedures
    end

    # GET /procedures_setor_healthcentre/:id
    def procedures_setor_healthcentre
        health_centre = HealthCentre.find_by(id: params[:id])
        procedures = health_centre.procedures
        procedures = procedures.where(:lat => params[:lat], :long => params[:long]).pluck(:id)
        render json: procedures
    end


    # GET /specialties/:id
    # Params: id
    # Return: number of procedures group by specialties from a health centre(id)
    def specialties
        health_centre = HealthCentre.find_by(id: params[:id])
        procedures = health_centre.procedures.group(:specialty).count
        result = {}

        procedures.each do |key, value|
            result[key.name] = value
        end
        render json: result
    end

    # GET /specialty_distance/:id
    # Params: id
    # Return: number of procedures group by specialties and distance from a health centre(id)
    def specialty_distance
      health_centre = HealthCentre.find_by(id: params[:id])
      procedures = health_centre.procedures


      distance_metric = {0 => trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 0 AND distance < 1', :specialty_id).count(:specialty_id)),
                         1 => trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 1 AND distance < 5', :specialty_id).count(:specialty_id)),
                         2 => trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 5 AND distance < 10', :specialty_id).count(:specialty_id)),
                         3 => trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 10', :specialty_id).count(:specialty_id))}

      result = {}
      j = 0
      distance_metric[0].each do |dc|
        result[j] = {0 => dc[0], 1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => ""}
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

    # No route
    # Params: array
    # Return: array of Specialty_name => number of procedures
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
    # Params: None
    # Return: Number of procedures group by specialty
    def specialties_count
        result = {}

        procedures = Procedure.where("specialty_id < ?", 10).order(:specialty_id).group(:specialty).count
        procedures.each do |key, value|
            result[key.name] = value
        end

        render json: result
    end

    # GET /specialties_procedure_distance_average
    # Params: None
    # Return: Average distance group by specialty
    def specialties_procedure_distance_average
        result = {}

        procedures = Procedure.where("specialty_id < ?", 10).order(:specialty_id).group(:specialty).average(:distance)
        procedures.each do |key, value|
            result[key.name] = value.to_f
        end

        render json: result
    end

    # GET /distance_quartis/:id
    # Params: id
    # Return: Quartis distance for a helath centre
    def distance_quartis
        health_centre = HealthCentre.find_by(id: params[:id])
        procedures = health_centre.procedures.pluck(:distance);
        distances = DescriptiveStatistics::Stats.new(procedures)
        q1 = distances.value_from_percentile(25).round(2).to_s
        q2 = distances.value_from_percentile(50).round(2).to_s
        q3 = distances.value_from_percentile(75).round(2).to_s
        distance_quartis = [q3, q2, q1]
        distances = nil
        render json: distance_quartis
    end

    # GET /rank_health_centres
    # Params: None
    # Return: Return TOP10 health centres by number of procedures 
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
    # Params: id
    # Return: all procedures for a specialty 
    def procedures_specialties
        procedures = Procedure.where(specialty_id: params[:id])
        render json: procedures
    end

    # GET /distances/:id
    # Params: id
    # Return: Number of procedures group by distance intervals for a health centre
    def distances
        health_centre = HealthCentre.find_by(id: params[:id])
        procedures = health_centre.procedures

        distance_metric = {'< 1 km': procedures.where("distance <= ?", 1).count,
                            '> 1 km e < 5 km': procedures.where("distance > ? AND distance <= ?", 1, 5).count,
                            '> 5 km e < 10 km': procedures.where("distance > ? AND distance <= ?", 5, 10).count,
                            '> 10 km': procedures.where("distance > ?", 10).count
                          }

        render json: distance_metric
    end

    # GET /distance_metric
    # Params: None
    # Return: Number of procedures group by distance intervals
    def distance_metric
        distance_metric = {'< 1 km': Procedure.where("distance <= ?", 1).count,
                            '> 1 km e < 5 km': Procedure.where("distance > ? AND distance <= ?", 1, 5).count,
                            '> 5 km e < 10 km': Procedure.where("distance > ? AND distance <= ?", 5, 10).count,
                            '> 10 km': Procedure.where("distance > ?", 10).count
                          }

        render json: distance_metric
    end
end
