module TasksHelper

  

  def total_work(tasks)
    total_duration = tasks_for_current_day(tasks).map do |task|
      task.intervals.inject(0){ |sum, interval|  sum + duration(interval) if interval.work? }
    end

    total_duration.sum # gives amount of seconds for all intervals of all tasks of the current day
  end

  def tasks_for_current_day(tasks)
    tasks.select{ |task| task.updated_at.to_date == Date.today }
  end 

  def duration(interval)
    interval.stop_time - interval.start_time
  end


  def total_break(tasks)
    total_duration = tasks_for_current_day.map do |task|
      task.intervals.inject(0) { |sum, interval| sum + duration(interval) if interval.break? }
    end
    total_duration.sum
  end


end
