/** UI Helpers **/

$(document).ready(function(){
	console.log("ready");

	$("#workflowSelectorIcon").click(function(){
		$("#workflowSelectorBox").toggle();
	});

	$("#addWorkflowIcon").click(function(){
		$("#workflowTable").append("<tr class='workflowName' contenteditable><td>&nbsp;</td></tr>");
		$(".workflowName").last().get(0).focus();
		$(".workflowName").last().focusout(function(){
			$(this).attr("contenteditable","false");
			bindWorkflows();
		});
	});

	bindWorkflows();

	$("#loginPrompt .window").click(function(e) {
		e.stopPropagation();
	});
	$('#loginPrompt').click(hideLoginPrompt);

	$(".addTaskDiv").draggable({
		revert: function(){
			if($(this).offset().left > 64){
				var taskPositionX = $(this).offset().left+20;
				var taskPositionY = $(this).offset().top-30;
				var taskColor = $(this).attr('data-color');
				addTask(taskPositionX,taskPositionY,taskColor);
			}
			return true;
		},
		revertDuration:0,
		start: showDragInstructions,
		stop: hideDragInstructions
	}).mousedown(function() {
		showDragInstructions();
	}).mouseup(function() {
		hideDragInstructions();
	});
	
	UI_init(); // located in client.js
});

function bindWorkflows(){
	$(".workflowName").unbind() // in case anything has been bound before
	$(".workflowName").click(function(){
		$(".workflowName").removeClass("selectedworkflow");
		$(this).addClass("selectedworkflow");
		console.log($(this).text());
		var currentWorkflow = $(this).text();
		$("#workflowSelectorIcon").text(currentWorkflow);
		$("#workflowSelectorBox").hide();
		$(".task").hide();
		$(".task").each(function(){
			if($(this).attr("data-workflow") == currentWorkflow){
				$(this).show();
			}
		});
	});
}

// Show/hide drag instructions
function showDragInstructions() {
	$("#dragInstructions").fadeIn(100);
}
function hideDragInstructions() {
	$("#dragInstructions").fadeOut(100);
}

// Called when adding a task
function addTask(x, y, taskColor){
	hideDragInstructions(); // already called earlier
	UI_addTaskPanel(null,x,y,taskColor);
}

// Hide login
function hideLoginPrompt() {
	$('#loginPrompt').fadeOut(300);
}

// Update UI for iOS after keyboard closed
function UI_resize() {
	// Force iOS to update heights after keyboard close
	$(".ios7fixer").css({position:'absolute'});
	$(window).scrollTop(0);
	// Use fixed position to constrain UI to correct place
	$(".ios7fixer").css({position:'fixed'});
}

