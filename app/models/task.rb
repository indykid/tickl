class Task < ActiveRecord::Base
  attr_accessible :completed, :title, :start_now#, user_id
  attr_accessor :start_now

  belongs_to :user
  has_many :intervals

  after_create :create_interval, :if => :start_now 


  scope :due_tasks, -> { where(completed: false) }

  def start
    create_interval
  end

  def active?
    !self.intervals.last.stop_time.nil? 
  end

  def resume?
    !self.intervals.empty?
  end


  def create_interval(state = "work")
    self.intervals.create!(state: state, start_time: DateTime.now)
  end

  def stop_last_interval
    self.intervals.last.update_attributes(stop_time: DateTime.now)
  end 

  #not sure i need this method now:
  def start_break
    current_interval = self.intervals.where(state: "work").last

    #self.intervals.where('stop_time is ? and state = ?', nil, "work").first
    current_interval.update_attributes(stop_time: DateTime.now)
    self.create_interval("break")
  end

  def complete
    self.intervals.last.update_attributes(stop_time: DateTime.now)
    self.update_attributes(complete: true)
  end

end
