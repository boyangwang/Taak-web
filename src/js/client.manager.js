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
// Update existing entry
TaskManager.prototype.update = function(id, value, x, y, w, h, color, metadata, labels) {
	if (this.entries[id] != null) {
		this.entries[id].time = Date.now();
		if (value != null) {
			this.entries[id].value = value;
		}
		if (x != null) {
			this.entries[id].x = x;
		}
		if (y != null) {
			this.entries[id].y = y;
		}
		if (w != null) {
			this.entries[id].w = w;
		}
		if (h != null) {
			this.entries[id].h = h;
		}
		if (color != null) {
			this.entries[id].color = color;
		}
		if (metadata != null) {
			this.entries[id].metadata = metadata;
		}
		if (labels != null) {
			if (typeof this.entries[id].labels == "undefined") //[NEW_>_ver0.34] Need to check entries[id].labels because older versions don't have it. Can remove when people are no longer using client ver0.34.
				this.entries[id].labels = new Labels();
			for (var name in labels)
				this.entries[id].labels[name] = labels[name];
		}
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