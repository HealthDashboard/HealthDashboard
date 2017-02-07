Rails.application.routes.draw do
	root to: 'health_centres#index'
	get 'points', to: 'health_centres#points'
end
