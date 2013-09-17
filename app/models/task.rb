class Task < ActiveRecord::Base
  attr_accessible :completed, :title, :start_now#, user_id
  attr_accessor :start_now

  belongs_to :user
  has_many :intervals

  after_create :create_interval, :if => :start_now?

  scope :todo, where(completed: false)
  scope :done, where(completed: true)
  scope :updated_today, lambda { where('updated_at > ?', Time.now.midnight.utc) }

  scope :running, joins(:intervals).where('intervals.stop_time is NULL')

  def create_interval(state = "work")
    #if it has any running update its stop time
    self.intervals.create!(state: state, start_time: DateTime.now)
    self
  end


  def duration_of_intervals(intervals)
    intervals.inject(0) { |sum, interval| sum+interval.duration }
  end

  def active? #show.html
    self.intervals.last.stop_time.nil? if self.intervals.last
  end

  def not_started? #index.html
    self.intervals.empty?
  end

  def resume? #index.html
    !self.intervals.empty? && self.completed == false
  end

  def stop_last_interval
    self.intervals.last.update_attributes(stop_time: DateTime.now)
  end 

  def take_break # tasks#take_break
    current_interval = self.intervals.where(state: "work").last

    #self.intervals.where('stop_time is ? and state = ?', nil, "work").first
    current_interval.update_attributes(stop_time: DateTime.now)
    self.create_interval("break")
  end

  def complete
    self.intervals.last.update_attributes(stop_time: DateTime.now)
    self.update_attributes(completed: true)
  end

  def start_now? #controller
    self.start_now == "0" ? false : true 
  end

  def last_interval #task_helper
    self.intervals.last
  end

  def working?
    self.active? && self.last_interval.work?
  end

  def on_break?
    self.active? && self.last_interval.break?
  end

  def self.tasks_to_resume
    where(completed: false).order('tasks.updated_at desc').includes(:intervals).select(&:resume?) 
  end

  def self.tasks_to_start
    where(completed: false).order('tasks.updated_at desc').includes(:intervals).select(&:not_started?) 
  end



  # tasks_to_resume = tasks_in_desc.select(&:resume?) 
  #   tasks_not_started = tasks_in_desc.select(&:not_started?)



end
