require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module HealthSmartCity
  class Application < Rails::Application
  	Rails.application.config.assets.precompile += %w( *.js ^[^_]*.css *.css.erb )
  	# config.assets.initialize_on_precompile = false
  	# config.web_console.whitelisted_ips = '10.0.2.2'
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
  end
end
