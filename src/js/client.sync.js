function TaskSync() {
	this.localCopy = new Array();
	this.workingCopy = new Array();
	this.remoteCopy = new Array();
	this.pendingPUT = { };
	this.pendingDELETE = { };
	this.net = new TaskNet();
	this.net.token = "";
}
// Fetch token from local storage
TaskSync.prototype.getToken = function() {
	if (localStorage.token == null) {
		localStorage.token = "token_" + Date.now();
	}
	this.net.token = localStorage.token;
}
// Set the local copy (usually from localStorage)
TaskSync.prototype.setLocal = function(localCopy) {
	this.localCopy.length = 0;
	for (var entry in localCopy) {
		this.localCopy.push(localCopy[entry]);
	}
	this.localCopy.sort(this.compareEntry);
}
// Set the remote copy (usually after getting it from server via GET)
TaskSync.prototype.setRemote = function(remoteCopy) {
	this.remoteCopy.length = 0;
	for (var entry in remoteCopy) {
		this.remoteCopy.push(remoteCopy[entry]);
	}
	this.remoteCopy.sort(this.compareEntry);
}
// Use for array sort comparator
TaskSync.prototype.compareEntry = function(a, b) {
	if (a.id < b.id) {
		return -1;
	} else {
		return 1;
	}
}
TaskSync.prototype.merge = function() {
	// Make clones of arrays
	var localClone = this.localCopy.slice(0);
	var remoteClone = this.remoteCopy.slice(0);
	
	// Perform merging (similar algorithm to merge sort)
	while (this.localCopy.length > 0) {
		var localEntry = null;
		if (this.localCopy.length > 0) {
			localEntry = this.localCopy.pop();
		}
		var remoteEntry = null;
		if (this.remoteCopy.length > 0) {
			remoteEntry = this.remoteCopy.pop();
		}
		if (localEntry != null && remoteEntry != null) {
			if (localEntry.id == remoteEntry.id) {
				// Same entry, check last modified time
				if (localEntry.time > remoteEntry.time) {
					this.workingCopy.push(localEntry);
				} else {
					this.workingCopy.push(remoteEntry);
				}
				continue;
			}
		}
		if (localEntry != null) {
			this.workingCopy.push(localEntry);
		}
		if (remoteEntry != null) {
			this.workingCopy.push(remoteEntry);
		}
	}
	// Copy remaining part of remote copy
	while (this.remoteCopy.length > 0) {
		this.workingCopy.push(this.remoteCopy.pop());
	}
	
	// Restore clones
	this.localCopy = localClone;
	this.remoteCopy = remoteClone;
	this.workingCopy.sort(this.compareEntry);
	return this.workingCopy;
}
// Perform client-side synchronization, returns synchronized data
// Note: Network synchronization is not performed by this function
// The result from this function should only be used after network synchronization is completed
TaskSync.prototype.synchronize = function() {
	// Empty pending queues
	this.pendingPUT = { };
	this.pendingDELETE = { };
	var merged = this.merge();
	var remoteCounter = 0;
	for (var i = 0; i < merged.length; i++) {
		if (remoteCounter >= this.remoteCopy.length) {
			// Rest of merged entries are new
			this.queuePUT(merged[i]);
			continue;
		}
		if (merged[i].id != this.remoteCopy[remoteCounter].id) {
			// Entry does not exist on server
			this.queuePUT(merged[i]);
		} else {
			if (merged[i].time > this.remoteCopy[remoteCounter++].time) {
				// Entry is newer than server
				// Note: If entry.value = "", it is treated as deletion by server
				this.queuePUT(merged[i]);
				if (merged[i].value == "") {
					this.queueDELETE(merged[i]);
				}
			}
		}
		merged[i].sync = true;
	}
	return this.truncate(merged);
}
// Truncate empty/deleted entries and convert to object form
TaskSync.prototype.truncate = function(merged) {
	var result = { };
	for (var i = 0; i < merged.length; i++) {
		if (merged[i].value != null && merged[i].value != "") {
			result[merged[i].id] = merged[i];
		}
	}
	return result;
}
// Queue PUT request
TaskSync.prototype.queuePUT = function(entry) {
	this.pendingPUT[entry.id] = entry;
}
// Queue DELETE request
TaskSync.prototype.queueDELETE = function(entry) {
	this.pendingDELETE[entry.id] = entry;
}
// Perform all synchronization steps
TaskSync.prototype.performSynchronize = function(manager) {
	manager.readLocal();
	var localCopy = manager.entries;
	var remoteCopy = net.doGet();
	this.setLocal(localCopy);
	this.setRemote(remoteCopy);
	var syncCopy = sync.synchronize();
	// TODO: use this.pendingPUT instead of syncCopy
	this.net.doPut(syncCopy, this.synchronizeCallback(syncCopy));
}
// Called on successful synchronization
TaskSync.prototype.synchronizeCallback = function(synchronizeCopy, manager) {
	return function(data) {
		if (data != "") {
			manager.setLocal(synchronizeCopy);
			console.log("Synchronize success");
		}
	}
}

// Export for mocha unit test
if (typeof(global) != "undefined") {
	global.TaskSync = TaskSync;
}