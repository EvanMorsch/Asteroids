//make pseudo-interrupt functions to be called along with event handler

class _key {
	constructor(ky,fp=true) {
		this.key = ky;
		this.status = false;
		this.triggered = false;
		this.flipFlop = fp;
	}
	poll = function(resetter=true) {
		if (this.triggered) {
			if (resetter) this.triggered = false;
			return true;
		}
		return false;
	}
	get state() {
		return this.status;
	}
	keyDown(repeat) {//repeat is true if the keypress was fired by holding the key down
		if (!(this.flipFlop && repeat)) {
			this.status = true;
			this.triggered = true;
		}
	}
	keyUp() {
		this.status = false;
	}
}

class _keyboard {
	constructor() {
		addEventListener("keydown",this.keyDown.bind(this));
		addEventListener("keyup",this.keyUp.bind(this));
		this.keys = []
	}
	keyDown(e) {
		if (!this.keys.some(a=>e.key.toLowerCase()==a.key)) this.addKey(e.key.toLowerCase())//check if the key doesnt exist already
		this.callKey(e.key.toLowerCase()).keyDown(e.repeat)
	}
	keyUp(e) {
		if (!this.keys.some(a=>e.key.toLowerCase()==a.key)) this.addKey(e.key.toLowerCase())//check if the key doesnt exist already
		this.callKey(e.key.toLowerCase()).keyUp(e.repeat)
	}
	callKey(ky) {
		if (!this.keys.some(a=>ky.toLowerCase()==a.key)) this.addKey(ky.toLowerCase())//check if the key doesnt exist already
		return this.keys.find(a=>ky==a.key)
	}
	addKey(ky,fp=false) {
		this.keys.push(new _key(ky,fp))
	}
}

class _button {
	constructor(bt) {
		this.button = bt;
		this.status = false;
		this.triggered = false;
	}
	poll(resetter=true) {
		if (this.triggered) {
			if (resetter) this.triggered = false;
			return true;
		}
		return false;
	}
	get state() {
		return this.status;
	}
	
	buttonDown(loc) {//repeat is true if the keypress was fired by holding the key down
		this.status = true;
		this.triggered = true;
		this.clickLoc = loc;
	}
	buttonUp() {
		this.status = false;
	}
}

class _mouse {
	constructor() {
		//event listners
		addEventListener("mousedown",this.buttonDown.bind(this));
		addEventListener("mouseup",this.buttonUp.bind(this));
		addEventListener("wheel",this.wheelMove.bind(this));
		addEventListener("mousemove",this.mouseMove.bind(this));
			
		this.buttons = [];
		this.dragLocations = [];
		this.loc = new _vector(0,0)//shortened so it wont interfere with getter
		this.wheel = {
			position: 0,
			delta: 0//change since last poll
		}
		this.moved = false;
		this.drag = false;
	}
	get location() {
		return this.loc
	}
	get wasMoved() {
		return this.moved||(this.moved=false)//resets and returns val
	}
	get dragging() {
		return this.drag//resets and returns val
	}
	mouseMove(e) {
		this.loc.x = e.clientX;
		this.loc.y = e.clientY;
		this.moved = true;
		if (this.buttons.some(a=>a.state)) {
			if (!this.drag) this.dragLocations = [];//reset locations if we just started dragging
			this.dragLocations.push(new _vector(this.location.x,this.location.y));
			this.drag = true;
		}
	}
	wheelMove(e) {
		this.wheel.position += e.deltaY
		this.wheel.lastDeltaY = e.deltaY;
	}
	buttonDown(e) {
		if (!this.buttons.some(a=>e.button==a.button)) this.addButton(e.button)//check if the key doesnt exist already
		this.callButton(e.button).buttonDown(this.location)
	}
	buttonUp(e) {
		if (!this.buttons.some(a=>e.button==a.button)) this.addButton(e.button)
		this.callButton(e.button).buttonUp()
		this.drag = false
	}
	callButton(bt) {
		if (!this.buttons.some(a=>bt==a.button)) this.addButton(bt)
		return this.buttons.find(a=>bt==a.button)
	}
	addButton(bt) {
		this.buttons.push(new _button(bt))
	}
}
