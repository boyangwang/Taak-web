/** UI Helpers **/
var glMode=0; //mode 1: can mark tasks done || mode 2: screensaver || mode 3: multi select
var glModeSaver=0;
function haltModes(){
	glModeSaver = glMode;
	resetMarkingTaskDone();
}
function restoreModes(){
	glMode = glModeSaver;
	if (glMode==1)
		setMarkingTaskDone_inProgress();
}

var config = {};
config.donemark = "img/markdone/done2.png";

$(document).ready(function(){
	console.log("ready");
	bindDeleteWorkflow();

	// show all entries (debug)
	var allEntries = manager.entries;
	var hasSpecial = false;
	for(var entry in allEntries){
		if(allEntries[entry].dataflow == "specialTask"){
			hasSpecial = true;
		}
	}
	console.log("hasSpecial: " + hasSpecial);
	if(!hasSpecial){
		// Create special entry
		var tempArray = new Array();
		var specialEntry = manager.add("specialTask",JSON.stringify(tempArray), true);
		manager.markArchive(specialEntry.id); // hide from view, and save
	}
	else{
		preloadWorkflowTable();
	}
	
	$("#addWorkflowIcon").click(function(){
		$("#workflowTable").append("<tr class='workflowName' contenteditable><td>&nbsp;</td></tr>");
		$(".workflowName").last().get(0).focus();
		$(".workflowName").last().keydown(function(e) {
			if (e.keyCode == 13 && !e.shiftKey) {
				if($(this).html() != "<td>&nbsp;</td>") {
					$(this).attr("contenteditable","false");
					var tempTimestamp = Date.now(); 
					$(this).attr("data-workflow", $(this).text() + tempTimestamp);
					var specialEntry = getSpecialEntry();
					var entryValueArray;
					try {
						entryValueArray = JSON.parse(specialEntry.value);
					} catch (ex) {
						entryValueArray = new Array();
					}
					entryValueArray.push($(this).text());
					entryValueArray.push($(this).text() + tempTimestamp);
					specialEntry.value = JSON.stringify(entryValueArray);
					manager.update(specialEntry.id, specialEntry.value);
					bindWorkflows();
					
					$("#workflowSelectorBox").hide();
				}
				else{
					$(this).remove();
					hideKeyboard();
				}
			}
		});
		$(".workflowName").last().focusout(function(){
			console.log("text:" + $(this).html() + "end");
			if($(this).html()!= "<td>&nbsp;</td>"){
				$(this).attr("contenteditable","false");
				var tempTimestamp = Date.now(); 
				$(this).attr("data-workflow", $(this).text() + tempTimestamp);
				var specialEntry = getSpecialEntry();
				var entryValueArray;
				try {
					entryValueArray = JSON.parse(specialEntry.value);
				} catch (ex) {
					entryValueArray = new Array();
				}
				entryValueArray.push($(this).text());
				entryValueArray.push($(this).text() + tempTimestamp);
				specialEntry.value = JSON.stringify(entryValueArray);
				manager.update(specialEntry.id, specialEntry.value);
				bindWorkflows();
			}
			else{
				$(this).remove();
			}
		});
	});

bindWorkflows();

$(".dialog .window").click(function(e) {
	e.stopPropagation();
});
$('.dialog').click(hideDialog);

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

	//Don't put inside resetMarkingTaskDone() //The create function will call the func multiple times, which adds on multiple "onclick" functions.
	$("#messagebar").fadeOut(0);
	$("#markTaskDoneBtn").click(function(){
		switch(glMode){
		case 0: //Originally, innerText is "Start Marking Tasks".
			setMarkingTaskDone_inProgress();
			break;
		case 1: //Originally, innerText is "Stop Marking Tasks".
			resetMarkingTaskDone();
			break;
		}
		console.log("MarkingTaskDone");
	});

	UI_init();


	initScreensaver();
});

