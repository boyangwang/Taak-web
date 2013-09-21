var version = "0.17";
var manager = new TaskManager();

var sync = new TaskSync();
sync.onconnect = synchronize;
if (sync.online) {
	synchronize();
}
checkLogin();
sync.initToken();

// Set up manager
manager.onupdate = function() {
	showEntries();
	sync.performSynchronize(manager, showEntries);
}
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
// Perform synchronization
function synchronize() {
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

// Trigger callback when user hits enter key
function submit(e, callback, argument) {
	if (e.keyCode == 13 && !e.shiftKey) {
		if (callback) {
			callback(argument);
		}
		hideKeyboard();
	}
}

// Display all entries
function showEntries() {
	var result = "";
	var entries = manager.entries;
	for (var entry in entries) {
		var value = entries[entry].value;
		if (value) {
			if (entries[entry].archive) {
				continue;
			}
			UI_showTaskPanel(entries[entry]);
		}
	}
}

function checkLogin() {
	console.log(localStorage);
	if (!localStorage.visited) {
		showLoginPrompt();
	} else if (localStorage.fb_token) { // Logged in using Facebook
		$('#login_flag').text('Logged in');
		$('#fb_oauth_link').html('Log out');
		$('#fb_oauth_link').attr('href', '#');
		$('#fb_oauth_link').click(logout);
	}
	localStorage.visited = true;
}
function showLoginPrompt() {
	$('#loginPrompt').fadeIn(300);
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
