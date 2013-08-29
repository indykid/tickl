class CreateIntervals < ActiveRecord::Migration
  def change
    create_table :intervals do |t|
      t.datetime :start_time
      t.string :state
      t.datetime :stop_time
      t.references :task

      t.timestamps
    end
    add_index :intervals, :task_id
  end
end
