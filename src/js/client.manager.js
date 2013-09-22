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
		if (localStorage.entries != "") {
			this.entries = JSON.parse(localStorage.entries);
		}
		//this.onupdate();
	} catch(ex) {
		console.log("Error reading local", ex);
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
TaskManager.prototype.add = function(value, noUpdate) {
	var entry = {
		id: this.generateID(),
		time: Date.now(),
		value: value,
		x: 0,
		y: 0,
		w: 0,
		h: 0
	};
	this.entries[entry.id] = entry;
	
	this.writeLocal();
	
	if (noUpdate != true) {
		this.onupdate();
	}
	return entry;
}
// Update existing entry
TaskManager.prototype.update = function(id, value, x, y, w, h, color) {
	if (this.entries[id] != null) {
		this.entries[id].time = Date.now();
		this.entries[id].value = value;
		this.entries[id].x = x;
		this.entries[id].y = y;
		this.entries[id].w = w;
		this.entries[id].h = h;
		this.entries[id].color = color;
		
		this.writeLocal();
		this.onupdate();
		return this.entries[id];
	} else {
		console.log("Warning", "A attempt to update a non-existant entry was made", id);
		return null;
	}
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
/*
	this.entries[id].time = Date.now();
	this.entries[id].value = "";
	this.writeLocal();
	this.onupdate();*/
	this.markArchive(id);
}
