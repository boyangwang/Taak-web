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
	//try {
		if (localStorage.entries == null) {
			localStorage.entries = "";
		}
		if (localStorage.entries != "") {
			this.entries = JSON.parse(localStorage.entries);
		}
		//this.onupdate();
	/*} catch(ex) {
		console.log(ex);
	}*/
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
		time: Date.now(),
		value: value
	};
	this.entries[entry.id] = entry;
	
	this.writeLocal();
	this.onupdate();
	return entry;
}
// Update existing entry
TaskManager.prototype.update = function(id, value) {
	this.entries[id].time = Date.now();
	this.entries[id].value = value;
	
	this.writeLocal();
	this.onupdate();
}
// Update existing entry
TaskManager.prototype.markArchive = function(id) {
	this.entries[id].time = Date.now();
	this.entries[id].archive = true;
	
	this.writeLocal();
	this.onupdate();
}
// Remove entry
TaskManager.prototype.remove = function(id) {
	this.entries[id].time = Date.now();
	this.entries[id].value = "";
	this.writeLocal();
	this.onupdate();
}
