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
  get '/distance_metric', to: 'health_centres#distance_metric'
  get '/shorter_distance_count', to: 'health_centres#shorter_distance_count'
 
  get 'metricas', to: 'dashboard#index'
  get 'specialties', to: 'specialties#index'
  get 'estabelecimentos', to: 'health_centre_filter#index'
  get 'busca', to: 'procedure#show'

  get '/procedure/health_centres', to: 'procedure#health_centres'
  get '/procedure/specialties', to: 'procedure#specialties'
  get 'procedure/allProcedures', to: 'procedure#allProcedures'

  get '/about', to: 'application#about'

  resources :procedure do
    get :procedures_search, on: :collection
    get :health_centres_search, on: :collection
    get :health_centres_procedure, on: :collection
    get :procedures_by_hc, on: :collection
    get :procedures_count, on: :collection 
  end
end
