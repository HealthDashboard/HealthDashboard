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
        render json: health_centres_points, status: 200 and return
    end

    # GET /health_centre_count
    # Params: None
    # Return: Return the number of health centres
    def health_centre_count
        render json: HealthCentre.count, status: 200 and return
    end

    # GET /total_distance_average
    # Params: None
    # Return: the average distance between pacients and health centre
    def total_distance_average
        render json: Procedure.average(:distance).to_f.round(1), status: 200 and return
    end

    # GET /hospital/:id
    # Params: id
    # Return: health centre details given a id
    def hospital
        health_centre = HealthCentre.find_by(id: params[:id])
        if health_centre == nil
            render json: "Bad request", status: 400 and return
        end
        render json: health_centre, status: 200 and return
    end

    # GET /procedures/:id
    # Params: id
    # Return: [lat, long] for all procedures from a health centre(id)
    def procedures
        health_centre = HealthCentre.find_by(id: params[:id])

        if health_centre == nil
            render json: "Bad request", status: 400 and return
        end
        procedures = health_centre.procedures
        procedures = procedures.group(:lat, :long).count.to_a.flatten.each_slice(3)
        render json: procedures, status: 200 and return
    end

    # GET /procedures_setor_healthcentre/:id
    def procedures_setor_healthcentre
        health_centre = HealthCentre.find_by(id: params[:id])
        if health_centre == nil
            render json: "Bad request", status: 400 and return
        end
        procedures = health_centre.procedures
        procedures = procedures.where(:lat => params[:lat], :long => params[:long]).pluck(:id)
        render json: procedures
    end


    # GET /specialties/:id
    # Params: id
    # Return: number of procedures group by specialties from a health centre(id)
    def specialties
        health_centre = HealthCentre.find_by(id: params[:id])
        if health_centre == nil
            render json: "Bad request", status: 400 and return
        end
        procedures = health_centre.procedures.group(:specialty).count
        result = {}

        procedures.each do |key, value|
            result[key.name] = value
        end
        render json: result, status: 200 and return
    end

    # GET /specialty_distance/:id
    # Params: id
    # Return: number of procedures group by specialties and distance from a health centre(id)
    def specialty_distance
      health_centre = HealthCentre.find_by(id: params[:id])
      procedures = health_centre.procedures


      distance_metric = [trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 0 AND distance < 1', :specialty_id).count(:specialty_id)),
                         trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 1 AND distance < 5', :specialty_id).count(:specialty_id)),
                         trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 5 AND distance < 10', :specialty_id).count(:specialty_id)),
                         trata_specialty_distance(procedures.order(:specialty_id).group('distance >= 10', :specialty_id).count(:specialty_id))]


      specialties_distance = {}

      distance_metric.each.with_index do |distance_group, index|
        distance_group.each do |specialty, count|
            if specialties_distance[specialty] == nil
                specialties_distance[specialty] = {0=>"", 1=>"", 2=>"", 3=>"", 4=>"", 5=>""}
                specialties_distance[specialty][0] = specialty
            end
            specialties_distance[specialty][index + 1] = count.to_s
        end
      end
      result = {}
      i = 0
      specialties_distance.each do |_index, value|
        result[i] = value
        i += 1
      end
      render json: result.to_json
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
      result = {}

      procedure = Procedure.group(:cnes_id).order("count_id DESC").limit(10)
                  .count(:id).each.with_index do |p, i|
                result[HealthCentre.find_by(cnes: p[0]).name.to_s] = p[1].to_i
      end

      render json: result
    end

    # GET /distances/:id
    # Params: id
    # Return: Number of procedures group by distance intervals for a health centre
    def distances
        render json: "Bad request", status: 400 and return unless params[:id] != nil
        health_centre = HealthCentre.find_by(id: params[:id])
        render json: "Not found", status: 404 and return unless health_centre != nil
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
