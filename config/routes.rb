Rails.application.routes.draw do

  mount JasmineRails::Engine => '/specs' if defined?(JasmineRails)
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

  resources :health_centres do
    get :procedures_setor_healthcentre, on: :collection
  end

  get 'estabelecimentos', to: 'health_centres#index'
  get 'dados-gerais', to: 'dashboard#index'
  get 'specialties', to: 'specialties#index'
  get 'busca', to: 'procedure#show'

  get '/procedure/health_centres', to: 'procedure#health_centres'
  get '/procedure/specialties', to: 'procedure#specialties'
  get 'procedure/proceduresInfo/:id', to: 'procedure#proceduresInfo'
  # get '/procedure/quartiles', to: 'procedure#proceduresQuartiles'
  get '/procedure/proceduresCompleteness', to: 'procedure#proceduresCompleteness'

  get '/about', to: 'application#about'
  get '/faq', to: 'application#faq'


  resources :procedure do
    get :healthCentresCnes, on: :collection
    get :proceduresPerMonth, on: :collection
    get :proceduresPerHealthCentre, on: :collection
    get :proceduresPerSpecialties, on: :collection
    get :proceduresDistance, on: :collection
    get :proceduresTotal, on: :collection
    post :download, on: :collection
    get :proceduresDistanceGroup,  on: :collection
    get :proceduresQuartiles, on: :collection
    get :proceduresMaxValues, on: :collection
    get :proceduresClusterPoints, on: :collection
    get :proceduresSetorCensitario, on: :collection 
    get :proceduresVariables, on: :collection
    get :proceduresCompleteness, on: :collection
    get :proceduresPop, on: :collection
    get :proceduresCid10Specific, on: :collection
    get :getSectorByCd_geocodi, on: :collection
  end
end
