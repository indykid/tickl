class TasksController < ApplicationController
  # GET /tasks
  # GET /tasks.json

  before_filter :authenticate
  before_filter :check_running_task, only: [:create, :start]

  # def user_home
  #   @task = current_user.tasks.new(params[:task])
  #   @tasks = current_user.tasks

  # end

  def index
    @task = current_user.tasks.new

    @worked_on_today = current_user.tasks.updated_today

    #@todo_tasks = current_user.todo_in_desc

    #@done_today = current_user.tasks.done.updated_today

    #@running_task = current_user.tasks.running.first
    
    respond_to do |format|
      format.html # index.html.erb
      format.json {  
        hash = {
          resume: current_user.tasks.tasks_to_resume,
          start: current_user.tasks.tasks_to_start,
          done_today: current_user.tasks.done.updated_today
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
    @task = Task.find(params[:id])

    respond_to do |format|
      if @task.complete
        format.html { redirect_to tasks_url }
        format.json { render nothing: true }
      else 
        format.html { render action: "show" }
        format.json { render nothing: true, status: :unprocessable_entity }
      end
    end
  end

  def take_break
    task = Task.find(params[:id])
    task.take_break
    task[:elapsed_time] = 0
    task[:new_interval_state] = "break"
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

      #binding.pry
      task[:elapsed_time] = DateTime.now.to_i - task.intervals.last.start_time.to_i

      task[:last_interval_state] = task.intervals.last.state
      render json: task
  
  end

  def start
    task = Task.find(params[:id]).create_interval
    task[:elapsed_time] = 0
    task[:new_interval_state] = "work"
    render json: task#task_url(@task.id)
  end



  # GET /tasks/new
  # GET /tasks/new.json
  def new
    @task = Task.new

    respond_to do |format|
      format.html # new.html.erb
      #format.json { render json: @task }
    end
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
    if task= current_user.tasks.running.first
        #redirect_to task and return
      if  params[:action]=="start" || !(params[:task][:start_now]=="0")
        task.stop_last_interval  
      end
    end
  end
end
