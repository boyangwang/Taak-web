// Network helper class
function TaskNet() {
	this.token = "";
}
TaskNet.prototype.setToken = function(token) {
	this.token = token;
}
// Convert array to object form
TaskNet.prototype.toEntries = function(input) {
	var inputObj = JSON.parse(input);
	var result = { };
	for (var i = 0; i < inputObj.length; i++) {
		var entryObj = JSON.parse(inputObj[i].value);
		entryObj.time = parseInt(entryObj.time);
		result[entryObj.id] = entryObj;
	}
	return result;
}
// Send GET request
TaskNet.prototype.doGet = function(callback) {
	var data = {
		token: this.token
	};
	$.ajax({
		url: 'api/',
		type: 'GET',
		data: data,
		success: function(result) {
			if (callback != null) {
				callback(result);
			}
		}
	});
}
// Send PUT request
TaskNet.prototype.doPut = function(entries, callback, time) {
	if (time == null) {
		time = Date.now();
	}
	var data = {
		token: this.token,
		time: time,
		entries: entries
	};
	$.ajax({
		url: 'api/',
		type: 'PUT',
		data: data,
		success: function(result) {
			if (callback != null) {
				callback(result);
			}
		}
	});
}
// Send DELETE request
TaskNet.prototype.doDelete = function(entries, callback, time) {
	if (time == null) {
		time = Date.now();
	}
	var data = {
		token: this.token,
		time: time,
		entries: entries
	};
	$.ajax({
		url: 'api/',
		type: 'DELETE',
		data: data,
		success: function(result) {
			if (callback != null) {
				callback(result);
			}
		}
	});
}
