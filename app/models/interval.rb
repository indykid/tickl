class Interval < ActiveRecord::Base
  attr_accessible :start_time, :state, :stop_time

  belongs_to :task

  # scope :for_today, lambda { where('updated_at > ?', Time.now.midnight.utc) }

  STATES = [ "work", "break" ]

  STATES.each do |state|
    define_method("#{state}?") do
      self.state == state
    end

    define_method("#{state}!") do
      self.update_attribute(:state, state)
    end
  end

  def self.for_today
    updated_at > Time.now.midnight.utc
  end
  
end
