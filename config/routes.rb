Rails.application.routes.draw do

  root to: 'application#home'

  get 'points', to: 'health_centres#points'
  get 'hospital/:id', to: 'health_centres#hospital'
  get 'procedures/:id', to: 'health_centres#procedures'
  get 'specialties/:id', to: 'health_centres#specialties'
  get 'specialty_distance/:id', to: 'health_centres#specialty_distance'
  get 'procedures_specialties/:id', to: 'health_centres#procedures_specialties'

  get '/specialties_count', to: 'health_centres#specialties_count'
  get '/specialties_procedure_distance_average', to: 'health_centres#specialties_procedure_distance_average'
  get '/distances/:id', to: 'health_centres#distances'
  get '/rank_health_centres', to: 'health_centres#rank_health_centres'
  get '/distance_metric', to: 'health_centres#distance_metric'
  get '/distance_quartis/:id', to: 'health_centres#distance_quartis'
  get '/health_centre_count', to: 'health_centres#health_centre_count'
  get '/total_distance_average', to: 'health_centres#total_distance_average'

  get 'estabelecimentos', to: 'health_centres#index'
  get 'dados-gerais', to: 'dashboard#index'
  get 'specialties', to: 'specialties#index'
  get 'busca', to: 'procedure#show'

  get '/procedure/health_centres', to: 'procedure#health_centres'
  get '/procedure/specialties', to: 'procedure#specialties'
  get 'procedure/procedure_info/:id', to: 'procedure#procedure_info'
  # get '/procedure/median', to: 'procedure#procedure_median'

  get '/about', to: 'application#about'


  resources :procedure do
    get :health_centres_search, on: :collection
    get :health_centres_procedure, on: :collection
    get :procedures_by_hc, on: :collection
    get :procedures_per_month, on: :collection
    get :procedures_per_health_centre, on: :collection
    get :procedures_per_specialties, on: :collection
    get :procedures_distance, on: :collection
    get :procedures_total, on: :collection
    get :download, on: :collection
    get :update_session, on: :collection
    get :procedures_latlong, on: :collection
    get :procedures_distance_group,  on: :collection
    get :procedure_median, on: :collection
    get :max_values, on: :collection
    get :procedure_large_cluster, on: :collection
    get :procedure_setor, on: :collection 
  end
end
