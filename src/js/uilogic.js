$(document).ready(function(){
	console.log("ready");
	/*
	$("#addTaskIcon").mousedown(function(){
		addTask();
	});
	*/
	$("#addTaskIcon").draggable({
		stop:function(){
			if($(this).offset().left > 100){
				var taskPositionX = $(this).offset().left+20;
				var taskPositionY = $(this).offset().top;
				$(this).css({
					"left":"50%",
					"top":"50px"
				});
				addTask(taskPositionX,taskPositionY);
			}
			else{
				$(this).css({
					"left":"50%",
					"top":"50px"
				});
			}
		}
	});
	UI_init(); // located in client.js
});

function addTask(x,y){
	UI_addTaskPanel(null,x,y);
}