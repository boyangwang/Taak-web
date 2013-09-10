if (localStorage.entries == null) {
	localStorage.entries = "";
}

var entries = { };
try {
	entries = JSON.parse(localStorage.entries);
	showEntries();
} catch(ex) {

}

function hideKeyboard() {
	document.activeElement.blur();
}

var idgen = 0;
function addEntry(target) {
	var newEntry = document.getElementById(target);
	if (newEntry.value == "") {
		return;
	}
	var entry = {
		id: Date.now() + "_" + idgen,
		value: newEntry.value
	}
	entries[entry.id] = entry.value;
	newEntry.value = "";
	showEntries();
	syncLocal();
	
	serverPut(entry);
}

function submit(e, callback, argument) {
	if (e.keyCode == 13 && !e.shiftKey) {
		callback(argument);
		hideKeyboard();
	}
}

function syncLocal() {
	localStorage.entries = JSON.stringify(entries);
}

function deleteEntry(id) {
	delete entries[id];
	syncLocal();
	showEntries();
}

function showEntries() {
	var result = "";
	for (var entry in entries) {
		result += "<div class=\"entry\"><span class=\"entryText\">" + entries[entry] + " " + "</span><span class=\"editbox\" id=\"edit_" + entry + "\"><input id=\"editinput_" + entry + "\" type=\"text\"></span><a class=\"deleteButton\" href=\"javascript:deleteEntry(\'" + entry + "\');\">x</a>" + "</div>";
	}
	$("#listings").get(0).innerHTML = result;
}

var user = "demo";

function serverGet() {
	$.ajax({
		url: 'api/',
		type: 'GET',
		data: "user="+user,
		success: function(result) {
			console.log(result);
		}
	});
}
function serverPut(entry) {
	var entryStr = JSON.stringify(entry);
	$.ajax({
		url: 'api/',
		type: 'PUT',
		data: "user=" + user + "&entry="+entryStr,
		success: function(result) {
			console.log(result);
		}
	});
}
function serverDelete(id) {
	var entryStr = JSON.stringify(entry);
	$.ajax({
		url: 'api/',
		type: 'DELETE',
		data: "id="+id,
		success: function(result) {
			console.log(result);
		}
	});
}