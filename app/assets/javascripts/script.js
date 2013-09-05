$(function(){
    timer_counter = 0;
    runningTaskId = 0;
    break_phrase = "you're on break from:";
    work_phrase = "you're working on :";
  // if(window.isRunningTask==true){
  //   window.onbeforeunload = function(){
  //     return 'Are you sure you want to leave?';
  //   };
  // }


  function new_table_row(container, data, resume){
    link = resume==true ? "RESUME" : "START"
    $(container).prepend("<tr><td>"+data.title+"</td><td>0</td><td><a class='start-btn' href='/tasks/"+data.id+"/start'>"+link+"</a></td><td><a href='/tasks/"+data.id+"' data-confirm='Are you sure?' data-method='delete' rel='nofollow'>DELETE</a></td></tr>" );
  }


  $("#new_task").on("submit", function(event){
    event.preventDefault();
    var taskTitle = $("#task_title").val();
    var startNow = $("#start_now").attr('checked') ? 1 : 0;

    $.ajax({
      method: "post",
      url: "/tasks.json",
      data: {task:{start_now: startNow, title: taskTitle}},
      success: function(responseData){
        new_table_row("#tasks_table", responseData)
      }
    })

  });
3
  $.ajax({
    url: "/tasks.json",
    success: function(data){
      $.each(data.resume, function(index, task){
        new_table_row("#resume_tasks", task, true);
      })

      $.each(data.start, function(index, task){
        new_table_row("#start_tasks", task);
      })

      $.each(data.done_today, function(index, task){
        new_table_row("#done_tasks", task);
      })
      
    }
  })
    runTimer = function(elapsed_time, state){
      timer_counter += elapsed_time;

      window.interval = setInterval(function(){
        timer_counter++;
        minutes = 0,
        seconds = 0;
        if (timer_counter> 59){
          minutes = parseInt(timer_counter / 60)
          if(minutes< 10) minutes = "0"+ minutes
          seconds = timer_counter- (minutes * 60);
          if(seconds< 10) seconds = "0"+ seconds
        }
        else{
          minutes = "00"
          seconds = timer_counter;
          if(seconds< 10) seconds = "0"+ seconds
        }

        $("#running_task_timer").text(minutes+" : "+seconds)
      }, 1000)

      if(state == "work" && timer_counter>=(60*25)){
        stopWorkResponse = confirm("would you like to take a break now? (click cancel to continue working)")
         if(stopWorkResponse == true) {
            takeBreak();
          } else {
            startNewWorkInterval();
          }
      }
      else if(state == "break" && timer_counter==(60*5)){
        stopBreakResponse = confirm("5 min are up, back to work?")
          if(stopBreakResponse == true) {
            startNewWorkInterval();
          } else {
              takeBreak();
          }
      }
      
    }; //runTimer


    startTask = function(url){
      $.ajax({
        url: url,
        success: function(responseData){
         if( responseData && responseData.new_interval_state == 'work') {
          renderRunningTask(responseData);
         }

         }
        });
    }

    
    
    

    stopTimer = function(){
      clearInterval(window.interval)
      timer_counter = 0;
      
    }

    completeTask = function(){
      $.ajax({
        url:"/tasks/"+runningTaskId+"/complete",
        success: function(responseData){
          $("#right-sidebar").html("");
          stopTimer();
        },
        error: function(){
          alert("something went wrong, please try again")
        }
      })
    } //completeTask

    startNewWorkInterval = function(){
      $.ajax({
        url:"/tasks/"+runningTaskId+"/start",
        success: function(responseData){
          console.log("in startNewWorkInterval")
          $("#status").text(work_phrase);
          stopTimer();
          runTimer(0, responseData.new_interval_state)
        },
        error: function(){
          alert("something went wrong, please try again")
        } 
      })
    } //startNewWorkInterval

    takeBreak = function(){
      $.ajax({
        url:"/tasks/"+runningTaskId+"/break",
        success: function(responseData){
          $("#status").text(break_phrase);
          stopTimer();
          runTimer(0, responseData.new_interval_state);
        },
        error: function(){
          alert("something went wrong, please try again")
        } 
      })
    } //takeBreak

    

    stopLastInterval = function(){
      $.ajax({
        url:"/tasks/"+runningTaskId+"/stop",
        success: function(){

          stopTimer();
          $("#default-sidebar").show()//show defualt view div inside $("#right-sidebar").html()
        
        },
        error: function(){
          alert("something went wrong, please try again")
        }
      })
    }

    

    renderRunningTask = function(task){
      console.log(task)
      info_phrase = task.last_interval_state== "break" ? break_phrase : work_phrase;
      break_resume_link = task.last_interval_state== "break" ? "<a id='resume_task' href='#'>RESUME</a>" : "<a id='take_break' href='#'>BREAK</a>";
      runningTaskId = task.id
      $("#right-sidebar").html(
        "<h4 id='status'>"+info_phrase+"</h4>"+
        "<p>"+task.title+"</p>"+
        "<h3 id='running_task_timer'></h3>"+
            "<a id='complete_running_task' ' href='#'>COMPLETE</a>"+" | "+
            break_resume_link+" | "+
            "<a id='stop-timer' href='#'>STOP</a>");
      runTimer(task.elapsed_time, task.last_interval_state);

      $("#complete_running_task").on("click", function(event){
        event.preventDefault();
        completeTask();
      });

      $("#take_break").on("click", function(){
        takeBreak();
      });

      $("#stop-timer").on("click", function(){
        stopLastInterval();
      });

      $("resume_task").on("click", function(){
        startNewWorkInterval();
      })

      $(".start-btn").on("click", function(event){
        event.preventDefault();
        startTask(event.target.href);
      })
    }

    $.ajax({
      url:"/running",
      success:
      function(responseData){
        //console.log(responseData)
        $("#default-sidebar").hide();
        if(responseData) renderRunningTask(responseData)
      }
    })

    
});

