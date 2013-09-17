$(document).ready(function(){
	console.log("ready");
	$("#addTaskIcon").click(function(){
		addTask();
	});
	UI_init(); // located in client.js
});

function addTask(){
/*
	var task = $(document.createElement('div')).attr('class','task');
	task.draggable().resizable({
		minHeight:80,minWidth:80
	}
		);
	var taskText = $(document.createElement('div')).attr('class','taskText');
	taskText.attr('contenteditable','true');
	task.append(taskText);
	$(".workflowView").append(task);
	$(task.get(0)).children().each(function(){
		if($(this).attr('class') == "taskText"){
			$(this).focus();
		}
	});
	*/
	UI_addTaskPanel();
}