function resetMarkingTaskDone(){
	slowflashMessagebar("Stopping task marking.");
	glMode = 0;
	$("#markTaskDoneBtn").text("Start Marking Tasks");
	console.log("resetMarkingTaskDone");
}
function setMarkingTaskDone_inProgress(){
	slowflashMessagebar("You can start marking your tasks.");
	glMode = 1;
	$("#markTaskDoneBtn").text("Stop Marking");
}
// function setMarkingTaskDone_inProgress(){ //code for causing recursive lag :)
// 	glMode = 1;
// 	$("#markTaskDoneBtn").text("Stop Marking Tasks");
// 	$("#markTaskDoneBtn").click(function(){
// 		console.log("--MTD");
// 		resetMarkingTaskDone();
// 	});
// }


function preloadWorkflowTable(){
	var specialEntry = getSpecialEntry();
	var workflowList = specialEntry.value;
	try {
		var workflowListArray = JSON.parse(workflowList);
		for(var i = 0 ; i < workflowListArray.length ; i+=2){
			var workflowName = workflowListArray[i];
			var workflowIdentifier = workflowListArray[i+1];
			if (workflowIdentifier != null) {
				$("#workflowTable").append("<tr class='workflowName' data-workflow='"+workflowIdentifier+"'><td>&nbsp;"+workflowName+"&nbsp;</td></tr>");
			}
		}
	} catch (ex) {
		// Error passing workflow
		console.log("Workflow parse error", workflowList);
	}
}

function getSpecialEntry(){
	var allEntries = manager.entries;
	var specialTask = false;
	for(var entry in allEntries){
		if(allEntries[entry].dataflow == "specialTask"){
			specialTask = allEntries[entry];
		}
	}
	return specialTask;
}

function toggleWorkflowSelector() {
	$("#workflowSelectorBox").toggle();
}

function doDeleteWorkflow() {
	$(".task").hide();
	var workflowToDelete = $("#workflowSelectorIcon").attr('data-workflow');
	$("#workflowSelectorIcon").text("Default Board");
	$("#workflowSelectorIcon").attr('data-workflow','Default');
	$("#deleteWorkflowIcon").hide();
	$(".workflowName").each(function(){
		if($(this).attr('data-workflow')=="Default"){
			$(this).addClass('selectedworkflow');
		}
		if($(this).attr('data-workflow')==workflowToDelete){
			var specialEntry = getSpecialEntry();
			var workflowList = specialEntry.value;
			var workflowListArray = JSON.parse(workflowList);
			var deleteIndex = -1;
			for(var i = 0 ; i < workflowListArray.length ; i+=2){
				if(workflowListArray[i+1] == workflowToDelete){
					deleteIndex = i;
				}
			}
			workflowListArray.splice(deleteIndex,2);
			specialEntry.value = JSON.stringify(workflowListArray);
			manager.update(specialEntry.id, specialEntry.value);
			$(this).remove();
		}
	});
	$(".task").each(function(){
		if($(this).attr('data-workflow')==workflowToDelete){
			UI_deleteTask($(this));
			$(this).remove();
		}
		if($(this).attr('data-workflow')=='Default' || $(this).attr('data-workflow') == null){
			$(this).show();
		}
	});
	
	hideDialog();
}

function bindDeleteWorkflow(){
	$("#deleteWorkflowIcon").click(function(){
		$("#deleteWorkflowPrompt").show();
	});
}

function bindWorkflows(){
	$(".workflowName").unbind() // in case anything has been bound before
	$(".workflowName").click(function(){
		$(".workflowName").removeClass("selectedworkflow");
		$(this).addClass("selectedworkflow");
		var currentWorkflow = $(this).attr('data-workflow');
		if (currentWorkflow == "Default") {
			$("#deleteWorkflowIcon").hide();
		}
		else{
			$("#deleteWorkflowIcon").show();
		}
		console.log(currentWorkflow);
		var workflowText = $(this).text();
		$("#workflowSelectorIcon").text(workflowText);
		$("#workflowSelectorIcon").attr('data-workflow',currentWorkflow);
		$("#workflowSelectorBox").hide();
		$(".task").hide();
		$(".task").each(function(){
			if (currentWorkflow == "Default" && typeof($(this).attr("data-workflow")) == "undefined") {
				// For default workflow, tasks without a workflow will be considered part of default
				$(this).show();
			} else if($(this).attr("data-workflow") == currentWorkflow){
				$(this).show();
			}
		});
	});
}

