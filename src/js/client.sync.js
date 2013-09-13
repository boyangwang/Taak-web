function TaskSync() {
	this.localCopy = new Array();
	this.workingCopy = new Array();
	this.remoteCopy = new Array();
	this.pendingPUT = { };
	this.pendingDELETE = { };
	this.net = new TaskNet();
	this.net.token = "";
	this.online = false;
	this.latestTransaction = 0;
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
	this.workingCopy.length = 0;
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
				//console.log(localEntry.time, remoteEntry.time, (localEntry.time >= remoteEntry.time));
				if (localEntry.time >= remoteEntry.time) {
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
	//console.log("Working", this.workingCopy);
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
			var mergeTime = merged[i].time;
			var remoteTime = this.remoteCopy[remoteCounter].time;
			if (mergeTime == null) { merged[i].time = 0; };
			if (remoteTime == null) {  this.remoteCopy[remoteCounter].time = 0; };
			remoteCounter++;
			if (mergeTime > remoteTime) {
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
		//if (merged[i].value != null && merged[i].value != "") {
			result[merged[i].id] = merged[i];
		//}
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
// Check if both sets are identical
TaskSync.prototype.isEqual = function(setA, setB) {
	for (var entry in setA) {
		if (typeof(setB[entry]) == "undefined") {
			// set B do not have entry
			return false;
		}
		if (setA[entry].time != setB[entry].time) {
			// time stamps are different
			return false;
		}
	}
	// Check other direction
	for (var entry in setB) {
		if (typeof(setA[entry]) == "undefined") {
			// set A do not have entry
			return false;
		}
		if (setA[entry].time != setB[entry].time) {
			// time stamps are different
			return false;
		}
	}
	return true;
}
// Perform all synchronization steps
TaskSync.prototype.performSynchronize = function(manager, callback) {
	if (this.online) {
		manager.readLocal();
		var localCopy = manager.entries;
		
		var sync = this;
		this.net.doGet(function(remoteCopy) {
			remoteCopy = sync.net.toEntries(remoteCopy);
			//console.log("Local", localCopy);
			//console.log("Remote", remoteCopy);
			
			sync.setLocal(localCopy);
			sync.setRemote(remoteCopy);
			var syncCopy = sync.synchronize();
			console.log("Sync", syncCopy);
			//console.log("Pend put", sync.pendingPUT);
			//console.log("Pend delete", sync.pendingDELETE);
			var hasPUTs = false;
			for (var entry in sync.pendingPUT) {
				hasPUTs = true;
				break;
			}
			manager.setLocal(syncCopy);
			if (!hasPUTs) {
				// Nothing to send to server, update own copy
				// TODO: Update only if got changes to local copy
				//manager.setLocal(syncCopy);
				console.log(manager.entries);
				if (!sync.isEqual(localCopy, syncCopy)) {
					if (callback != null) {
						callback();
					}
				}
			} else {
				// Wait for response from server, then update copy
				sync.lastTransaction = "" + Date.now();
				sync.net.doPut(sync.pendingPUT, sync.synchronizeCallback(syncCopy, manager, callback), sync.lastTransaction);
			}
		});
	} else {
		// Callback already called before the synchronization (short-circuit update used for improving app responsiveness)
		//callback();
	}
}
//localStorage.entries = ""; // reset local storage
// Called on successful synchronization
TaskSync.prototype.synchronizeCallback = function(synchronizeCopy, manager, callback) {
	var sync = this;
	return function(data) {
		if (data != "") {
			var response = JSON.parse(data);
			console.log(response);
			var transactionTime = response.time;
			console.log(transactionTime, sync.lastTransaction);
			if (transactionTime == sync.lastTransaction) {
				// Only use latest transaction to prevent abrupt desynchronization
				//manager.setLocal(synchronizeCopy);
				console.log("Synchronize success");
				if (callback != null) {
					callback();
				}
			}
		} else {
			console.log("Error on API");
		}
	}
}

// Export for mocha unit test
if (typeof(global) != "undefined") {
	global.TaskSync = TaskSync;
}