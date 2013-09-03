$(function(){
  // if(window.isRunningTask==true){
  //   window.onbeforeunload = function(){
  //     return 'Are you sure you want to leave?';
  //   };
  // }


  function new_table_row(container, data, resume){
    //link = resume //STOPPED HERE
    $(container).prepend("<tr><td>"+data.title+"</td><td>0</td><td><a href='/tasks/"+data.id+"/start'>START</a></td><td><a href='/tasks/"+data.id+"' data-confirm='Are you sure?' data-method='delete' rel='nofollow'>DELETE</a></td></tr>" );
  }


  $("#new_task").on("submit", function(event){
    event.preventDefault();
    var taskTitle = $("#task_title").val();
    var startNow = $("#start_now").attr('checked') ? 1 : 0;

    $.ajax({
      method: "post",
      url: "/tasks.json",
      data: {task:{start_now: startNow, title: taskTitle}},
      success: function(response_data){
        new_table_row("#tasks_table", response_data)
      }
    })

  });

  // $.ajax({
  //   url: "/tasks.json",
  //   success: function(data){
  //     $.each(data.resume, function(index, task){
  //       new_table_row("#resume_tasks", task);
  //     })

  //     $.each(data.start, function(index, task){
  //       new_table_row("#start_tasks", task);
  //     })
      
  //   }
  // })
    
    $.ajax({
      url:"/tasks/running",
      success: function(data){
        console.log(data)
      }
    })
});

