$(function(){
    timer_counter = 0;
    runningTaskId = 0;
    runningTaskData = null;
    break_phrase = "you're on break from:";
    work_phrase = "you're working on :";
    no_task_phrase = "you haven't got any running tasks"
    height = 0;

  // if(window.isRunningTask==true){
  //   window.onbeforeunload = function(){
  //     return 'Are you sure you want to leave?';
  //   };
  // }


  function getRunningTask(){ 
        $.ajax({
          url:"/running",
          success: function(responseData){
            runningTaskData = responseData;
            $("#default-sidebar").hide();
            if(responseData) renderRunningTask(responseData)
          },
        error: function(){
          alert("couldn't retrieve running task, please try again")
        }
        })
    }

    getRunningTask(); // if there's a task that was running when user last left the page it will be displayed


    // CANVAS CLOCK
    var cx = 75;
    var cy  =75;

    function toRadians(deg) {
        return deg * Math.PI / 180
    }

  function draw_arc(begin, end, color){
    console.log(begin, end, color)
    canvas= document.getElementById("mycanvas")
    ctx = canvas.getContext("2d")
    //ctx.clearRect(0,0,500,500);
    ctx.strokeStyle = "#004DF7"
    ctx.beginPath();
    ctx.arc(cx, cy, 50, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = color
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    
    ctx.arc(cx,cy,50, toRadians(begin), toRadians(end));
    ctx.lineTo(cx,cy);
    ctx.closePath();
    ctx.fill();
  }



  function new_table_row(element, data, resume){
    //console.log(document.getElementById("mycanvas"))
    link = resume==true ? "<a data-id='"+data.id+"' class='resume-btn' href='#'>RESUME</a>" : "<a data-id='"+data.id+"' class='start-btn' href='#'>START</a>"
    if(data.completed==true) link= ""
    $(element).prepend("<tr id='task_" + data.id +"'><td>"+data.title+"</td><td></td><td>"+link+"</td><td><a href='/tasks/"+data.id+"' data-confirm='Are you sure?' data-method='delete' rel='nofollow'>DELETE</a></td></tr>" );
    
    $(".start-btn, .resume-btn").bind("click", function(event){
      id = $(this).data("id")
      $(this).parent().parent().remove()
      stopTimer();
      startTask(id);
    })
  }

  function new_table_cell(element, data) {
    $(element).text(data);
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
        $("#task_title").val("")
        if(startNow){
            getRunningTask()
        }else{
            new_table_row("#start_tasks", responseData)
        }
        
      }
    })

  });


  function getTodos(){
    $.ajax({
      url: "/tasks.json",
      success: function(data){

        $.each(data.resume, function(index, task){
          new_table_row("#resume_tasks", task, true);
        });

        $.each(data.start, function(index, task){
          new_table_row("#start_tasks", task);
        });

        $.each(data.done_today, function(index, task){
          new_table_row("#done_tasks", task);
        });
      }

    });
  }
  getTodos();

  

  function getTotals(){
    $.ajax({
      url: "/tasks.json",
      success: function(data){
        var todaysBreaks = convertMilliseconds(data.todays_breaks_duration);
        var todaysWork = convertMilliseconds(data.todays_work_duration);

        new_table_cell("#todays_work", todaysWork);
        new_table_cell("#todays_breaks", todaysBreaks);
      }
    });
  }
  getTotals();

    function convertMilliseconds(timer_counter){
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
      return (minutes+":"+seconds)
    }

    runTimer = function(elapsed_time, intervalState){
      stopTimer()
      timer_counter += elapsed_time;

      window.timerInterval = setInterval(function(){
        timer_counter++;
        minutes = 0,
        seconds = 0;

        convertMilliseconds(timer_counter);
        // if (timer_counter> 59){
        //   minutes = parseInt(timer_counter / 60)
        //   if(minutes< 10) minutes = "0"+ minutes
        //   seconds = timer_counter- (minutes * 60);
        //   if(seconds< 10) seconds = "0"+ seconds
        // }
        // else{
        //   minutes = "00"
        //   seconds = timer_counter;
        //   if(seconds< 10) seconds = "0"+ seconds
        // }

        percentage = (100/3600)* timer_counter
        degrees = (360 * (percentage/100)) - 90;
        draw_arc(270, degrees, "#004DF7")
        $("#running_task_timer").text(minutes+" : "+seconds)

         if(intervalState == "work" && timer_counter>=(60*25)){
            stopWorkResponse = confirm("would you like to take a break now? (click cancel to continue working)")
            if(stopWorkResponse == true) {
              takeBreak();
            } else {
              work();
            }
          }
          else if(intervalState == "break" && timer_counter>=(60*5)){
            console.log("5min")
            stopBreakResponse = confirm("5 min are up, back to work?")
            if(stopBreakResponse == true) {
            work();
            } else {
              takeBreak();
            }
          }

      }, 1000)

    
      
    }; //runTimer


    startTask = function(id){
      $.ajax({
        url: "tasks/"+id+ "/work",
        success: function(responseData){
          stopTimer();
          runningTaskData = responseData;
         if( responseData && responseData.interval_state == 'work') {
          renderRunningTask(responseData);
         }

         },
         error: function(){
          alert("couldn't switch to work mode, please try again!")}
        });
    }

    stopTimer = function(){
      clearInterval(window.timerInterval)
      timer_counter = 0;
      
    }

    completeTask = function(){
      $.ajax({
        url:"/tasks/"+runningTaskId+"/complete",
        success: function(responseData){
          $("#right-sidebar").html("");
          $("#status").text(no_task_phrase);
          $("#task_" + runningTaskId).remove();
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

    takeBreak = function(task_id){
      id = task_id || runningTaskId;
      $.ajax({
        url:"/tasks/"+runningTaskId+"/break",
        success: function(responseData){
          console.log("on break")
          
          renderRunningTask(responseData);

          $("#status").text(break_phrase);
          $("#take_break").replaceWith("<a id='resume_task' href='#'>WORK</a>" )

          //stopTimer();

          //runTimer(0, responseData.interval_state);

          $("#resume_task").on("click", function(){
            stopTimer();
            work();
          }); // this is a repeat of this listener

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
          $("#status").text(no_task_phrase);
          //$("#default-sidebar").show()//show defualt view div inside $("#right-sidebar").html()
        
        },
        error: function(){
          alert("something went wrong, please try again")
        }
      })
    }
    function moveBackToList(){
      new_table_row("#resume_tasks",runningTaskData, true)
      //console.log("runningTaskId", runningTaskId, runningTaskData)
    }


    

    renderRunningTask = function(task){
      status_phrase = task.last_interval_state== "break" ? break_phrase : work_phrase;
      break_or_work_link = task.last_interval_state== "break" ? "<a id='resume_task' href='#'>WORK</a>" : "<a id='take_break' href='#'>BREAK</a>";
      runningTaskId = task.id;
      $("#status").text(status_phrase);
      $("#right-sidebar").html(
        "<p>"+task.title+"</p>"+
        '<canvas id="mycanvas" width=150 height=150 ></canvas>'+
        "<h3 id='running_task_timer'></h3>"+
            "<a id='complete_running_task' href='#'>COMPLETE</a>"+" | "+
            break_or_work_link+" | "+
            "<a id='stop-timer' href='#'>STOP</a>");
      
      console.log("elapsed_time");
      console.log(task.elapsed_time);
      runTimer(task.elapsed_time, task.last_interval_state);

      $("#complete_running_task").on("click", function(event){
        completeTask();
        displayActivity()
        getTotal();
      });

      $("#take_break").on("click", function(){
        takeBreak(runningTaskId);
        displayActivity()
        getTotals();
      });

      $("#resume_task").on("click", function(){
        stopTimer();
        work(runningTaskId);
        displayActivity()
        getTotals();
      });

      $("#stop-timer").on("click", function(){
        stopTimer();
        moveBackToList();
        stopLastInterval();
        displayActivity()
        getTotals();
      });
    }

      
    function displayActivity(){
      $.ajax({
        url: "/activity",
        success: function(responseData){
          $("#bar").html("");
          $.each(responseData, function(index, item){
            var start_at = new Date(item.start_time),
                  stop_at = item.stop_time ? new Date(item.stop_time) : new Date(),
                  height = (stop_at - start_at)/(38000),
                  element = $("<li style='height:"+ height +"px'></li>");

            element.addClass(item.state);
            $("#bar").prepend(element);
          });

        },
        error: function(){
          alert("something went wrong, cannot display progress bar")
        }
      })
    }
    
    // if(window.isRunningTask) {
    var intervalActivity = window.setInterval(displayActivity(), 1000) 
    // }else{
    //   displayActivity();
    // }



  
});

