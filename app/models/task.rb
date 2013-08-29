class Task < ActiveRecord::Base
  attr_accessible :completed, :title, :start_now#, user_id
  attr_accessor :start_now

  belongs_to :user
  has_many :intervals

  after_create :create_interval, :if => :start_now

  def create_interval(state = "work")
    self.intervals.create!(state: state, start_time: DateTime.now)
  end

  def start_break
    current_interval = self.intervals.where('stop_time is ? and state = ?', nil, "work").first
    current_interval.update_attributes(stop_time: DateTime.now)
    self.create_interval("break")
  end


end
