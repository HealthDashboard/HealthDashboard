namespace :scripts do
  desc "Running all scripts to generate json files."
  task run: :environment do
    scripts = %w(create_distances_metric.rb create_procedure_metric.rb
                 create_procedures_by_date.rb create_procedure_travel_time.rb
                 create_specialties_distance_metric.rb
                 create_specialties_metric.rb)

    scripts.each do |script|
       ruby "scripts/#{script}"
    end
  end
end
