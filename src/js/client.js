var version = "0.17";
var sync = new TaskSync();
var manager = new TaskManager();

// Set up sychronizer
if (navigator.onLine) {
	sync.online = true;
	synchronize();
} else {
	sync.online = false;
}
window.addEventListener( 'online', function( event ) {
	sync.online = true;
	synchronize();
}, false);
window.addEventListener( 'offline', function( event ) {
	sync.online = false;
}, false);

// Set up manager
manager.onupdate = function() {
	showEntries();
	sync.performSynchronize(manager, showEntries);
}
manager.readLocal();
/*
$(document).ready(function() {
	showEntries(); // show current local entries first
	//manager.onupdate(); // do synchronization if needed
});
*/

/** UI Interactions **/

// Reload the page
function reload() {
	window.location.reload();
}
// Hide mobile keyboard
function hideKeyboard() {
	document.activeElement.blur();
}
// Perform synchronization
function synchronize() {
	sync.getToken(); // Set the token
	sync.performSynchronize(manager, showEntries);
}
// Checks for server update
function checkUpdate() {
	sync.net.getVersion(function(serverVersion) {
		if (serverVersion != version) {
			console.log("New update is available");
		}
	});
}
checkUpdate();

/** UI Wrapper **/

// Add an entry
function addEntry(target) {
	var newEntry = document.getElementById(target);
	if (newEntry.value == "") {
		return;
	}
	manager.add(newEntry.value);
	newEntry.value = "";
	
	// Bugfix for using typeahead
	$('.typeahead').typeahead('setQuery', '');
}
// Update an entry
function updateEntry(entry) {
	return function(target) {
		var newEntry = document.getElementById(target);
		manager.update(entry, newEntry.value);
	}
}
// Delete an entry
function deleteEntry(id) {
	manager.remove(id);
}
// Trigger callback when user hits enter key
function submit(e, callback, argument) {
	if (e.keyCode == 13 && !e.shiftKey) {
		callback(argument);
		hideKeyboard();
	}
}

// Quick-edit
var entryHighlighted = false; // use for preventing immediate unhighlighting of entry after highlight
function highlightEntry(target) {
	unhighlightAll();
	entryHighlighted = true;
	$(target).addClass("entry-active");
}
function unhighlightAll() {
	if (!entryHighlighted) {
		$(".entry").removeClass("entry-active");
	}
	entryHighlighted = false;
}

// Display all entries
function showEntries() {
	var result = "";
	var entries = manager.entries;
	for (var entry in entries) {
		var value = entries[entry].value;
		if (typeof(entries[entry].archive) != "undefined" && entries[entry].archive) {
			continue;
		}
		if (value != "") {
			//result += "<div onclick=\"javascript:highlightEntry(this);\" class=\"entry round\"><a class=\"deleteButton\" href=\"javascript:deleteEntry(\'" + entry + "\');\">x</a><span class=\"editbox\" id=\"edit_" + entry + "\"><input class=\"box\" onkeydown=\"javascript:submit(event, updateEntry('" + entry + "'), 'editinput_" + entry + "');\" id=\"editinput_" + entry + "\" type=\"text\" value=\"" + value + "\"></span><span class=\"entrytext\">" + value + " " + "</span><div class=\"clear\"></div></div>";
			UI_addTaskPanel(entries[entry]);
		}
	}
	//$("#listings").get(0).innerHTML = result;
}

/** New UI Helpers **/

function UI_init() {
	$(".workflowView").click(function(e) {
		//$(".task").draggable("option", "disabled", false);
		if (!forceFocus) {
			$(".task").children(".taskText").blur();
		}
		forceFocus = false;
	});

	showEntries(); // show current local entries first
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
// Add task using entry object
var baseOffset = 10;
var forceFocus = false;
function UI_addTaskPanel(entry) {
	console.log("ADD" ,entry);
	var task = $(document.createElement("div")).attr("class", "task");
	
	task.draggable({
		stack: ".task" // bring to front on drag
	}).resizable({
		minHeight:80,
		minWidth:80
	}).click(function(e){
		if ($(this).parent().is('.ui-draggable-dragging') ) {
			return;
		}
		$(this).draggable("option", "disabled", true ); // dragging must be disabled for edit to be allowed
		$(this).addClass("selected");
		$(this).attr("data-selected", "true");
		$(this).children(".taskText").addClass("selected");
		e.stopPropagation(); // don't send click event to parent
	});
	
	task.attr("data-selected", "false");
	
	var taskText = $(document.createElement("div")).attr("class", "taskText");
	taskText.attr("contenteditable","true"); // This attribute is dynamically set in the tap-to-edit feature
	taskText.blur(function(){
		task.removeClass("selected");
		task.draggable("option", "disabled", false);
		task.attr("data-selected", "false");
		$(this).removeClass("selected");
	});
	
	// Set text inside the task
	if (entry) {
		taskText.attr("id","task_" + entry.id);
		taskText.attr("data-taskid", entry.id);
		taskText.html(entry.value);
	}

	task.append(taskText);
	$(".workflowView").append(task);
	
	// Set initial position
	// TODO: More smarter positioning/user-custom positioning
	task.css({
		"position": "absolute",
		"top": baseOffset,
		"left": 10
	});
	baseOffset += 310;
	
	if (!entry) {
		// new entry, scroll to that task
		task.attr("data-forceselect", "true");
		UI_scrollTo(task);
		taskText.trigger("focus");
		forceFocus = true;
		/*
		
		task.draggable("option", "disabled", true);
		taskText.trigger("focus");
		task.addClass("selected");
		taskText.addClass("selected");
		*/
		task.trigger("click");
	}
	
	return taskText;
}

//uses document because document will be topmost level in bubbling
$(document).on('touchmove',function(e){
  e.preventDefault();
});
//uses body because jquery on events are called off of the element they are
//added to, so bubbling would not work if we used document instead.
$('body').on('touchstart','.scrollable',function(e) {
  if (e.currentTarget.scrollTop === 0) {
    e.currentTarget.scrollTop = 1;
  } else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
    e.currentTarget.scrollTop -= 1;
  }
});
//prevents preventDefault from being called on document if it sees a scrollable div
$('body').on('touchmove','.scrollable',function(e) {
  e.stopPropagation();
});