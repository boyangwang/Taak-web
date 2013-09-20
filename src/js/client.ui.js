/** UI Helpers **/

$(document).ready(function(){
	console.log("ready");

	$("#loginPrompt .window").click(function(e) {
		e.stopPropagation();
	});
	$('#loginPrompt').click(hideLoginPrompt);

	$(".addTaskDiv").draggable({
		revert:function(){
			console.log("offset: " + $(this).offset().left);
			//if($(this).offset().left > 220){
			if($(this).offset().left > 64){
				var taskPositionX = $(this).offset().left+20;
				var taskPositionY = $(this).offset().top-30;
				var taskColor = $(this).attr('data-color');
				console.log(taskColor);
				addTask(taskPositionX,taskPositionY,taskColor);
			}
			return true;
		},
		revertDuration:0,
		start:showDragInstructions,
		stop:hideDragInstructions
	}).mousedown(function() {
		showDragInstructions();
	}).mouseup(function() {
		hideDragInstructions();
	});
	UI_init(); // located in client.js
});

function showDragInstructions() {
	$("#dragInstructions").fadeIn(100);
}
function hideDragInstructions() {
	$("#dragInstructions").fadeOut(100);
}

function addTask(x,y,taskColor){
	hideDragInstructions(); // already called earlier
	UI_addTaskPanel(null,x,y,taskColor);
}

function hideLoginPrompt() {
	$('#loginPrompt').fadeOut(300);
}

// Load the entries for first run
function UI_init() {
	$(".workflowView").click(function(e) {
		if (!forceFocus) {
			// Unfocus all children
			$(".task").children(".taskText").blur();
		}
		forceFocus = false;
	});
	
	UI_initDelete(); // configure delete box
	
	showEntries(); // show current entries
	
	// Periodically poll for changes
	window.setInterval(function() {
		sync.performSynchronize(manager, showEntries);
		console.log("Polled");
	}, 10000);
}
// Move caret to end of editable object
function UI_moveCaret(obj) {
	if (document.createRange) {
		var range, selection;
		range = document.createRange();
		range.selectNodeContents(obj);
		range.collapse(false);
		selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}
}
// Scroll to element
function UI_scrollTo(obj) {
	$(".workflowView").animate({
		scrollTop: $(obj).offset().top
	}, 0);
}
// Update an entry
// Target is the element with .taskText class
function UI_updateEntry(target, forced) {
	var target = $(target.get(0)); // get latest element copy
	var left = target.parent().css("left");
	var top = target.parent().css("top");
	var width = target.parent().css("width");
	var height = target.parent().css("height");
	
	if (target.attr("data-taskarchived") == "true") {
		// Deleted entry, do not update
		return;
	}

	var value = target.html();
	var positionCheck = left + "_" + top;
	var dimensionCheck = width + "_" + height;
	if (value != target.attr("data-taskvalue") || positionCheck != target.attr("data-taskposition") || dimensionCheck != target.attr("data-taskdimension") || forced) {
		console.log("Update", target.attr("data-taskid"), target.html(), target.attr("data-taskvalue"), positionCheck, target.attr("data-taskposition"), dimensionCheck, target.attr("data-taskdimension"));
		manager.update(target.attr("data-taskid"), value, left, top, width, height, target.attr("data-taskcolor"));
	}
}
// Add task using entry object
var forceFocus = false;
var lastTask = null;
// Display a task entry
function UI_showTaskPanel(entry) {
	if (!$("#task_" + entry.id).get(0)) {
		// Element not added yet
		UI_addTaskPanel(entry);
	} else {
		// Element exists
		var target = $("#task_" + entry.id);
		//console.log("Show", target);
		
		// Do not update an item that is being edited by the user
		if (!lastTask || lastTask.children(".taskText").get(0) != target.get(0)) {
			target.attr("data-taskvalue", entry.value);
			target.attr("data-taskposition", entry.x + "_" + entry.y);
			target.attr("data-taskdimension", entry.w + "_" + entry.h);
			target.attr("data-taskcolor", entry.color);
			target.parent().addClass("task-" + entry.color);
			target.html(entry.value);
			target.parent().css({
				"left": entry.x,
				"top": entry.y,
				"width": entry.w,
				"height": entry.h
			});
		}
	}
}