// Load the entries for first run
function UI_init() {
	$(".workflowView").click(function(e) {
		if (!forceFocus) {
			// Unfocus children
			UI_hideColorSwitcher();
			//$(".selected").children(".taskText").blur();
			UI_unselect(lastTask, true);
		}
		forceFocus = false;
		$("#workflowSelectorBox").hide();
	});
	
	UI_initDelete(); // configure delete box
	
	showEntries(); // show current entries
	
	// Periodically poll for changes
	window.setInterval(function() {
		sync.performSynchronize(manager, showEntries);
		console.log("Polled");
	}, 10000);
}
// Unselect the task
function UI_unselect(task, doBlur) {
	if (task != null) {
		var taskText = task.children(".taskText");

		taskText.attr("contenteditable", "false"); // Make content uneditable after being deselected (fixes quirks pertaining to content-editable + dragging)
		task.removeClass("selected");
		task.draggable("option", "disabled", false); // re-enable dragging
		UI_updateEntry(taskText);
		UI_resize();
		lastTask = null;
		
		if(taskText.text() == ""){ // nothing is written
			UI_hideColorSwitcher();
			UI_deleteTask(taskText.parent());
		}

		if (doBlur == true) {
			hideKeyboard();
		}
	}
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
	if (!target.attr("data-taskid")) {
		console.log("Warning", "An undefined entry was flagged for updating");
		return;
	}
	
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
var selectedTask = null;
// Display a task entry
function UI_showTaskPanel(entry) {
	if (!entry) { // null entry
		return;
	}
	if (!$("#task_" + entry.id).get(0)) {
		// Element not added yet
		UI_addTaskPanel(entry);
	} else {
		// Element exists
		var target = $("#task_" + entry.id);
		// Do not update an item that is being edited by the user
		if (!lastTask || lastTask.children(".taskText").get(0) != target.get(0)) {
			UI_setTaskPanel(entry, target.parent(), target);
		}
	}
}

// Sets visual information for the panel
function UI_setTaskPanel(entry, task, taskText) {
	taskText.attr("data-taskvalue", entry.value);
	taskText.attr("data-taskposition", entry.x + "_" + entry.y);
	taskText.attr("data-taskdimension", entry.w + "_" + entry.h);
	taskText.attr("data-taskcolor", entry.color);
	taskText.html(entry.value);
	task.addClass("task-" + entry.color);
	task.css({
		"left": entry.x,
		"top": entry.y,
		"width": entry.w,
		"height": entry.h
	});
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
// Convert "#px" to "#" and return as an integer
function UI_getInt(pixel) {
	return parseInt(pixel.replace("px", ""));
}
// Show color toolbar
function UI_showColorSwitcher(target) {
	var selected = $(".selected");
	if (target) {
		selected = target;
	}
	if (selected.get(0)) {
		var helper = $(".colortoolbar");
		helper.css({
			"left": (UI_getInt(selected.css("left")) + UI_getInt(selected.css("width"))/2 - UI_getInt(helper.css("width"))/2) + "px",
			"top": (UI_getInt(selected.css("top")) + UI_getInt(selected.css("height")) + 10) + "px"
		});
		helper.fadeIn(200);
	}
}
// Hide color toolbar
function UI_hideColorSwitcher() {
	$(".colortoolbar").fadeOut(200);
}
// Set the color
function UI_setColor(obj, event) {
	var obj = $(obj);
	//var selected = $(".selected");
	var task = selectedTask;
	var taskText = task.children(".taskText");
	taskText.attr("data-taskcolor", obj.attr("data-color"));
	task.removeClass (function (index, css) {
		return (css.match (/\btask-\S+/g) || []).join(" ");
	});
	task.addClass("task-" + obj.attr("data-color"));
	UI_updateEntry(taskText, true);
	if (event) {
		event.stopPropagation();
	}
}
// Create the element
function UI_addTaskPanel(entry,baseOffsetX,baseOffsetY,taskColor) {
	var task = $(document.createElement("div")).attr("class", "task");
	var taskText = $(document.createElement("div")).attr("class", "taskText");
	
	// associate the task with the workflow
	task.attr("data-workflow", $("#workflowSelectorIcon").text());
	
	// Set up draggable element
	task.draggable({
		stack: ".task", // bring to front on drag
		start: function() {
			$("#deleteTaskIcon").show();
			$("#sidebarView").hide();
			UI_hideColorSwitcher();
			UI_unselect(lastTask, true);
			
			lastTask = $(this);
		},
		stop: function() {
			$("#deleteTaskIcon").hide();
			$("#sidebarView").show();
			UI_updateEntry(task.children(".taskText"));
			if (!$(".selected").get(0)) {
				lastTask = null;
			}
		},
		containment: ".workflowView", // jquery.ui off-screen scroll is quite buggy
		scroll: false
	}).resizable({
		minHeight: 150,
		minWidth: 200,
		start: function() {
			UI_hideColorSwitcher();
		},
		stop: function() {
			UI_showColorSwitcher();
			UI_updateEntry(task.children(".taskText"));
		}
	}).click(function(e){
		if (lastTask != null && lastTask.get(0) != $(this).get(0)) {
			// Unselect last task
			UI_unselect(lastTask, true);
		}
		
		// Bring active task to front
		$(".task").css("z-index", "0");
		$(this).css("z-index", "1"); 

		if ($(this).parent().is('.ui-draggable-dragging') ) {
			// Stop here if dragging
			return;
		}
		
		// Set select mode
		taskText.attr("contenteditable", "true"); // make content editable
		task.draggable("option", "disabled", true ); // dragging must be disabled for edit to be allowed
		task.addClass("selected");
		lastTask = task; // lastTask represents the current task being edited
		selectedTask = task;
		UI_showColorSwitcher(task);
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
	
	// Called when element loses focus
	taskText.blur(function(){
		UI_unselect(task);
	});

	// Create new entry if needed
	var newEntry = false;
	if (!entry) {
		entry = manager.add("", true);
		entry.x = baseOffsetX;
		entry.y = baseOffsetY;
		entry.w = "250px";
		entry.h = "200px";
		entry.color = taskColor;
		UI_scrollTo(task); // scroll to new entry
		newEntry = true;
	}
	
	// Set attributes
	task.css({
		"position": "absolute",
	});
	taskText.attr("id", "task_" + entry.id);
	taskText.attr("data-taskid", entry.id);
	UI_setTaskPanel(entry, task, taskText);
	
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
	
	// Perform insertion after element has been added (performed last to prevent race condition)
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
		drop: function(event, ui) {
			// Delete tasks dragged into the box
			$("#deleteTaskIcon").hide();
			$("#sidebarView").show();
			UI_deleteTask(ui.draggable);
		}
	});
	$("#deleteTaskContainer").droppable();
}
// Delete task
function UI_deleteTask(target) {
	// Target is the element with ".task" class
	var taskID = target.children(".taskText").attr("data-taskid");
	target.children(".taskText").attr("data-taskarchived", "true")

	// Animate hide
	target.animate({opacity: 0}, { queue: false, duration: 300 }).hide("scale",{origin:["middle","left"]}, 300);
	
	manager.remove(taskID);
}

/** Fixes for mobile Safari scrolling **/
$(document).on("touchmove", function(e){
	e.preventDefault(); // Disable scrolling
});
$('body').on("touchstart", ".scrollable", function(e) {
	// Only elements with "scrollable" class can be scrolled
	if (e.currentTarget.scrollTop === 0) {
		e.currentTarget.scrollTop = 1;
	} else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
		e.currentTarget.scrollTop -= 1;
	}
});
$('body').on("touchmove", ".scrollable", function(e) {
	var anySelected = $(".selected").get(0);
	if (anySelected) {
		// User selected an object, don't allow panning in the page (makes it easier for resize)
		e.preventDefault();
	} else {
		// Do not send event to parent
		e.stopPropagation();
	}
});
