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

/** Cache Helper **/
// Check if a new cache is available on page load.
window.addEventListener('load', function(e) {
	window.applicationCache.addEventListener('updateready', function(e) {
		if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
			// Browser downloaded a new app cache.
			// Swap it in and reload the page to get the new hotness.
			window.applicationCache.swapCache();
			if (confirm('A new version is available. Update?')) {
				window.location.reload();
			}
		}
	}, false);
}, false);

/** Browser Detection **/
// Chck if mobile
function mobileCheck() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|android|ipad|playbook|silk|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check; 
}

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
	if (sync.online) {
		window.applicationCache.update();
	}
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
	if (currentWorkflow != $("#workflowSelectorIcon").attr('data-workflow')) {
		$(".task").hide();
		currentWorkflow = $("#workflowSelectorIcon").attr('data-workflow');
	}
	console.log("WORKFLOW", currentWorkflow);
	$(".task").each(function(){
		if ($(this).children(".taskText").attr("data-taskarchived") != "true") { // Show non-deleted tasks
			if (currentWorkflow == "Default" && typeof($(this).attr("data-workflow")) == "undefined") {
				// For default workflow, tasks without a workflow will be considered part of default
				$(this).show();
			} else if($(this).attr("data-workflow") == currentWorkflow){
				$(this).show();
			}
		}
	});
	
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
	hideDialog();
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
