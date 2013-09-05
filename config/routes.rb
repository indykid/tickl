Tickle::Application.routes.draw do

  root to: "tasks#index"

  resources :sessions, only: [ :new, :create ] do
    collection do
      delete :destroy
    end
  end
  resources :users
  resources :tasks
  
  get "login", to: "sessions#new"
  get "running", to: "tasks#running", as: "running"
  get "tasks/:id/complete", to: "tasks#complete", as: "complete"
  get "tasks/:id/break", to: "tasks#take_break", as: "break"
  get "tasks/:id/stop", to: "tasks#stop_timer", as: "stop"
  get "tasks/:id/resume", to: "tasks#do_work", as: "resume"
  get "tasks/:id/work", to: "tasks#do_work", as: "work"

  get "tasks/:id/current", to: "tasks#current", as: "current"



  
  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
