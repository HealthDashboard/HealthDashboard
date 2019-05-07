class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable, :omniauthable, :registerable, :recoverable
  devise :database_authenticatable, :rememberable, :validatable
end
