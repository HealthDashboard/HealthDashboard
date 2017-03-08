Rails.application.routes.draw do
	root to: 'health_centres#index'
	get 'points', to: 'health_centres#points'
	get 'procedures/:id', to: 'health_centres#procedures'
	get 'specialties/:id', to: 'health_centres#specialties'
	get 'procedures_specialties/:id', to: 'health_centres#procedures_specialties'
	get 'health_centre_specialty/:hc_id/:spec_id', to: 'health_centres#health_centre_specialty'
	get 'specialties_count', to: 'health_centres#specialties_count'
	get 'distances/:id', to: 'health_centres#distances'
end
