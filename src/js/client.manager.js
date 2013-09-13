function TaskManager() {
	this.entries = { };
	this.idGenerator = 0;
	this.seed = Date.now();
	this.user = "demo";
	this.onupdate = function() {};
}
// Generate a unique ID
TaskManager.prototype.generateID = function() {
	return Date.now() + "_" + this.seed + "_" + this.idGenerator++;
}
// Read from local storage
TaskManager.prototype.readLocal = function() {
	try {
		if (localStorage.entries == null) {
			localStorage.entries = "";
		}
		this.entries = JSON.parse(localStorage.entries);
		this.onupdate();
	} catch(ex) {
		console.log(ex);
	}
}
TaskManager.prototype.setLocal = function(entries) {
	this.entries = entries;
	this.writeLocal();
}
// Write entries to local storage
TaskManager.prototype.writeLocal = function() {
	localStorage.entries = JSON.stringify(this.entries);
}
// Add new entry
TaskManager.prototype.add = function(value) {
	var entry = {
		id: this.generateID(),
		value: value
	};
	this.entries[entry.id] = entry;
	
	this.writeLocal();
	this.serverPut(entry);
	this.onupdate();
}
// Update existing entry
TaskManager.prototype.update = function(id, value) {
	var entry = {
		id: id,
		value: value
	};
	this.entries[id] = entry;
	
	this.writeLocal();
	this.serverPut(entry);
	this.onupdate();
}
// Remove entry
TaskManager.prototype.remove = function(id) {
	delete this.entries[id];
	this.writeLocal();
	this.onupdate();
}
// Send GET request
TaskManager.prototype.serverGet = function() {
	$.ajax({
		url: 'api/',
		type: 'GET',
		data: "user="+this.user,
		success: function(result) {
			console.log(result);
		}
	});
}
// Send PUT request
TaskManager.prototype.serverPut = function(entry) {
	var entryStr = JSON.stringify(entry);
	$.ajax({
		url: 'api/',
		type: 'PUT',
		data: "user=" + this.user + "&entry="+entryStr,
		success: function(result) {
			console.log(result);
		}
	});
}
// Send DELETE request
TaskManager.prototype.serverDelete = function(id) {
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
