
var manager = new TaskManager();
manager.onupdate = showEntries;
manager.readLocal();

/** UI Interactions **/

// Reload the page
function reload() {
	window.location.reload();
}

// Hide mobile keyboard
function hideKeyboard() {
	document.activeElement.blur();
}

/** UI Wrapper **/

// Add an entry
function addEntry(target) {
	var newEntry = document.getElementById(target);
	if (newEntry.value == "") {
		return;
	}
	manager.add(newEntry.value);
	newEntry.value = "";
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
		result += "<div onclick=\"javascript:highlightEntry(this);\" class=\"entry round\"><a class=\"deleteButton\" href=\"javascript:deleteEntry(\'" + entry + "\');\">x</a><span class=\"editbox\" id=\"edit_" + entry + "\"><input class=\"box\" onkeydown=\"javascript:submit(event, updateEntry('" + entry + "'), 'editinput_" + entry + "');\" id=\"editinput_" + entry + "\" type=\"text\" value=\"" + value + "\"></span><span class=\"entrytext\">" + value + " " + "</span><div class=\"clear\"></div></div>";
	}
	$("#listings").get(0).innerHTML = result;
}
