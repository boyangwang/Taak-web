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
	} catch(ex) {
		console.log("Error reading local", ex);
		this.entries = { };
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
TaskManager.prototype.add = function(dflow, value, noUpdate) {
	var entry = {
		id: this.generateID(),
		time: Date.now(),
		value: value,
		x: 0,
		y: 0,
		w: 0,
		h: 0,
		color: "",
		metadata: "",
		dataflow: dflow,
		labels: new Labels() //A newly created entry should not be done or archived yet.
	};
	this.entries[entry.id] = entry;
	
	this.writeLocal();
	
	if (noUpdate != true) {
		this.onupdate();
	}
	return entry;
}
// Update attribute of existing entry
// id: ID of task, parameter: Parameter of task, value: Value of parameter, doUpdate: is set to true, do sync
TaskManager.prototype.updateAttribute = function(id, parameter, value, doUpdate) {
	if (this.entries[id] != null) {
		if (parameter != null && value != null) {
			this.entries[id][parameter] = value;
		}
		if (doUpdate) {
			this.writeLocal();
			this.onupdate();
			console.log("Attribute Update", this.entries[id]);
		}
		return this.entries[id];
	} else {
		console.log("Warning", "A attempt to update a non-existant entry was made", id);
		return null;
	}
}
// Get attribute of existing entry
TaskManager.prototype.getAttribute = function(id, parameter) {
	if (this.entries[id] != null) {
		return this.entries[id][parameter];
	} else {
		console.log("Warning", "A attempt to update a non-existant entry was made", id);
		return null;
	}
}
// Update existing entry
TaskManager.prototype.update = function(id, value, x, y, w, h, color, metadata) {
	if (this.entries[id] != null) {
		this.updateAttribute(id, "value", value);
		this.updateAttribute(id, "x", x);
		this.updateAttribute(id, "y", y);
		this.updateAttribute(id, "w", w);
		this.updateAttribute(id, "h", h);
		this.updateAttribute(id, "color", color);
		this.updateAttribute(id, "metadata", metadata);
		this.writeLocal();
		this.onupdate();
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
	this.markArchive(id);
}
// Perform synchronization operation
TaskManager.prototype.doSync = function() {
	this.onupdate();
}

// Labels class
function Labels(){ //A newly created entry should not be done or archived yet.
	this.done = false;
	this.archived = false;
}