// Show/hide messagebar
function slowflashMessagebar(messageString){
	showMessagebar(messageString);
	hideMessagebar();
}
function showMessagebar(messageString) {
	$("#messagebar").text(messageString);
	$("#messagebar").stop(true,true).fadeIn(100); ///http://stackoverflow.com/questions/2805906/jquery-stop-fadein-fadeout	///http://stackoverflow.com/questions/1421298/how-do-you-cancel-a-jquery-fadeout-once-it-has-began
}
function hideMessagebar() {
	$("#messagebar").stop(true,true).fadeOut(3000);
}

// Show/hide drag instructions
function showDragInstructions() {
	$("#dragInstructions").fadeIn(100);
}
function hideDragInstructions() {
	$("#dragInstructions").fadeOut(300); //longer fade out than fade in so that instructions dont flicker when user does a quick click and doesnt hold
}

// Called when adding a task
function addTask(x, y, taskColor){
	hideDragInstructions(); // already called earlier
	UI_addTaskPanel(null,x,y,taskColor);
}

// Hide login
function hideDialog() {
	//$('#loginPrompt').fadeOut(300);
	$('.dialog').fadeOut(300);
}

// Update UI for iOS after keyboard closed
function UI_resize() {
	// Force iOS to update heights after keyboard close
	$(".ios7fixer").css({position:'absolute'});
	$(window).scrollTop(0);
	// Use fixed position to constrain UI to correct place
	$(".ios7fixer").css({position:'fixed'});
}

