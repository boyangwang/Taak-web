function Input(target) {
	this.listeners = { };
	this.startX = 0;
	this.startY = 0;
	this.x = 0;
	this.y = 0;
	var self = this;
	target.onselectstart = function(e) {
		return false;
	};
	target.oncontextMenu = function(e) {
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	target.addEventListener("mousedown", function(e) {
		self.startX = e.pageX - target.offsetLeft;
		self.startY = e.pageY - target.offsetTop;
		self.dispatch("mousedown", {x: self.startX, y: self.startY});
	}, true);
}
Input.prototype.addListener = function(event, listener) {
	this.listeners[event] = listener;
}
Input.prototype.dispatch = function(event, data) {
	this.listeners[event](data);
}
