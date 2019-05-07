source 'https://rubygems.org'

git_source(:github) do |repo_name|
  repo_name = "#{repo_name}/#{repo_name}" unless repo_name.include?("/")
  "https://github.com/#{repo_name}.git"
end

# Server side clustering
# gem 'geocluster'
gem 'kmeans-clusterer'

gem 'geokit-rails'

# Install bootstrap
gem 'bootstrap-sass'

# Install Select 2
gem "select2-rails"

# group date, sql helper for dates
gem 'groupdate'

# Bootstrap slider
gem 'bootstrap-slider-rails'

# Bootstrap datepicker
gem 'bootstrap-datepicker-rails'

# Code coverage
gem 'simplecov', require: false, group: :test

# Geolocation gem
gem 'geocoder'

# Using Open Street maps
gem 'leaflet-rails'

# Clusting with leaflet Marker cluster
gem 'rails-assets-leaflet.markercluster', source: 'https://rails-assets.org'

# Statistics gem
gem 'descriptive-statistics'

#Make the post/get requests
gem 'rest-client'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 5.0.1'

# Download csv files
gem 'postgres-copy'

# Faster seed
gem 'activerecord-import'

# Read JSON files
gem 'json', '~> 1.8.3'

#Use postgres
gem 'pg'

# Use Puma as the app server
gem 'puma', '~> 3.0'

# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'

# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'

# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 4.2'

# Use jquery as the JavaScript library
gem 'jquery-rails'

# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem 'turbolinks', '~> 5'

# Turbolinks working together with jquery
gem 'jquery-turbolinks'

# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.5'

# Testing
gem 'rails-controller-testing'

# Presentation visualizer
gem 'slideshow', '~> 3.1'

# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby
# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 3.0'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'
# Autocomplete gem
# gem 'rails-jquery-autocomplete', '~> 1.0', '>= 1.0.3'
# Use Capistrano for deployment
# gem 'capistrangem 'slideshow', '~> 3.1'gem 'slideshow', '~> 3.1'o-rails', group: :development

group :development, :test, :docker do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platform: :mri
  gem 'rspec-rails', '~> 3.7'
  gem 'jasmine-jquery-rails'
  gem 'jasmine-rails'
  gem 'teaspoon-jasmine'
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console', '>= 3.3.0'
  gem 'listen', '~> 3.0.5'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]

# Graphs
gem 'echarts-rails', :git => 'https://github.com/NaomiKodaira/echarts-rails.git'

# Authentication
gem 'devise'
gem 'devise-i18n'
