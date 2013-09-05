$(function(){
    timer_counter = 0;
    runningTaskId = 0;
    runningTaskData = null;
    break_phrase = "you're on break from:";
    work_phrase = "you're working on :";
  // if(window.isRunningTask==true){
  //   window.onbeforeunload = function(){
  //     return 'Are you sure you want to leave?';
  //   };
  // }


  function new_table_row(container, data, resume){

    link = resume==true ? "<a data-id='"+data.id+"' class='resume-btn' href='#'>RESUME</a>" : "<a data-id='"+data.id+"' class='start-btn' href='#'>START</a>"
    if(data.completed==true) link= ""
    $(container).prepend("<tr><td>"+data.title+"</td><td>0</td><td>"+link+"</td><td><a href='/tasks/"+data.id+"' data-confirm='Are you sure?' data-method='delete' rel='nofollow'>DELETE</a></td></tr>" );
    


    $(".start-btn, .resume-btn").bind("click", function(event){
      id = $(this).data("id")
      $(this).parent().parent().remove()
      stopTimer();
      startTask(id);
    })
  }


  $("#new_task").on("submit", function(event){
    event.preventDefault();
    var taskTitle = $("#task_title").val();
    startNow = $("#start_now").is(':checked') ? 1 : 0;
    $.ajax({
      method: "post",
      url: "/tasks.json",
      data: {task:{start_now: startNow, title: taskTitle}},
      success: function(responseData){
        console.log(startNow)
        if(startNow){
            $("#task_title").val("")
            getRunningTask()
            
        }else{
            new_table_row("#start_tasks", responseData)
        }
        
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
      stopTimer()
      timer_counter += elapsed_time;

      window.interval = setInterval(function(){
        timer_counter++;
        console.log("tick")
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
            work();
          }
      }
      else if(state == "break" && timer_counter==(60*5)){
        stopBreakResponse = confirm("5 min are up, back to work?")
          if(stopBreakResponse == true) {
            work();
          } else {
              takeBreak();
          }
      }
      
    }; //runTimer


    startTask = function(id){
      $.ajax({
        url: "tasks/"+id+ "/work",
        success: function(responseData){
          stopTimer()
          runningTaskData = responseData;
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
          new_table_row("#done_tasks", responseData);
          stopTimer();
        },
        error: function(){
          alert("something went wrong, please try again")
        }
      })
    } //completeTask

    work = function(task_id){
      id = task_id || runningTaskId;
      console.log(id)
      $.ajax({
        url:"/tasks/"+id+"/work",
        success: function(responseData){
          console.log("in work")
          $("#status").text(work_phrase);
          stopTimer();
          getRunningTask()
        },
        error: function(){
          alert("something went wrong, please try again")
        } 
      })
    } //work

    takeBreak = function(){
      $.ajax({
        url:"/tasks/"+runningTaskId+"/break",
        success: function(responseData){
          $("#status").text(break_phrase);
          $("#take_break").replaceWith("<a id='resume_task' href='#'>WORK</a>" )
          $("#resume_task").on("click", function(){
            stopTimer();
            work();
          });
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
          $("#right-sidebar").html("");
          $("#default-sidebar").show()//show defualt view div inside $("#right-sidebar").html()
        
        },
        error: function(){
          alert("something went wrong, please try again")
        }
      })
    }
    function moveBackToList(){
      new_table_row("#resume_tasks",runningTaskData, true)
      console.log("unningTaskId", runningTaskId, runningTaskData)
    }
    

    renderRunningTask = function(task){
      info_phrase = task.last_interval_state== "break" ? break_phrase : work_phrase;
      break_resume_link = task.last_interval_state== "break" ? "<a id='resume_task' href='#'>WORK</a>" : "<a id='take_break' href='#'>BREAK</a>";
      runningTaskId = task.id;
      $("#right-sidebar").html(
        "<h4 id='status'>"+info_phrase+"</h4>"+
        "<p>"+task.title+"</p>"+
        "<h3 id='running_task_timer'></h3>"+
            "<a id='complete_running_task' href='#'>COMPLETE</a>"+" | "+
            break_resume_link+" | "+
            "<a id='stop-timer' href='#'>STOP</a>");
      runTimer(task.elapsed_time, task.last_interval_state);

      $("#complete_running_task").on("click", function(event){
        completeTask();
      });

      $("#take_break").on("click", function(){
        takeBreak();
      });

      $("#resume_task").on("click", function(){
        stopTimer();
        work();
      });

      $("#stop-timer").on("click", function(){
        stopTimer();
        moveBackToList();
        stopLastInterval();
      });

    }

      
    function getRunningTask(){ 
        $.ajax({
          url:"/running",
          success:
          function(responseData){
            //console.log(responseData)
            runningTaskData = responseData;
            $("#default-sidebar").hide();
            if(responseData) renderRunningTask(responseData)
          }
        })
    }
    getRunningTask()


    // CANVAS CLOCK
    var cx = 200;
    var cy  =200;

    function toRadians(deg) {
        return deg * Math.PI / 180
    }


  function draw_arc(begin, end, color){

    canvas= document.getElementById("mycanvas")
    ctx = canvas.getContext("2d")
    //ctx.clearRect(0,0,500,500);

    ctx.fillStyle = color

    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,50,toRadians(begin),toRadians(end));
    ctx.lineTo(cx,cy);
    ctx.closePath();
    ctx.fill();
  }
  draw_arc(270, 360, "red")
  draw_arc(360, 50, "green")
  draw_arc(50, 150, "red")
});

