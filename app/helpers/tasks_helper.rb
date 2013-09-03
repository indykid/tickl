module TasksHelper

  

  def today_total_work(tasks)
    puts tasks.size
    intervals_durations = tasks_for_current_day(tasks).map do |task|
      task.intervals.inject(0){ |sum, interval|  sum + duration(interval) if interval.work?; sum }
    end
    intervals_durations.sum # gives amount of seconds for all intervals of all tasks of the current day
  end

  def tasks_for_current_day(tasks)
    tasks.select{ |task| task.updated_at.to_date == Date.today }
  end 

  def duration(interval)
    if interval.stop_time
      interval.stop_time - interval.start_time 
    else
      0
    end
  end

  def today_total_breaks(tasks)
    intervals_durations = tasks_for_current_day(tasks).map do |task|
      task.intervals.inject(0) { |sum, interval| sum + duration(interval) if interval.break?; sum }
    end
    intervals_durations.sum
  end

  def task_total_work(task)
    #unless task.intervals.empty?
      work_intervals = task.intervals.select { |interval| interval.work? }
      work_time = work_intervals.inject(0) { |sum, interval| sum + duration(interval) }
    #end
  end

  def task_total_breaks(task)
    break_intervals = task.intervals.select { |interval| interval.break? }
    total_breaks = break_intervals.inject(0) { |sum, interval| sum + duration(interval) }
  end


  def current_duration(task) #show.html
    DateTime.now - task.last_interval.start_time.to_datetime if task.last_interval
  end
  
 

  


end
