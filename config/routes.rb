Rails.application.routes.draw do
	root to: 'health_centres#index'
	get 'points', to: 'health_centres#points'
	get 'procedures/:id', to: 'health_centres#procedures'
end
