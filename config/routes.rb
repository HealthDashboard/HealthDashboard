Rails.application.routes.draw do

  root to: 'health_centres#index'

  get 'points', to: 'health_centres#points'
  get 'procedures/:id', to: 'health_centres#procedures'
  get 'specialties/:id', to: 'health_centres#specialties'
  get 'procedures_specialties/:id', to: 'health_centres#procedures_specialties'

  get 'health_centre_specialty/:hc_id/:id', to: 'health_centres#health_centre_specialty'
  get 'health_centre_type/:hc_id/:id', to: 'health_centres#health_centre_type'
  get 'health_centre_region/:hc_id/:id', to: 'health_centres#health_centre_region'

  get 'specialties_count', to: 'health_centres#specialties_count'
  get '/specialties_procedure_distance_average', to: 'health_centres#specialties_procedure_distance_average'
  get 'distances/:id', to: 'health_centres#distances'
  get '/rank_health_centres', to: 'health_centres#rank_health_centres'
  get '/distance_metric', to: 'health_centres#distance_metric'
  get '/shorter_distance_count', to: 'health_centres#shorter_distance_count'

  get '/health_centre_filter/analise/:id/:name/:id_filter', to: 'health_centre_filter#analise'
 
  get 'dados-gerais', to: 'dashboard#index'
  get 'specialties', to: 'specialties#index'
  get 'estabelecimentos', to: 'health_centre_filter#index'
  get 'busca', to: 'procedure#show'

  get 'listType', to: 'health_centre_filter#listType'
  get 'listSpecialty', to: 'health_centre_filter#listSpecialty'
  get 'listRegion', to: 'health_centre_filter#listRegion'

  get '/procedure/health_centres', to: 'procedure#health_centres'
  get '/procedure/specialties', to: 'procedure#specialties'
  get 'procedure/allProcedures', to: 'procedure#allProcedures'
  # get 'procedure/procedures_per_month', to: 'procedure#procedures_per_month'

  get '/about', to: 'application#about'

  resources :procedure do
    get :procedures_search, on: :collection
    get :health_centres_search, on: :collection
    get :health_centres_procedure, on: :collection
    get :procedures_by_hc, on: :collection
    get :procedures_count, on: :collection
    get :procedures_per_month, on: :collection
    get :procedures_per_health_centre, on: :collection
    get :procedures_per_specialties, on: :collection
    get :procedures_distance, on: :collection
    get :procedures_total, on: :collection
    get :download, on: :collection
    get :update_session, on: :collection
    get :procedures_latlong, on: :collection
  end
end
