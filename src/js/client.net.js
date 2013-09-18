// Network helper class
function TaskNet() {
	this.token = "UNINIT_TOKEN";
	this.user = "UNINIT_USER";
}
// Set the authentication token
TaskNet.prototype.setToken = function(token, user) {
	this.token = token;
	if (user == null) {
		this.user = token;
	} else {
		this.user = user;
	}
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
				console.log(result);
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
// Get parameters from client URI
TaskNet.prototype.getParameters = function() {
	var result = { };
	
	var uriParams = window.location.search.substring(1);
	if (uriParams == "") {
		return result;
	}
	var params = uriParams.split("&");
	for (var i = 0; i < params.length; i++) {
		var param = params[i];
		var parts = param.split("=", 2);
		result[parts[0]] = "";
		if (parts.length > 1) {
			result[parts[0]] = parts[1];
		}
	}
	return result;
}
// Get server application version
TaskNet.prototype.getVersion = function(callback) {
	$.ajax({
		url: "api/version/",
		type: "GET",
		success: function(result) {
			if (callback != null) {
				callback(result);
			}
		}
	});
}

TaskNet.prototype.doPostAuth = function(token, callback) {
	$.ajax({
		type: 'POST',
		url: 'api/auth/',
		data: "token="+token,
		async: false,
		success: function(response) {
			console.log(response);
			callback(response);
		}
	});
}