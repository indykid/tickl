class TasksController < ApplicationController
  

  before_filter :authenticate
  before_filter :check_running_task, only: [:create, :do_work]



  # GET /tasks
  # GET /tasks.json

  def index
    @task = current_user.tasks.new

    todays_work_intervals = current_user.todays_intervals.select{ |interval| interval.work? }

    todays_breaks_intervals = current_user.todays_intervals.select{ |interval| interval.break? }

    
    respond_to do |format|
      format.html # index.html.erb
      format.json {  
        hash = {
          resume: current_user.tasks.tasks_to_resume,
          start: current_user.tasks.tasks_to_start,
          done_today: current_user.tasks.done.updated_today,
          todays_work_duration: duration_of_intervals(todays_work_intervals),
          todays_breaks_duration: duration_of_intervals(todays_breaks_intervals)
        }
        render json: hash 
      }
    end
  end

  # GET /tasks/1
  # GET /tasks/1.json
  def show
    @task = Task.find(params[:id])
    if @task.active?
      render "tasks/current"
    else
      render "tasks/show"
    end
  end

  def complete
    task = Task.find(params[:id])
    if task.complete
      render json: task 
    else 
      render  json: task , status: :unprocessable_entity 
    end
  end

  def take_break
    task = Task.find(params[:id])
    task.take_break
    task[:elapsed_time] = 0
    task[:interval_state] = "break"
    render json: task
    # respond_to do |format|
    #   if @task.take_break
    #     format.html { redirect_to tasks_url }
    #     format.json { render nothing: true }
    #   else
    #     format.html { render action: "show" }
    #     format.json { render nothing: true, status: :unprocessable_entity }
    #   end
    # end


  end

  def stop_timer
    task = Task.find(params[:id])
    if task.stop_last_interval
      render nothing: true 
    else
      render nothing: true, status: :unprocessable_entity 
    end
  end

  def running
    task = current_user.tasks.running.first unless  current_user.tasks.running.empty?
    if task.present?
      task[:elapsed_time] = DateTime.now.to_i - task.intervals.last.start_time.to_i

      task[:last_interval_state] = task.intervals.last.state
    end
      render json: task
  
  end

  def do_work
    task = Task.find(params[:id]).create_interval
    task[:elapsed_time] = 0
    task[:interval_state] = "work"
    render json: task #task_url(@task.id)
  end

  def activity
    intervals_of_tasks = current_user.tasks.map(&:intervals).flatten

    todays_intervals = intervals_of_tasks.select { |interval| interval.updated_at > Time.now.midnight.utc }

    render json: todays_intervals
  end



  # GET /tasks/new
  def new
    @task = Task.new

    # respond_to do |format|
    #   format.html new.html.erb
    #   format.json { render json: @task }
    # end
  end

  # GET /tasks/1/edit
  def edit
    @task = Task.find(params[:id])
  end

  # POST /tasks
  # POST /tasks.json
  def create

    @task = Task.new(params[:task])
    @task.user = current_user
    
    respond_to do |format|
      if @task.save
        if @task.start_now?
          format.html { redirect_to task_url(@task) }
          format.json { render json: @task, status: :created, location: @task }
        else
          format.html { redirect_to tasks_url, notice: 'Task was added to your list' }
          format.json { render json: @task, status: :created, location: @task }
        end
      else
        format.html { render action: "new" }
        format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /tasks/1
  # PUT /tasks/1.json
  def update
    @task = Task.find(params[:id])

    respond_to do |format|
      if @task.update_attributes(params[:task])
        format.html { redirect_to @task, notice: 'Task was successfully updated.' }
        #format.json { head :no_content }
      else
        format.html { render action: "edit" }
        #format.json { render json: @task.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tasks/1
  # DELETE /tasks/1.json
  def destroy
    @task = Task.find(params[:id])
    @task.destroy

    respond_to do |format|
      format.html { redirect_to tasks_url }
      format.json { head :no_content }
    end
  end

private
  def check_running_task
    if task = current_user.tasks.running.first
        #redirect_to task and return
      if  params[:action]=="do_work" || !(params[:task][:start_now]=="0")
        task.stop_last_interval  
      end
    end
  end

  def duration_of_intervals(intervals)
    intervals.inject(0) { |sum, interval| sum+interval.duration }
  end


end
