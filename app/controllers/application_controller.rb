class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  before_action :authenticate_user!, except: [:home, :about, :faq]

  def authenticate_admin_user!
    if current_user.nil? || !current_user.admin
      flash[:error] = I18n.t(:unauthenticated, scope: [:devise, :failure])
      redirect_to root_path
    end
  end

  def current_admin_user
    return nil if current_user.nil? || !current_user.admin?
    current_user
  end
end
