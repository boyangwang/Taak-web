// Animation frame
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
	  window.setTimeout(callback, 1000 / 60);
	};
})();

function Game() {
	this.sprites = { };
	this.blobs = { };
	this.defenses = { };
	Game.instance = this;
	this.paths = { };
	this.template = { };
	this.rounds = new Array();
	Game.input.addListener("mousedown", this.onMouseDown());
}
Game.prototype.onMouseDown = function() {
	var self = this;
	return function(data) {
		self.handleMouseDown(data);
	};
}
Game.prototype.resize = function() {
	var aspectRatio = 16/9;
	var baseWidth = 800;
	var baseHeight = 600;
}
Game.canvas = cv;
Game.context = cv.getContext("2d");
Game.instance = null;
Game.input = new Input(cv);
Game.idGen = 0;
// Set ready state for arbitrary sprite object
Game.prototype.preload = function(obj) {
	obj.texture.onload = function() {
		obj.ready = true;
	}
}
Game.prototype.handleMouseDown = function(data) {
	var gridCoordinate = Coordinates.toGrid(data.x, data.y);
	this.addTower({template:"turret_1"},gridCoordinate);
}
Game.prototype.addBlob = function(data, position) {
	var currentTime = Date.now();
	var mob = new Blob();
	var template = this.template[data.template];
	mob.name = "mob_" + Game.idGen++;
	mob.texture = new Image();
	this.preload(mob);
	mob.texture.src = template.texture;
	mob.path = this.paths[data.path];
	if (data.spawn != null) {
		mob.spawnTime = currentTime + data.spawn;
	} else {
		mob.spawnTime = currentTime;
	}
	if (position != null) {
		mob.x = position.x;
		mob.y = position.y;
	}
	this.blobs[mob.name] = mob;
}
Game.prototype.addTower = function(data, position) {
	var defense = new Defense();
	var template = this.template[data.template];
	console.log(this.template);
	defense.name = "defense_" + Game.idGen++;
	defense.texture = new Image();
	this.preload(defense);
	defense.texture.src = template.texture;
	defense.x = position.x;
	defense.y = position.y;
	this.defenses[defense.name] = defense;
}
Game.prototype.loadRounds = function(file, callback) {
	this.blobs = { };
	var self = this;

	$.getJSON(file, function(data) {
		self.paths = data.paths;
		self.template = data.template;
		self.rounds = data.rounds;
		console.log(self);
		callback();
	});
}
Game.prototype.loadRound = function(roundNumber) {
	var self = this;
	var mobs = this.rounds[roundNumber];
	
	for (var i = 0; i < mobs.length; i++) {
		this.addBlob(mobs[i]);
	}
}
Game.prototype.load = function() {
	var map = new Map();
	map.loadTMXfile("map.json");
	
	this.sprites[map.name] = map;

	var self = this;
	this.loadRounds("round.json", function() {
		// Test data here
		self.addTower({template:"turret_1"},{x:2.5,y:1.5});
		self.addTower({template:"turret_2"},{x:4.5,y:1.5});
	});
	
}
Game.prototype.update = function() {
	for (var id in this.blobs) {
		//this.sprites[id].update();
		this.blobs[id].update(this.blobs);
	}
	for (var id in this.defenses) {
		this.defenses[id].update(this.blobs);
	}
}
Game.prototype.draw = function() {
	for (var id in this.sprites) {
		this.sprites[id].draw();
	}
	for (var id in this.blobs) {
		this.blobs[id].draw();
	}
	for (var id in this.defenses) {
		this.defenses[id].draw();
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
	this.tileWidth = 0;
	this.tileHeight = 0;
}
Map.prototype.loadTMXfile = function(file) {
	var self = this;
	$.getJSON(file, function(data) {
		self.loadTMX(data);
	});
}
Map.prototype.loadTMX = function(data) {
	this.width = data.width;
	this.height = data.height;
	this.tileHeight = data.tileheight;
	this.tileWidth = data.tilewidth;
	this.tileSet = new TileSet();
	this.tileSet.loadTMXSet(data.tilesets);
	this.loadTMXGrid(data.layers[0]);
	//console.log(data);
	//console.log(this);
}
Map.prototype.loadTMXGrid = function(grid) {
	this.tiles = { };
	var c = 0;
	for (var i = 0; i < grid.height; i++) {
		for (var j = 0; j < grid.width; j++) {
			this.tiles[j + "_" + i] = grid.data[c++];
		}
	}
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
	this.first = 0;
	this.texture = { };
	//this.ready = false;
	this.indexOffset = 0;
	this.indices = { };
	this.tileWidth = 0;
	this.tileHeight = 0;
	this.offsetX = 0;
	this.offsetY = 0;
}
TileSet.prototype.loadTMXSet = function(data) {
	for (var i = 0; i < data.length; i++) {
		var setData = data[i];
		this.first = setData.firstgid;
		this.load(setData.image);
		this.generateIndices(setData.tilewidth, setData.tileheight, setData.imagewidth, setData.imageheight);
	}
}
TileSet.prototype.load = function(texture) {
	this.texture[this.first] = new Image();
	this.texture[this.first].src = texture;
	var self = this.texture[this.first];
	this.texture[this.first].onload = function() { self.ready = true; };
}
TileSet.prototype.generateIndices = function(tileWidth, tileHeight, imageWidth, imageHeight) {
	var x = Math.floor(imageWidth/tileWidth);
	var y = Math.floor(imageHeight/tileHeight);
	this.tileWidth = tileWidth;
	this.tileHeight = tileHeight;
	var c = this.first;
	for (var j = 0; j < y; j++) {
		for (var i = 0; i < x; i++) {
			this.indices[c++] = {x: i * tileWidth, y: j * tileHeight, first: this.first};
		}
	}
}
TileSet.prototype.draw = function(index, x, y, width, height) {
	//Game.debug(this.indices[index].x + "," + y + "," + width);
	var tile = this.indices[index];
	if (tile != null) {
		if (this.texture[tile.first].ready) {
			Game.context.drawImage(this.texture[tile.first], tile.x, tile.y, this.tileWidth, this.tileHeight, x, y, width, height);
		}
	}
}

// Static class for transforming coordinates
var Coordinates = {
	tileWidth: 85,
	tileHeight: 85
}
Coordinates.toGrid = function(x, y) {
	return {x: x/Coordinates.tileWidth, y: y/Coordinates.tileHeight};
}
// Inverse operation of toGrid.
Coordinates.toDraw = function(s, t) {
	return {x: s*Coordinates.tileWidth, y: t*Coordinates.tileHeight};
}

/*
function Path() {
	// each entry is {start,x,y}
	this.entries = new Array();
}
*/
Path = { };
Path.getPosition = function(path, distance) {
	var entries = path.entries;
	for (var i = 0; i < entries.length; i++) {
		if (entries[i].distance > distance) {
			var next = entries[i];
			var current = entries[i-1];
			// interpolate
			var distanceGap = next.distance - current.distance;
			var fraction = (distance - current.distance)/distanceGap;
			var x = fraction * (next.x - current.x) + current.x;
			var y = fraction * (next.y - current.y) + current.y;
			var direction = Math.atan2((next.y - current.y),(next.x - current.x));
			return {x: x + path.offset.x, y: y + path.offset.y, dir: direction};
		}
	}
	if (entries.length > 0) {
		return {x: entries[entries.length-1].x + path.offset.x, y: entries[entries.length-1].y + path.offset.y, dir: 0};
	} else {
		return {x: 0 + path.offset.x, y: 0 + path.offset.y, dir: 0};
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
	this.offsetX = 0;
	this.offsetY = 0;
	this.v = 1;
	this.width = 80; //32
	this.height = 80; //32
	this.damage = 1;
	this.hp = 1;
	this.direction = 0;
	this.spawnTime = 0;
	this.visible = false;
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

	//var vx = v * Math.sin(this.direction);
	//var vy = v * Math.cos(this.direction);
	var currentTime = Date.now();
	
	if (this.spawnTime > currentTime) {
		// Delay update till actually spawned
		this.lastUpdate = currentTime;
		return;
	}
	this.visible = true;
	
	var v = this.getCurrentVelocity();
	var delta = (currentTime - this.lastUpdate) / 1000;
	this.pathCovered += v * delta;
	
	var position = Path.getPosition(this.path, this.pathCovered);
	this.x = position.x;
	this.y = position.y;
	this.direction = position.dir;

	this.lastUpdate = currentTime;
	
}
// Modify the velocity here
Blob.prototype.getCurrentVelocity = function() {
	return this.v * 1;
}
// Draw the blob
Blob.prototype.draw = function() {
	if (this.ready && this.visible) {
		var position = Coordinates.toDraw(this.x, this.y);
		Game.context.save();
		Game.context.translate(position.x + this.offsetX, position.y + this.offsetY);
		Game.context.rotate(this.direction);
		Game.context.drawImage(this.texture, -this.width/2, -this.height/2, this.width, this.height);
		Game.context.restore();
		
		//Game.debugRect(position.x, position.y);
	}
}

function Defense() {
	this.texture = null;
	this.ready = false;
	this.x = 0;
	this.y = 0;
	this.offsetX = 0;
	this.offsetY = 0;
	this.width = 80;//32
	this.height = 80;//32
	this.affectRadius = 1;
	this.affectDamage = 1;
	this.cooldown = 1;
	this.direction = 0;
	this.lastTriggered = Date.now();
	this.onTrigger = function() { console.log("Hit something"); }; // Called if defense tower hits something
}
Defense.prototype.draw = function() {
	if (this.ready) {
		var position = Coordinates.toDraw(this.x, this.y);
		Game.context.save();
		Game.context.translate(position.x + this.offsetX, position.y + this.offsetY);
		Game.context.rotate(this.direction);
		Game.context.drawImage(this.texture, -this.width/2, -this.height/2, this.width, this.height);
		Game.context.restore();
		
		//Game.debugRect(position.x, position.y);
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
Defense.prototype.faceMob = function(blob) {
	// Rotate to face mob
	var diffX = blob.x - this.x;
	var diffY = blob.y - this.y;
	this.direction = Math.atan2(diffY, diffX);
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
	for (var id in blobs) {
		if (this.affects(blobs[id])) {
			this.faceMob(blobs[id]);
			break;
		}
	}
}

/** Init **/

var game = new Game();
game.load();
game.render();

/** Interface **/
function loadRound(number) {
	game.loadRound(number);
}