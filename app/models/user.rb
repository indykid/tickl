class User < ActiveRecord::Base
  attr_accessible :email, :name, :password, :password_confirmation
  has_secure_password

  has_many :tasks

  before_save { |user| user.email = email.downcase }
  #aboe can be written as: before_save { email.downcase! }

  validates :name, presence: true, length: { maximum: 25 }

  VALID_EMAIL_REGEX = /\A[\w+\-.]+@[a-z\d\-.]+\.[a-z]+\z/i
  validates :email, presence: true, format: { with: VALID_EMAIL_REGEX }, uniqueness: { case_sensitive: false }

  validates :password, presence: true, length: { minimum: 6 }

  validates :password_confirmation, presence: true 


  def todo_in_desc
    tasks_in_desc = tasks.where(completed: false).order('tasks.updated_at desc').includes(:intervals)
    tasks_to_resume = tasks_in_desc.select(&:resume?) 
    tasks_not_started = tasks_in_desc.select(&:not_started?)
    tasks_to_resume + tasks_not_started
    #task status is resume (array ordered by desc)
    #to_start_tasks = # where task status is to_start
    #resume_tasks.merge to_start_tasks
  end

end

