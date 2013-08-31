module TasksHelper

  

  def today_total_work(tasks)
    intervals_durations = tasks_for_current_day(tasks).map do |task|
      task.intervals.inject(0){ |sum, interval|  sum + duration(interval) if interval.work? }
    end
    intervals_durations.sum # gives amount of seconds for all intervals of all tasks of the current day
  end

  def tasks_for_current_day(tasks)
    tasks.select{ |task| task.updated_at.to_date == Date.today }
  end 

  def duration(interval)
    interval.stop_time - interval.start_time if interval.stop_time
  end

  def today_total_breaks(tasks)
    intervals_durations = tasks_for_current_day(tasks).map do |task|
      task.intervals.inject(0) { |sum, interval| sum + duration(interval) if interval.break? }
    end
    intervals_durations.sum
  end

  def task_total_work(task)
    work_intervals = task.intervals.select { |interval| interval.work? }
    work_time = work_intervals.inject(0) { |sum, interval| sum + duration(interval) }
  end

  def start_now?
    self.start_now == true
  end


end
