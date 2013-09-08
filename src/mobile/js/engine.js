// Animation frame


function flush() {
	context.fillStyle = "black";
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function render() {

}

function Game() {
	this.sprites = { };
	this.blobs = { };
	this.defenses = { };
	Game.instance = this;
}
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	  window.setTimeout(callback, 1000 / 60);
	};
})();
Game.context = cv.getContext("2d");
Game.instance = null;
Game.prototype.load = function() {
	var map = new Map();
	var tileSet = new TileSet();
	tileSet.load("img/tileset.png");
	tileSet.generateIndices(32,32,416,576);
	map.name = "map";
	map.tileSet = tileSet;
	map.width = 5;
	map.height = 6;
	var mapData = [
		[68, 70, 0, 0, 0],
		[68, 84, 56, 56, 57],
		[81, 82, 82, 72, 70],
		[0, 0, 0, 68, 70],
		[0, 0, 0, 68, 70],
		[0, 0, 0, 68, 70],
	];
	map.load(mapData);
	
	this.sprites[map.name] = map;

	var path = new Path();
	path.entries[0] = {distance:0, x: 0, y: 0};
	path.entries[1] = {distance:1, x: 0, y: 1};
	path.entries[2] = {distance:2, x: 1, y: 1};
	path.entries[3] = {distance:3, x: 2, y: 1};
	path.entries[4] = {distance:4, x: 3, y: 1};
	path.entries[5] = {distance:5, x: 3, y: 2};
	path.entries[6] = {distance:6, x: 3, y: 3};
	path.entries[7] = {distance:7, x: 3, y: 4};

	var blob = new Blob();
	blob.name = "blob_1";
	blob.texture = new Image();
	blob.texture.src = "img/blob-1.png";
	blob.texture.onload = function() { blob.ready = true; };
	blob.path = path;
	this.blobs[blob.name] = blob;
	this.sprites[blob.name] = blob;
	
	var defense = new Defense();
	defense.name = "defense_1";
	defense.texture = new Image();
	defense.texture.src = "img/blob-1.png";
	defense.texture.onload = function() { defense.ready = true; };
	defense.x = 2.5;
	defense.y = 2.5;
	this.defenses[defense.name] = defense;
	this.sprites[defense.name] = defense;
}
Game.prototype.update = function() {
	for (var id in this.sprites) {
		this.sprites[id].update();
	}
	for (var id in this.defenses) {
		this.defenses[id].update(this.blobs);
	}
}
Game.prototype.draw = function() {
	for (var id in this.sprites) {
		this.sprites[id].draw();
	}
}
var z = 0;
Game.prototype.render = function() {
	this.flush();
	this.update();
	this.draw();
	var self = this;
	// Call render function again after interval
	window.requestAnimFrame(function() {
		z++;
		self.render();
	});
}
Game.prototype.flush = function() {
	Game.context.fillStyle = "black";
	Game.context.fillRect(0, 0, canvas.width, canvas.height);
}
Game.debug = function(message) {
	var debugObj = document.getElementById("debug");
	debugObj.innerHTML = message;
}
Game.debugRect = function(x, y) {
	Game.context.fillStyle = "#f00";
	Game.context.fillRect(x, y, 10, 10);
}

function Map() {
	this.tileSet = null;
	this.tiles = { };
	this.width = 0;
	this.height = 0;
}
Map.prototype.load = function(grid) {
	this.tiles = { };
	for (var i = 0; i < grid.length; i++) {
		var columns = grid[i];
		for (var j = 0; j < columns.length; j++) {
			this.tiles[j + "_" + i] = columns[j];
		}
	}
}
Map.prototype.draw = function() {
	for (var i = 0; i < this.width; i++) {
		for (var j = 0; j < this.height; j++) {
			var id = i + "_" + j;
			if (typeof(this.tiles[id]) != "undefined") {
				var x = i * Coordinates.tileWidth;
				var y = j * Coordinates.tileHeight;
				this.tileSet.draw(this.tiles[id], x, y, Coordinates.tileWidth, Coordinates.tileHeight);
			}
		}
	}
}
Map.prototype.update = function() { };

function TileSet() {
	this.texture = null;
	this.ready = false;
	this.indexOffset = 0;
	this.indices = new Array();
	this.tileWidth = 0;
	this.tileHeight = 0;
	this.offsetX = 0;
	this.offsetY = 0;
}
TileSet.prototype.load = function(texture) {
	this.texture = new Image();
	this.texture.src = texture;
	var self = this;
	this.texture.onload = function() { self.ready = true; };
}
TileSet.prototype.generateIndices = function(tileWidth, tileHeight, imageWidth, imageHeight) {
	var x = Math.floor(imageWidth/tileWidth);
	var y = Math.floor(imageHeight/tileHeight);
	this.tileWidth = tileWidth;
	this.tileHeight = tileHeight;
	var c = 0;
	for (var j = 0; j < y; j++) {
		for (var i = 0; i < x; i++) {
			this.indices[c++] = {x: i * tileWidth, y: j * tileHeight};
		}
	}
}
TileSet.prototype.draw = function(index, x, y, width, height) {
	Game.debug(this.indices[index].x + "," + y + "," + width);
	if (this.ready) {
		Game.context.drawImage(this.texture, this.indices[index].x, this.indices[index].y, this.tileWidth, this.tileHeight, x, y, width, height);
	}
}

