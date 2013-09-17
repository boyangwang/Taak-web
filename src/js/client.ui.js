/** New UI Helpers **/

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
	}, 1000);
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
function UI_updateEntry(target) {
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
	if (value != target.attr("data-taskvalue") || positionCheck != target.attr("data-taskposition") || dimensionCheck != target.attr("data-taskdimension")) {
		console.log("Update", target.attr("data-taskid"), target.html(), target.attr("data-taskvalue"), positionCheck, target.attr("data-taskposition"), dimensionCheck, target.attr("data-taskdimension"));
		manager.update(target.attr("data-taskid"), value, left, top, width, height);
	}
}
// Add task using entry object
var baseOffset = 10;
var forceFocus = false;
var lastTask = null;
// Display a task entry
function UI_showTaskPanel(entry) {
	if (!$("#task_" + entry.id).get(0)) {
		// Element not added yet
		UI_addTaskPanel(entry);
	} else {
		var target = $("#task_" + entry.id);
		if (!lastTask || lastTask.children(".taskText").get(0) != target.get(0)) {
			target.attr("data-taskvalue", entry.value);
			target.attr("data-taskposition", entry.x + "_" + entry.y);
			target.attr("data-taskdimension", entry.w + "_" + entry.h);
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
// Create the element
function UI_addTaskPanel(entry) {
	var task = $(document.createElement("div")).attr("class", "task");
	
	// Set up draggable element
	task.draggable({
		stack: ".task", // bring to front on drag
		start: function() {
			lastTask = $(this)
		},
		stop: function() {
			UI_updateEntry(task.children(".taskText"));
		},
		containment: ".workflowView", // jquery.ui off-screen scroll is quite buggy
		scroll: false
	}).resizable({
		minHeight:80,
		minWidth:80,
		stop: function() {
			UI_updateEntry(task.children(".taskText"));
		}
	}).click(function(e){
		if (lastTask && lastTask != $(this)) {
			lastTask.removeClass("selected");
			lastTask.draggable("option", "disabled", false);
			lastTask.children(".taskText").removeClass("selected");
			console.log("Child", lastTask.children(".taskText"));
			UI_updateEntry(lastTask.children(".taskText"));
		}

		if ($(this).parent().is('.ui-draggable-dragging') ) {
			return;
		}
		$(this).draggable("option", "disabled", true ); // dragging must be disabled for edit to be allowed
		$(this).addClass("selected");
		$(this).children(".taskText").addClass("selected");
		lastTask = $(this);
		e.stopPropagation(); // don't send click event to parent
	});
	
	// Set up editable element
	var taskText = $(document.createElement("div")).attr("class", "taskText");
	taskText.attr("contenteditable","true"); // This attribute is dynamically set in the tap-to-edit feature
	taskText.blur(function(){
		task.removeClass("selected");
		task.draggable("option", "disabled", false);
		$(this).removeClass("selected");
		UI_updateEntry($(this));
		lastTask = null;
	});
	/*
	taskText.focusin(function() {
		console.log("A");
		console.log(taskText);
	});
	taskText.focusout(function() {
		console.log("B");
	});*/
	
	// Set initial position
	if (!entry) {
		task.css({
			"position": "absolute",
			"top": baseOffset,
			"left": 10,
			"width": "300px",
			"height": "200px",
		});
		baseOffset += 310;
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
		UI_scrollTo(task); // scroll to new entry
		newEntry = true;
	}
	
	// Set attributes
	taskText.attr("id", "task_" + entry.id);
	taskText.attr("data-taskid", entry.id);
	taskText.attr("data-taskvalue", entry.value);
	taskText.attr("data-taskposition", entry.x + "_" + entry.y);
	taskText.attr("data-taskdimension", entry.w + "_" + entry.h);
	taskText.html(entry.value);
	
	// Quick submit
	taskText.get(0).addEventListener("keydown", function(event) {
		submit(event);
	});
	
	// Insert elements
	task.append(taskText);
	$(".workflowView").append(task);
	
	// Give focus to new entries
	if (newEntry) {
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
		hoverClass: "active",
		drop: function( event, ui ) {
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
	target.hide();
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
  e.stopPropagation();
});
