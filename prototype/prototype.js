var mode = "view"; //view || edit

$(document).ready(function(){
	$("#addButton").click(function(){
		addTask();
	});
});

function addTask(){
	var task = $(document.createElement('div')).attr('class','task');
	var taskText = $(document.createElement('div')).attr('class','taskText');
	taskText.attr('contenteditable','true');
	task.append(taskText);
	task.focusout(function(){
		if($($(this).children()[0]).text().length == 0){
			$(this).remove();
		}
		$($(this).children()[0]).attr('contenteditable','false');
	});
	$("#content").prepend(task);
	$(task.get(0)).children()[0].focus();
}