/*
function getFreeSpace(){
	var startPointX = 150;
	var startPointY = 50;
	var found = false;
	while(!found){
		console.log($(".task").length);
		if($(".task").length == 0){
			found = true;
		}
		$(".task").each(function(){
			console.log("x: "+startPointX);
			if($(this).offset().left > startPointX || ($(this).offset().left + $(this).width()) < startPointX){
				if($(this).offset().left > (startPointX+250) || ($(this).offset().left + $(this).width()) < (startPointX+250)){
					found = true;
				}
				else{
					startPointX += 250;
				}
			}
			else{
				startPointX += 250;
			}
		});
	}
	baseOffsetX = startPointX;
	baseOffsetY = startPointY;
}
*/
function UI_positionColorSwitcher(target) {
	var selected = $(".selected");
	if (selected.get(0) || target) {
		var helper = $(".colortoolbar");
		helper.css({
			"left": (parseInt(selected.css("left").replace("px","")) + parseInt(selected.css("width").replace("px",""))/2 - parseInt(helper.css("width").replace("px",""))/2)+"px",
			"top": (parseInt(selected.css("top").replace("px","")) + parseInt(selected.css("height").replace("px","")) + 10)+"px"
		});
		helper.fadeIn(200);
	}
}
function UI_hideColorSwitcher() {
	$(".colortoolbar").fadeOut(200);
}
function UI_setColor(obj, event) {
	var obj = $(obj);
	var selected = $(".selected");
	var taskText = selected.children(".taskText");
	taskText.attr("data-taskcolor", obj.attr("data-color"));
	// Remove old color classes
	selected.removeClass (function (index, css) {
		return (css.match (/\btask-\S+/g) || []).join(' ');
	});
	selected.addClass("task-" + obj.attr("data-color"));
	UI_updateEntry(taskText, true);
	if (event) {
		event.stopPropagation();
	}
}

