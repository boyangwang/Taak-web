$(document).ready(function(){
	console.log("ready");

	// @boyang
	$("#loginPrompt .window").click(function(e) {
		e.stopPropagation();
	});
	$('#loginPrompt').click(hideLoginPrompt);

	$(".addTaskDiv").draggable({
		revert:function(){
			console.log("offset: " + $(this).offset().left);
			if($(this).offset().left > 220){
				var taskPositionX = $(this).offset().left+20;
				var taskPositionY = $(this).offset().top-30;
				var taskColor = $(this).attr('data-color');
				console.log(taskColor);
				addTask(taskPositionX,taskPositionY,taskColor);
			}
			return true;
		},
		revertDuration:0
	});
	UI_init(); // located in client.js
});

function showDragInstructions() {
	$("#dragInstructions").fadeIn(300);
}
function hideDragInstructions() {
	$("#dragInstructions").fadeOut(300);
}

function addTask(x,y,taskColor){
	hideDragInstructions(); // already called earlier
	UI_addTaskPanel(null,x,y,taskColor);
}

function hideLoginPrompt() {
	$('#loginPrompt').fadeOut(300);
}