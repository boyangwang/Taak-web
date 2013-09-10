if (localStorage.entries == null) {
	localStorage.entries = "";
}

var entries = { };
try {
	entries = JSON.parse(localStorage.entries);
	showEntries();
} catch(ex) {

}

var idgen = 0;
function addEntry(target) {
	var newEntry = document.getElementById(target);
	entries[Date.now() + "_" + idgen] = newEntry.value;
	newEntry.value = "";
	showEntries();
	syncLocal();
}

function submit(e, callback, argument) {
	if (e.keyCode == 13 && !e.shiftKey) {
		console.log(callback);
		callback(argument);
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
		result += "<div class=\"entry\">" + entries[entry] + " " + "<a href=\"javascript:deleteEntry(\'" + entry + "\');\">(x)</a>" + "</div>";
	}
	$("#listings").get(0).innerHTML = result;
}