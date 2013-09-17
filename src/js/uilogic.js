$(document).ready(function(){
	console.log("ready");
	/*
	$("#addTaskIcon").mousedown(function(){
		addTask();
	});
*/
$("#addTaskIconYellow").mousedown(function(){
	$("#dragInstructions").show();
}).mouseup(function(){
	$("#dragInstructions").hide();
});
$("#addTaskIconRed").mousedown(function(){
	$("#dragInstructions").show();
}).mouseup(function(){
	$("#dragInstructions").hide();
});
$("#addTaskIconBlue").mousedown(function(){
	$("#dragInstructions").show();
}).mouseup(function(){
	$("#dragInstructions").hide();
});

$("#addTaskIconYellow").draggable({
	stop:function(){
		$("#dragInstructions").hide();
		if($(this).offset().left > 100){
			var taskPositionX = $(this).offset().left+20;
			var taskPositionY = $(this).offset().top;
			$(this).css({
				"left":"50%",
				"top":"50px"
			});
			addTask(taskPositionX,taskPositionY,"yellow");
		}
		else{
			$(this).css({
				"left":"50%",
				"top":"50px"
			});
		}
	}
});
$("#addTaskIconRed").draggable({
	stop:function(){
		$("#dragInstructions").hide();
		if($(this).offset().left > 100){
			var taskPositionX = $(this).offset().left+20;
			var taskPositionY = $(this).offset().top;
			$(this).css({
				"left":"50%",
				"top":"150px"
			});
			addTask(taskPositionX,taskPositionY,"red");
		}
		else{
			$(this).css({
				"left":"50%",
				"top":"150px"
			});
		}
	}
});
$("#addTaskIconBlue").draggable({
	stop:function(){
		$("#dragInstructions").hide();
		if($(this).offset().left > 100){
			var taskPositionX = $(this).offset().left+20;
			var taskPositionY = $(this).offset().top;
			$(this).css({
				"left":"50%",
				"top":"250px"
			});
			addTask(taskPositionX,taskPositionY,"blue");
		}
		else{
			$(this).css({
				"left":"50%",
				"top":"250px"
			});
		}
	}
});
	UI_init(); // located in client.js
});

function addTask(x,y,taskColor){
	$("#dragInstructions").hide();
	UI_addTaskPanel(null,x,y,taskColor);
}