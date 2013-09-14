// Network helper class
function TaskNet() {
	this.token = "";
	this.user = "test-user";
}
TaskNet.prototype.setToken = function(token) {
	this.token = token;
}
// Convert array to object form
TaskNet.prototype.toEntries = function(input) {
	try {
		var inputObj = JSON.parse(input);
		var result = { };
		for (var i = 0; i < inputObj.length; i++) {
			var entryObj = JSON.parse(inputObj[i].value);
			entryObj.time = parseInt(entryObj.time);
			result[entryObj.id] = entryObj;
		}
		return result;
	} catch (ex) {
		console.log("Error with API", input);
	}
}
// Send GET request
TaskNet.prototype.doGet = function(callback) {
	var data = {
		token: this.token
	};
	$.ajax({
		url: "api/entry/" + this.user + "/",
		type: "GET",
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
		url: "api/entry/" + this.user + "/",
		type: "PUT",
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
		url: "api/entry/" + this.user + "/",
		type: "DELETE",
		data: data,
		success: function(result) {
			if (callback != null) {
				callback(result);
			}
		}
	});
}
