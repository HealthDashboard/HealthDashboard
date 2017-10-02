Rails.application.routes.draw do

  root to: 'health_centres#index'

  get 'points', to: 'health_centres#points'
  get 'procedures/:id', to: 'health_centres#procedures'
  get 'specialties/:id', to: 'health_centres#specialties'
  get 'procedures_specialties/:id', to: 'health_centres#procedures_specialties'
  get 'health_centre_specialty/:hc_id/:spec_id', to: 'health_centres#health_centre_specialty'
  get 'specialties_count', to: 'health_centres#specialties_count'
  get '/specialties_procedure_distance_average', to: 'health_centres#specialties_procedure_distance_average'
  get 'distances/:id', to: 'health_centres#distances'
  get '/rank_health_centres', to: 'health_centres#rank_health_centres'

  get 'dashboard', to: 'dashboard#index'
  get 'specialties', to: 'specialties#index'
  get 'health_centre_filter', to: 'health_centre_filter#index'
  get 'health_centre_filter/:health_centre_id/:specialty_id', to: 'health_centre_filter#filter_health_centres'
  get 'procedure', to: 'procedure#show'

  get '/procedure/health_centres', to: 'procedure#health_centres'
  get '/procedure/specialties', to: 'procedure#specialties'
  get 'procedure/allProcedures', to: 'procedure#allProcedures'
  # get 'procedure/procedures_search/:gender', to: 'procedure#procedures_search'
  resources :procedure do
    get :procedures_search, on: :collection
    get :health_centres_search, on: :collection
  end
end
