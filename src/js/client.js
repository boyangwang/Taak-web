var version = "0.17";
var sync = new TaskSync();
checkLogin();
sync.initToken();
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
		if (callback) {
			callback(argument);
		}
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
		/*if (value == "") {
			manager.markArchive(entry);
		}*/
		//if (value != "") {
			//result += "<div onclick=\"javascript:highlightEntry(this);\" class=\"entry round\"><a class=\"deleteButton\" href=\"javascript:deleteEntry(\'" + entry + "\');\">x</a><span class=\"editbox\" id=\"edit_" + entry + "\"><input class=\"box\" onkeydown=\"javascript:submit(event, updateEntry('" + entry + "'), 'editinput_" + entry + "');\" id=\"editinput_" + entry + "\" type=\"text\" value=\"" + value + "\"></span><span class=\"entrytext\">" + value + " " + "</span><div class=\"clear\"></div></div>";
			UI_showTaskPanel(entries[entry]);
		//}
	}
	//$("#listings").get(0).innerHTML = result;
}

function checkLogin() {
	console.log(localStorage);
	if (!localStorage.visited) {
		$('#loginPrompt').fadeIn(300);
	}
	// visited before and logged in already
	else if (localStorage.fb_token) {
		$('#login_flag').text('Logged in');
		$('#fb_oauth_link').html('Log out');
		$('#fb_oauth_link').attr('href', '#');
		$('#fb_oauth_link').click(logout);
	}
	
	localStorage.visited = true;
}

function logout(e) {
	// 1. clear local
	// 2. remove from db
	// 3. back to unlogin page
	
	var token = localStorage.fb_token;
	localStorage.clear();
	$.ajax({
		type: 'POST',
		url: 'api/logout/',
		data: "token="+token,
		success: function(res) {
			window.location = './index.html';
		},
	});
}
