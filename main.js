init = function() {
	ctx.init()

	player = new _ship()
	asteroids = new Array(10).fill()//make empty array
	asteroids.forEach(function(a,b){this[b]=new _asteroid()},asteroids)//fill with different asteroids

	loop();
}

class _asteroid {
	constructor(x=0,y=0,size=3) {//size isnt exactly literal, justa scaler. 1 = 10-15px.
		var MAXSIZE = 15;//putting these here for now...
		var MINSIZE = 10;
		var MINRES = 10;
		var MAXRES = 15;
		var SPEED = 1;//max movement speed
		var ROTSPEED = 0.04//felt like a good speed (radians)
		
		this.pos = new _vector(x,y,0)//z is rotation
		var dir = Math.random()*(Math.PI*2)
		var spd = (Math.random()*SPEED)//range from speed/2,speed
		this.vel = new _vector(Math.cos(dir)*spd,Math.sin(dir)*SPEED,(Math.random()*(ROTSPEED*2))-(ROTSPEED))
		this.heightMap = new Array(Math.floor(MINRES+(Math.random()*(MAXRES-MINRES)))).fill()
		this.heightMap.forEach(function(a,b){this[b]=(Math.random()*(size*(MAXSIZE-MINSIZE)))+(MINSIZE*size)},this.heightMap)//range from (size*10)-(size*15)
	}
	update() {
		this.pos = this.pos.add(this.vel)
		if (this.pos.x>SCREENWIDTH) this.pos.x-=SCREENWIDTH;
		if (this.pos.x<0) this.pos.x+=SCREENWIDTH;
		if (this.pos.y>SCREENHEIGHT) this.pos.y-=SCREENHEIGHT;
		if (this.pos.y<0) this.pos.y+=SCREENHEIGHT;
	}
	draw() {
		ctx.setColor("white")
		ctx.beginPath()
		this.heightMap.forEach(function(a,b) {
			b==0?ctx.moveTo(this.getLoc(b).x,this.getLoc(b).y):ctx.lineTo(this.getLoc(b).x,this.getLoc(b).y)
		},this)
		ctx.closePath()
		ctx.stroke()
	}
	getLoc(i) {
		return new _vector(this.pos.x+(Math.cos(((Math.PI*2)*(i/this.heightMap.length))+this.pos.z)*this.heightMap[i]),
							this.pos.y+(Math.sin(((Math.PI*2)*(i/this.heightMap.length))+this.pos.z)*this.heightMap[i]) )
	}
}

class _ship {
	constructor(x=(SCREENWIDTH/2),y=(SCREENHEIGHT/2)) {
		this.pos = new _vector(x,y,0)//using the z as rotation
		this.vel = new _vector(0,0,0)
		this.acc = new _vector(0,0,0)
	}
	update() {
		this.pos = this.pos.add(this.vel)
	}
	draw() {
		ctx.setColor("white")
		ctx.fillRect(this.pos.x,this.pos.y,3,3)
	}
}

update = function() {
	player.update()
	asteroids.forEach(a=>a.update())
}

draw = function() {
	ctx.clearScreen()
	player.draw()
	asteroids.forEach(a=>a.draw())
}

loop = function() {
	requestAnimationFrame(loop)
	update()
	draw()
}

window.onload = init;
