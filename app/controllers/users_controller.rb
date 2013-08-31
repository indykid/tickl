class UsersController < ApplicationController

  before_filter :authenticate, except: [:new, :create]
  
  def index
  end

  def new
    @user = User.new
  end

  def create
    @user = User.new(params[:user])
    respond_to do |format|
      if @user.save
        session[:user_id] = @user.id
        format.html { redirect_to @user, notice: "your account was created" }
        format.json { render json: @user, status: :created, location: @user }
      else
        format.html { render action: "new" }
        format.json { render json: @user.errors, status: :unprocessible_entity }
      end
    end
  end


  def show
    @user = User.find(params[:id])
  end


  def edit

  end

  def update

  end

  def destroy

  end


end
