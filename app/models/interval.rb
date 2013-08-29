class Interval < ActiveRecord::Base
  attr_accessible :start_time, :state, :stop_time

  belongs_to :task

  STATES = [ "work", "break" ]

  STATES.each do |state|
    define_method("#{state}?") do
      self.state == state
    end

    define_method("#{state}!") do
      self.update_attribute(:state, state)
    end
  end
  
end