function workflowListener(){
	console.log("workflowListener");
	var workflowTable = $(".workflowName");
	var specialEntry = getSpecialEntry();
	var workflowArray = JSON.parse(specialEntry.value);
	console.log(workflowArray);
	workflowTable.each(function(){ // for removing (if in UI but not in specialTask)
		console.log($(this).attr('data-workflow'));
		if($.inArray($(this).attr('data-workflow'),workflowArray) == -1 && $(this).attr('data-workflow')!="Default"){ // not in array
			console.log("Sync delete workflow");
			if($("#workflowSelectorIcon").text() == $(this).text()){
				$("#workflowSelectorIcon").text("Default Board");
				$("#workflowSelectorIcon").attr('data-workflow','Default');
				$("[data-workflow='Default']").addClass('selectedworkflow');
			}
			$(this).remove();
			bindWorkflows();
		}
	});
	for(var i = 0 ; i < workflowArray.length ; i+=2){ // for adding (if in specialTask but not in UI)
		var workflowIdentifier = workflowArray[i+1];
		var workflowName = workflowArray[i];
		var containsWorkflow = false;
		workflowTable.each(function(){
			if($(this).attr('data-workflow')==workflowIdentifier){
				containsWorkflow = true;
			}
		});
		if(!containsWorkflow){ // add to table
			console.log("Sync add workflow");
			$("#workflowTable").append("<tr class='workflowName' data-workflow='"+workflowIdentifier+"'><td>&nbsp;"+workflowName+"&nbsp;</td></tr>");
			bindWorkflows();
		}
	}
};

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
		workflowListener();
		console.log("Polled", manager);
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
function UI_updateEntry(target, forced) { //the Wrapper that updates the Manager. **IMPT** //param target must be the taskText div, not the task div.
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
function UI_updateEntryLabels(target){ //param target must be the taskText div, not the task div.
	var target = $(target.get(0)); // get latest element copy
	if (!target.attr("data-taskid")) {
		console.log("Warning", "An undefined entry was flagged for updating");
		return;
	}
	var label_done = $(".donemark", target.parent()).hasClass("donemark");

	if ( label_done != target.attr("label_done") ) {
		manager.update(target.attr("data-taskid"),null,null,null,null,null,null,null,{done:label_done});
		// target.attr("label_done", true); //different from "label_archived"
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
		//console.log(entry);
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
	task.removeClass (function (index, css) {
		return (css.match (/\btask-\S+/g) || []).join(" ");
	});
	task.addClass("task-" + entry.color);
	task.css({
		"left": entry.x,
		"top": entry.y,
		"width": entry.w,
		"height": entry.h
	});
	if(entry.labels && entry.labels.done) //[NEW_>_ver0.55] Need to check entry.labels because older versions don't have it. Can remove when people are no longer using client ver0.55.
		UI_addDoneMark(task);
}

function UI_addDoneMark(target){ //the target TaskPanel
	target.prepend("<img class='donemark' src='"+config.donemark+"'/>"); //use prepend so that it's at bottom layer.
}
function UI_delDoneMark(target){ //the target TaskPanel
	$(".donemark", target).remove();
}

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
	if(glMode!=0){ //We dont want this to trigger every time. ONLY if the glMode is non-zero and has been set to other state.
		haltModes();
		resetMarkingTaskDone(); //needed to avoid adding the done-mark on this newly created note (due to the "click")
	}
	var task = $(document.createElement("div")).attr("class", "task");
	var taskText = $(document.createElement("div")).attr("class", "taskText");
	
	// associate the task with the workflow
	if(!entry){
		task.attr("data-workflow", $("#workflowSelectorIcon").attr('data-workflow'));
	}
	else{
		task.attr("data-workflow", entry.dataflow);
	}
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

		if(glMode==1){
			if ( !$(".donemark", this).hasClass("donemark") ) //.length<1 //.hasClass("donemark") 
				UI_addDoneMark(task);
			else
				UI_delDoneMark(task);
			UI_updateEntryLabels(task.children(".taskText"));
			return; //return here! dont allow user to edit text.
		}//endof glMode==1
		
		// Set select mode
		UI_scrollTo(task);
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
		entry = manager.add($("#workflowSelectorIcon").attr('data-workflow'),"", true);
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
	taskText.attr("data-workflow",entry.workflow);
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

	// check if entry is in current workflow
	if(entry.dataflow != $("#workflowSelectorIcon").attr('data-workflow')){
		task.hide();
	}

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

	//restoreModes() aims to have the addTaskPanel action not be an interruption to the markTaskDone action.
	//restoreModes(); //but it seems more confusing to have your item suddenly marked while you are adding it, then if you are forced out of the marking mode.
	return taskText;
}//endof UI_addTaskPanel

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


//==================================================
// SCREENSAVER MODE
function initScreensaver(){
	var screensaverCanvas = document.getElementById("screensaverCanvas");
	var clickCanvas = document.getElementById("clickCanvas");
	var glowingCanvas = document.getElementById("glowingCanvas");
	var scoreCanvas = document.getElementById("scoreCanvas");
	var unlockInstructions = document.getElementById("unlockInstructions");
	
	screensaverCanvas.width = window.innerWidth; screensaverCanvas.height = window.innerHeight;
	clickCanvas.width = 100; clickCanvas.height = 100;
	glowingCanvas.width = 100; glowingCanvas.height = 100;
	scoreCanvas.width = 100; scoreCanvas.height = 100;

	var canvasCenter_coord = calcCanvasCenter(clickCanvas);
	createCircle( clickCanvas, canvasCenter_coord, {r:0,g:0,b:0,a:-0.2},{a:-0.5} );
	createCircle( glowingCanvas, canvasCenter_coord, {r:0,g:0,b:0,a:-0.2},{a:-0.7} );
	for (var pos=0; pos<3; ++pos)
		createScoreCircle(scoreCanvas, canvasCenter_coord, 0, pos);
}//endof initScreensaver()
function createScoreCircle(scoreCanvas, canvasCenter_coord, opacityInc, pos){ ///[New]
	//takes scoreCanvas, canvasCenter_coord
	var newCoord = {x:0,y:0};
	var colorOffset = {r:0,g:0,b:0,a:-0.65+opacityInc};
	var outlineColorOffset = {a:-0.95+opacityInc};
	var newRadius = 5;
	switch(pos){
	case 1:
		newCoord = {x:canvasCenter_coord.x, y:canvasCenter_coord.y/3}; break;
		//createCircle( scoreCanvas, newCoord, {r:0,g:0,b:0,a:-0.2},{a:-0.9}, 5 );
	case 0:
		newCoord = {x:canvasCenter_coord.x*1/3, y:canvasCenter_coord.y/3}; break;
	case 2:
		newCoord = {x:canvasCenter_coord.x*5/3, y:canvasCenter_coord.y/3}; break;
	}
	createCircle( scoreCanvas, newCoord, colorOffset,outlineColorOffset, 5 );
}

function startScreensaver(){
	window.screensaver = true;
	var screensaverCanvas = document.getElementById("screensaverCanvas");
	screensaverCanvas.hidden = false;
	var original_selectedworkflow = $("selectedworkflow").get(0);

	var wi=0;
	var changeWorkflowInterval = setInterval( function(){
		wi = (wi+1)%($(".workflowName").length);
	}, 3000);

	var clickWorkflowInterval = setInterval( function(){
		if (window.screensaver == false){
			clearInterval(changeWorkflowInterval);
			clearInterval(clickWorkflowInterval);
			wi=0;
			return; //do not click if there's no more screensaver.
		}
		$(".workflowName").get(wi).click();
	}, 3000);
	
	screensaverCanvas.onclick = function(){
		var desiredWorkflow = $(".workflowName").get(wi);
		this.className += " nonclickable"; //"pointer-events: none" only works for Firefox >= 3.6, Safari >= 4.0 and Chrome >= 2 //Screw the older browsers. ///http://stackoverflow.com/questions/1401658/html-overlay-which-allows-clicks-to-fall-through-to-elements-behind-it
		this.getContext("2d").fillStyle = "rgba(0,0,0,0.7)";
		this.getContext("2d").fillRect(0,0,this.width,this.height);
		tapScreenSaver(screensaverCanvas, desiredWorkflow);
	};
}//endof startScreensaver()
function clearCanvas(theDOM){
	theDOM.getContext("2d").clearRect(0,0,theDOM.width,theDOM.height);
	theDOM.className = theDOM.className.replace(/ nonclickable/, "");
}

function tapScreenSaver(screensaverCanvas, desiredWorkflow){
	var tapscore = 0; var unlockTimeout;
	resetUnlockTimeout();
	function resetUnlockTimeout(){
		clearTimeout(unlockTimeout);
		unlockTimeout = setTimeout(function(){
			killGlowingCircle();
			hideCanvasSet(); //the sweeper. must be after kill, to ensure no further alternating.
			clearCanvas(screensaverCanvas);
			return tapscore;
		}, 5000); //2000 is too fast
	}

	var randomCoord = {x:150,y:150};
	var clickCanvas = document.getElementById("clickCanvas");
	var glowingCanvas = document.getElementById("glowingCanvas");
	var scoreCanvas = document.getElementById("scoreCanvas");
	var unlockInstructions = document.getElementById("unlockInstructions");
	setCanvasPositions(randomCoord);
	showCanvasSet();
	reviveGlowingCircle(1);

	clickCanvas.onclick = function(){tappedCorrectly();}
	glowingCanvas.onclick = function(){tappedCorrectly();}
	function tappedCorrectly(){
		++tapscore;
		switch(tapscore){
		case 1:
			randomCoord = {x:400, y:500};
			setCanvasPositions(randomCoord);
			break;
		case 2:
			randomCoord = {x:900, y:300};
			setCanvasPositions(randomCoord);
			break;
		}
		var canvasCenter_coord = calcCanvasCenter(clickCanvas);
		createScoreCircle(scoreCanvas, canvasCenter_coord, 0.8, tapscore-1);
		if(tapscore == 3){
			killGlowingCircle();
			reviveGlowingCircle(0.15);
			setTimeout(function(){
				killGlowingCircle();
				hideCanvasSet();
				stopScreenSaver(screensaverCanvas, desiredWorkflow);
			}, 1000);
			return true; }
		resetUnlockTimeout();
	};//if no click detected, doNothing and wait for Timeout
	function setCanvasPositions(coord){
		setCanvasPosition(clickCanvas, coord);
		setCanvasPosition(glowingCanvas, coord);
		setCanvasPosition(scoreCanvas, {x:coord.x,y:coord.y+100}); //we want scoreCanvas to appear below
		setCanvasPosition(unlockInstructions, {x:coord.x-50,y:coord.y-40});
	}
	function setCanvasPosition(canvas, coord){
		canvas.style.left = coord.x+"px";
		canvas.style.top = coord.y+"px";
	}
	function showCanvasSet(){
		clickCanvas.hidden = false;
		glowingCanvas.hidden = false;
		scoreCanvas.hidden = false;
		unlockInstructions.hidden = false;
	}
	function hideCanvasSet(){
		clickCanvas.hidden = true;
		glowingCanvas.hidden = true;
		scoreCanvas.hidden = true;
		unlockInstructions.hidden = true;
	}

}//endof tapScreenSaver()

function stopScreenSaver(screensaverCanvas, desiredWorkflow){
	desiredWorkflow.click();
	screensaverCanvas.hidden = true;
	clearCanvas(screensaverCanvas);
	window.screensaver = false;
	//this will then trigger the if-condition in the setInterval.
}


//==================================================
// CANVAS

function rgbaObjToString(rgbaObject){
  return "rgba("+rgbaObject.r+","+rgbaObject.g+","+rgbaObject.b+","+rgbaObject.a+")"; //color
}

// Canvas Positioning Geometry
function calcCanvasCenter(canvas){
	return {x: (canvas.width/2), y: (canvas.height/2)}
}

function createCircle(canvas, coord, colorOffset, outlineColorOffset, newRadius){ //SIMILAR to paintDot
	console.log(newRadius);
	var preCf = {
		color: {r:(0+colorOffset.r), g:(0+colorOffset.g), b:(0+colorOffset.b), a:(1.0+colorOffset.a)},
		outlineColor: {r:(255+colorOffset.r), g:(255+colorOffset.g), b:(255+colorOffset.b), a:(1.0+outlineColorOffset.a)},
		radius: newRadius||35 //prev 70
	};console.log(preCf.radius);
	var config = {
		strokeStyle: rgbaObjToString(preCf.color),
		lineWidth: 12,
		outlineZoom: 1.06, //1.06 indicates 1.06x the size
		outlineStyle: rgbaObjToString(preCf.outlineColor),
		outlineWidth: 2, //prev -2
		radius: preCf.radius,
		x: coord.x,
		y: coord.y,
		startAngle: 0,
		endAngle: 2*Math.PI,
		counterClockwise: true
	};

	var ctx = canvas.getContext("2d");
	/// TRANSLATE AND ZOOM IN (like google maps) http://stackoverflow.com/questions/2916081/zoom-in-on-a-point-using-scale-and-translate
	ctx.save();
	ctx.scale(config.outlineZoom,config.outlineZoom);
	ctx.translate(
		-( coord.x - coord.x/config.outlineZoom ),
		-( coord.y - coord.y/config.outlineZoom )
	);
	drawCircle(ctx, config.outlineStyle, config.outlineWidth);
	ctx.restore();
	drawCircle(ctx, config.strokeStyle, 0);
	function drawCircle(ctx, strokeStyle, lineWidth){
		ctx.strokeStyle = strokeStyle;
		ctx.lineWidth = config.lineWidth+lineWidth;
		ctx.beginPath();
		ctx.arc(config.x, config.y, config.radius, 0, 2*Math.PI, true);
		ctx.stroke();
	}
}


var isGlowingSolid = true;
window.glowingCircleInterval=null;
function reviveGlowingCircle(fraction){ ///[New]
	// showClickCanvas(); //There seems to be some lag creating the setInterval function.
	setTimeout(alternateTheCircle, 250*fraction); //for the initial flash
	//So this is meant to cover up for it.
	window.glowingCircleInterval = setInterval(alternateTheCircle, 500*fraction);
}//Endof reviveGlowingCircle()
function alternateTheCircle(){
	if(window.isGlowingSolid){
		//hide fixedCanvas which has Solid Circle, and unhide glowingCanvas
		showGlowingCanvas();
		window.isGlowingSolid = false;
	}
	else if(!isGlowingSolid){
		//hide glowingCanvas, and unhide fixedCanvas which has Solid Circle
		showClickCanvas();
		window.isGlowingSolid = true;
	}  
}
function killGlowingCircle(){
	clearInterval(window.glowingCircleInterval);
	//hideClickCanvas
	isGlowingSolid = true;
}//Endof killGlowingCircle()
function showClickCanvas(){
	//console.log("SolidCircle");
 	document.getElementById("clickCanvas").hidden = false;
	document.getElementById("glowingCanvas").hidden = true;
}
function showGlowingCanvas(){
	//console.log("GlowingCircle");
	document.getElementById("glowingCanvas").hidden = false;
 	document.getElementById("clickCanvas").hidden = true;
}