// Static class for transforming coordinates
var Coordinates = {
	tileWidth: 32,
	tileHeight: 32
}
Coordinates.toGrid = function(x, y) {
	return {s: x/Coordinates.tileWidth, t: y/Coordinates.tileHeight};
}
// Inverse operation of toGrid.
Coordinates.toDraw = function(s, t) {
	return {x: s*Coordinates.tileWidth, y: t*Coordinates.tileHeight};
}

function Path() {
	// each entry is {start,x,y}
	this.entries = new Array();
}
Path.prototype.getPosition = function(distance) {
	for (var i = 0; i < this.entries.length; i++) {
		if (this.entries[i].distance > distance) {
			var next = this.entries[i];
			var current = this.entries[i-1];
			// interpolate
			var distanceGap = next.distance - current.distance;
			var fraction = (distance - current.distance)/distanceGap;
			var x = fraction * (next.x - current.x) + current.x;
			var y = fraction * (next.y - current.y) + current.y;
			return {x: x, y: y};
		}
	}
	if (this.entries.length > 0) {
		return {x: this.entries[this.entries.length-1].x, y: this.entries[this.entries.length-1].y};
	} else {
		return {x: 0, y: 0};
	}
}

function Blob() {
	this.texture = null;
	this.lastUpdate	= 0;
	this.pathCovered = 0;
	this.path = null;
	this.ready = false;
	// Base values
	this.x = 0;
	this.y = 0;
	this.offsetX = 16;
	this.offsetY = 16;
	this.v = 1;
	this.width = 32;
	this.height = 32;
	this.damage = 1;
	this.hp = 1;
	this.direction = 0;
	this.onHurt = function() { }; // Called if blob receive damage
	//this.setDirection(90);
}
// Update direction
Blob.prototype.setDirection = function(degrees) {
	this.direction = degrees / 180.0 * Math.Pi;
}
// Update position
Blob.prototype.update = function() {
	if (this.lastUpdate == 0) {
		this.lastUpdate = Date.now();
	}
	var v = this.getCurrentVelocity();
	//var vx = v * Math.sin(this.direction);
	//var vy = v * Math.cos(this.direction);
	var currentTime = Date.now();
	var delta = (currentTime - this.lastUpdate) / 1000;
	this.pathCovered += v * delta;
	
	var position = this.path.getPosition(this.pathCovered);
	this.x = position.x;
	this.y = position.y;
	/*
	this.x += vx * delta;
	this.y += vy * delta;
	//Game.debug(vx + "," + vy);
	*/
	
	//Game.debug(this.x + "," + this.y);
	

	this.lastUpdate = currentTime;
}
// Modify the velocity here
Blob.prototype.getCurrentVelocity = function() {
	return this.v * 1;
}
// Draw the blob
Blob.prototype.draw = function() {
	if (this.ready) {
		var position = Coordinates.toDraw(this.x, this.y);
		Game.context.drawImage(this.texture, position.x + this.offsetX, position.y + this.offsetY, this.width, this.height);
	}
}

function Defense() {
	this.texture = null;
	this.ready = false;
	this.x = 0;
	this.y = 0;
	this.offsetX = 0;
	this.offsetY = 0;
	this.width = 32;
	this.height = 32;
	this.affectRadius = 1;
	this.affectDamage = 1;
	this.cooldown = 1;
	this.lastTriggered = Date.now();
	this.onTrigger = function() { console.log("Hit something"); }; // Called if defense tower hits something
}
Defense.prototype.draw = function() {
	if (this.ready) {
		var position = Coordinates.toDraw(this.x, this.y);
		Game.context.drawImage(this.texture, position.x + this.offsetX, position.y + this.offsetY, this.width, this.height);
	}
}
Defense.prototype.affects = function(blob) {
	// Compare bounding box
	var box1 = {x1: blob.x, y1: blob.y, x2: blob.x+1, y2: blob.y+1};
	var box2 = {x1: this.x-this.affectRadius, y1: this.y-this.affectRadius, x2: this.x+this.affectRadius, y2: this.y+this.affectRadius};
	return (box1.x1 < box2.x2 && box1.x2 > box2.x1 && box1.y1 < box2.y2 && box1.y2 > box2.y1);
}
Defense.prototype.applyPenalty = function(blob) {
	if (this.affects(blob)) {
		blob.hp -= this.affectDamage;
		blob.onHurt();
		return true;
	}
	return false;
}
Defense.prototype.update = function(blobs) {
	var currentTime = Date.now();
	if (currentTime - this.lastTriggered > this.cooldown * 1000) {
		var hasHurt = false;
		for (var id in blobs) {
			if (this.applyPenalty(blobs[id])) {
				hasHurt = true;
			}
		}
		if (hasHurt) {
			this.lastTriggered = currentTime;
			this.onTrigger();
		}
	}
}

/** Init **/

var game = new Game();
game.load();
game.render();