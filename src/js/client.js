var version = "0.34";
var manager;
var sync;

function init() {
	manager = new TaskManager();
	sync = new TaskSync();
	
	// Set up synchronizer
	sync.onconnect = synchronize;
	sync.initToken();
	
	if (sync.online) {
		synchronize();
	}
	checkLogin();
	

	// Set up manager
	manager.onupdate = function() {
		showEntries();
		sync.performSynchronize(manager, showEntries);
	}
	manager.readLocal();
}
init();

/** Helpers **/
function iOSversion() {
	if (/iP(hone|od|ad)/.test(navigator.platform)) {
		var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
		return [parseInt(v[1], 10)];
	}
	return 0;
}
var iosVersion = iOSversion();

/** UI Interactions **/

// Reload the page
function reload() {
	window.location.reload();
}
// Hide mobile keyboard
function hideKeyboard() {
	try {
		if (iosVersion == 5) {
			$("#dummyinput").get(0).focus();
		}
		document.activeElement.blur();
		$("input").blur();
	} catch (ex) {
	}
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

/** Submit on enter **/

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
var currentWorkflow = "";
function showEntries() {
	var result = "";
	var entries = manager.entries;
	for (var entry in entries) {
		var value = entries[entry].value;
		if (value) {
			if (entries[entry].archive) {
				var entryObj = $("#task_" + entry);
				if (entryObj.get(0)) { // task is deleted on other device
					entryObj.parent().fadeOut(300);
				}
				continue;
			}
			UI_showTaskPanel(entries[entry]);
		}
	}
	// Show the current workflow
	if (currentWorkflow != $(".workflowName").attr('data-workflow')) {
		$(".task").hide();
		currentWorkflow = $(".workflowName").attr('data-workflow');
		$(".task").each(function(){
			if($(this).attr("data-workflow") == $(".workflowName").attr('data-workflow')){
				$(this).show();
			}
		});
	}
}

// Check if login
function checkLogin() {
	console.log(localStorage);
	if (!localStorage.visited) {
		showLoginPrompt();
	} else if (localStorage.fb_token) { // Logged in using Facebook
		/*$('#login_flag').text('Logged in');
		$('#fb_oauth_link').html('Log out');
		$('#fb_oauth_link').attr('href', '#');
		$('#fb_oauth_link').click(logout);*/
	}
	localStorage.visited = true;
}

// Show login
function showLoginPrompt() {
	if (localStorage.fb_token) {
		$('#logoutPrompt').fadeIn(300);
	} else {
		$('#loginPrompt').fadeIn(300);
	}
}

// Perform logout
function logout(e) {
	// 1. clear local
	// 2. remove from db
	// 3. back to unlogin page
	
	
	
	var token = localStorage.fb_token;
	$(".task").remove();
	
	
	localStorage.clear();
	hideLoginPrompt();
	init();
	showEntries();
	showLoginPrompt();
	
	$.ajax({
		type: 'POST',
		url: 'api/logout/',
		data: "token="+token,
		success: function(res) {
			//window.location = './index.html';
		},
	});
	
}