// Create the element
function UI_addTaskPanel(entry,baseOffsetX,baseOffsetY,taskColor) {
	var task = $(document.createElement("div")).attr("class", "task");
	
	// Set up draggable element
	task.draggable({
		stack: ".task", // bring to front on drag
		start: function() {
			$("#deleteTaskIcon").show();
			$("#sidebarView").hide();
			lastTask = $(this)
		},
		stop: function() {
			$("#deleteTaskIcon").hide();
			$("#sidebarView").show();
			UI_updateEntry(task.children(".taskText"));
		},
		containment: ".workflowView", // jquery.ui off-screen scroll is quite buggy
		scroll: false
	}).resizable({
		minHeight:150,
		minWidth:200,
		start: function() {
			UI_hideColorSwitcher();
		},
		stop: function() {
			UI_positionColorSwitcher();
			UI_updateEntry(task.children(".taskText"));
		}
	}).click(function(e){
		if (lastTask && lastTask != $(this)) {
			lastTask.removeClass("selected");
			lastTask.draggable("option", "disabled", false);
			var lastTaskText = lastTask.children(".taskText");
			lastTaskText.removeClass("selected");
			lastTaskText.attr("contenteditable", "false");

			console.log("Child", lastTask.children(".taskText"));
			UI_updateEntry(lastTask.children(".taskText"));
		}
		$(".task").css("z-index","0");
		$(this).css("z-index","1"); // bring to front

		if ($(this).parent().is('.ui-draggable-dragging') ) {
			return;
		}
		// Set select mode
		taskText.attr("contenteditable", "true"); // make content editable
		$(this).draggable("option", "disabled", true ); // dragging must be disabled for edit to be allowed
		$(this).addClass("selected");
		//$(this).children(".taskText").addClass("selected");
		lastTask = $(this);
		UI_positionColorSwitcher(lastTask);
		e.stopPropagation(); // don't send click event to parent
	});

	// Set up additional information
	var infoDiv = $(document.createElement('div')).attr('class','infoDiv');
	var taskUserDiv = $(document.createElement('div')).attr('class','taskUserDiv');
	var taskUserIcon = $(document.createElement('img')).attr('class','taskUserIcon');
	taskUserIcon.attr('src','img/usermini.png');
	var taskUsername = $(document.createElement('div')).attr('class','taskUsername');
	taskUsername.text("user"); // change this is user is logged in and can we can get his username
	taskUserDiv.append(taskUserIcon);
	taskUserDiv.append(taskUsername);
	infoDiv.append(taskUserDiv);
	
	// Set up editable element
	var taskText = $(document.createElement("div")).attr("class", "taskText");
	//taskText.attr("contenteditable","true"); // (DO NOT SET IT HERE.) This attribute will be dynamically set in the tap-to-edit feature
	
	// Called when element loses focus
	taskText.blur(function(){
		UI_hideColorSwitcher();
		taskText.attr("contenteditable", "false"); // Make content uneditable after being deselected (fixes quirks pertaining to content-editable + dragging)
		task.removeClass("selected");
		task.draggable("option", "disabled", false); // re-enable dragging
		//$(this).removeClass("selected");
		UI_updateEntry($(this));
		lastTask = null;
		
		if($(this).text() == ""){ // nothing is written
			UI_deleteTask($(this).parent());
		}
	});

	// Set initial position
	if (!entry) {
		task.css({
			"position": "absolute",
			"top": baseOffsetY,
			"left": baseOffsetX,
			"width": "250px",
			"height": "250px",
		});
	} else {
		task.css({
			"position": "absolute",
			"left": entry.x,
			"top": entry.y,
			"width": entry.w,
			"height": entry.h
		});
	}
	
	// Create new entry if needed
	var newEntry = false;
	if (!entry) {
		entry = manager.add("", true);
		entry.x = task.css("left");
		entry.y = task.css("top");
		entry.w = task.css("width");
		entry.h = task.css("height");
		entry.color = taskColor;
		UI_scrollTo(task); // scroll to new entry
		newEntry = true;
	}
	
	// Set attributes
	taskText.attr("id", "task_" + entry.id);
	taskText.attr("data-taskid", entry.id);
	taskText.attr("data-taskvalue", entry.value);
	taskText.attr("data-taskposition", entry.x + "_" + entry.y);
	taskText.attr("data-taskdimension", entry.w + "_" + entry.h);
	taskText.attr("data-taskcolor", entry.color);
	taskText.html(entry.value);
	
	task.addClass("task-" + entry.color); // Set task color
	console.log("Color", entry.color);
	
	// Quick submit
	taskText.get(0).addEventListener("keydown", function(event) {
		submit(event);
	});
	
	// Insert elements
	task.append(taskText);
	task.append(infoDiv);
	$(".workflowView").append(task);
	
	// Special treatment for new entries
	if (newEntry) {
		// Give focus
		task.trigger("click"); // perform prerequisites before giving focus
		forceFocus = true;
		taskText.addClass("selected");
		taskText.focus();
	}
	
	// Perform update after element has been added (performed last to prevent race condition)
	if (newEntry) {
		manager.onupdate();
	}

	return taskText;
}
// Initialize deletion box
function UI_initDelete() {
	$("#deleteTaskIcon").droppable({
		tolerance: "touch",
		hoverClass: "active",
		drop: function( event, ui ) {
			$("#deleteTaskIcon").hide();
			$("#sidebarView").show();
			UI_deleteTask(ui.draggable);
			//console.log("Drop", ui.draggable.children(".taskText").attr("data-taskid"));
		}
	});
	$("#deleteTaskContainer").droppable();
}
// Delete task
function UI_deleteTask(target) {
	// Target is the element with ".task" class
	var taskID = target.children(".taskText").attr("data-taskid");
	target.children(".taskText").attr("data-taskarchived", "true")
	//target.hide();
	//target.remove(); // temp (cannot do this at the moment because references may still be present in concurrently running operations)
	
	// Animate hide
	target.animate({'opacity' : 0}, { queue: false, duration: 300 }).hide("scale",{origin:["middle","left"]}, 300);
	
	manager.remove(taskID);
}

/** Fixes for mobile Safari scrolling **/
$(document).on('touchmove',function(e){
	e.preventDefault();
});
$('body').on('touchstart','.scrollable',function(e) {
	if (e.currentTarget.scrollTop === 0) {
		e.currentTarget.scrollTop = 1;
	} else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
		e.currentTarget.scrollTop -= 1;
	}
});
$('body').on('touchmove','.scrollable',function(e) {
	var anySelected = $(".selected").get(0);
	if (anySelected) {
		// User selected an object, don't allow panning in the page (makes it easier for resize)
		e.preventDefault();
	} else {
		e.stopPropagation();
	}
});
