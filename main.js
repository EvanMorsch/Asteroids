//flight assist meter and control
//do a once-over and organize everything
	//move constants to settings if possible
	//comment
//particles
//collision
	//(find the angle of collision and interpolate between the two HM heights. this will provide a distance of collision, the othe bodies can use circles as hitboxes)
	//pause on collide for debugging
//move constants to a settings object (practice implementing pseudo-constants)
//aim asteroids at points on screen so they all swarm in the beginning

init = function() {
	ctx.init()
	keyboard = new _keyboard();
	keyboard.addKey(" ",true)

	player = new _ship()
	asteroids = new Array(10).fill()//make empty array
	asteroids.forEach(function(a,b){this[b]=new _asteroid()},asteroids)//fill with different asteroids
	bullets = []

	loop();
}

class _asteroid {
	constructor(x=Math.round(Math.random())*SCREENWIDTH,y=Math.round(Math.random())*SCREENHEIGHT,size=3) {//size isnt exactly literal, justa scaler. 1 = 10-15px.
		this.MAXSIZE = 15*size;//putting these here for now... probably shoudl make them consts somewhere else later
		this.MINSIZE = 10*size;
		this.MINRES = 10;//amount of peaks
		this.MAXRES = 15;
		this.SPEED = 1;//max movement speed
		this.ROTSPEED = 0.04//felt like a good speed (radians)
		this.active = true
		
		this.pos = new _vector(x,y,0)//z is rotation
		var dir = Math.random()*(Math.PI*2)
		var spd = (Math.random()*this.SPEED)//range from speed/2,speed
		this.vel = new _vector(Math.cos(dir)*spd,Math.sin(dir)*spd,(Math.random()*(this.ROTSPEED*2))-(this.ROTSPEED))
		this.heightMap = new Array(Math.floor(this.MINRES+(Math.random()*(this.MAXRES-this.MINRES)))).fill()
		this.heightMap.forEach(function(a,b){this.heightMap[b]=(Math.random()*(this.MAXSIZE-this.MINSIZE))+(this.MINSIZE)},this)//range from (size*10)-(size*15)
	}
	update() {
		this.pos = this.pos.add(this.vel)
		if (this.pos.x>(SCREENWIDTH+this.MAXSIZE)) this.pos.x-=SCREENWIDTH+(this.MAXSIZE*2);
		if (this.pos.x<(0-this.MAXSIZE)) this.pos.x+=SCREENWIDTH+(this.MAXSIZE*2);
		if (this.pos.y>(SCREENHEIGHT+this.MAXSIZE)) this.pos.y-=SCREENHEIGHT+(this.MAXSIZE*2);
		if (this.pos.y<(0-this.MAXSIZE)) this.pos.y+=SCREENHEIGHT+(this.MAXSIZE*2);
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
		this.THRUST = 0.1;//force applied when engines are on
		this.SIZE = 10
		this.MAXSPEED = 5
		this.MUZZLEVELOCITY = 10
		this.RELOADSPEED = 100//milliseconds
		this.MAXROT = 0.1;
		this.ROTSPEED = 0.004
		this.ROTFRICTION = 5;//speed at which we slow as compared to accelerate
	
		this.pos = new _vector(x,y,0)//using the z as rotation
		this.vel = new _vector(0,0,0)
		this.acc = new _vector(0,0,0)
		this.lastFire = -Infinity//last time of fire
		this.THRUSTINGFORWARD = false//tracks whether to play the thrust animation
		this.ROTATING = false;
		this.flightAssist = 1;//0-1
	}
	update() {
		if (keyboard.callKey(" ").poll()) this.shoot()
	
		if (keyboard.callKey("w").state) {
			this.thrust(1)
		} else if (keyboard.callKey("s").state) {
			this.thrust(-1)
		} else {
			this.thrust(0)
			if (Math.distance(this.vel,{x:0,y:0})!=0) {
				if (this.flightAssist>=1) this.slow()//slow us down if neot thrusting
			}
		}
		if (this.flightAssist>=0.75) this.limitVel()//it was hard to limit the thrust, so just correct any overages here
	
		if (keyboard.callKey("d").state) {
			this.rotate(1)
		} else if (keyboard.callKey("a").state) {
			this.rotate(-1)
		} else {
			if (Math.abs(this.vel.z)>0 && this.flightAssist>=0.25) {//if needed, slow down
				this.rotate(-this.ROTFRICTION*(Math.sqrt(Math.abs(this.vel.z))*(this.vel.z/Math.abs(this.vel.z))))
			} else {this.rotate(0)}
		}
		if (this.flightAssist>=0.5) this.limitRot()
		//update vel and pos
		this.vel = this.vel.add(this.acc)
		this.pos = this.pos.add(this.vel)
		//keep on screen
		if (this.pos.x>(SCREENWIDTH+this.SIZE)) this.pos.x-=(SCREENWIDTH+this.SIZE);
		if (this.pos.x<(0-this.SIZE)) this.pos.x+=(SCREENWIDTH+this.SIZE);
		if (this.pos.y>(SCREENHEIGHT+this.SIZE)) this.pos.y-=(SCREENHEIGHT+this.SIZE);
		if (this.pos.y<(0-this.SIZE)) this.pos.y+=(SCREENHEIGHT+this.SIZE);
	}
	shoot() {
		if ((Date.now()-this.lastFire)>this.RELOADSPEED) {//check if heve cooled down enough
			bullets.push(new _bullet(this.pos.x,this.pos.y,this.vel.x+(Math.cos(this.pos.z)*this.MUZZLEVELOCITY),this.vel.y+(Math.sin(this.pos.z)*this.MUZZLEVELOCITY)))
			this.lastFire = Date.now()//update cooldown time
		}
	}
	slow() {//slow down the positional velocity
		if (this.vel.x!=0) this.acc.x = -0.05*(Math.sqrt(Math.abs(this.vel.x))*(this.vel.x/Math.abs(this.vel.x)))
		if (this.vel.y!=0) this.acc.y = -0.05*(Math.sqrt(Math.abs(this.vel.y))*(this.vel.y/Math.abs(this.vel.y)))
	}
	limitVel() {//normalize to the max speed
		var cs = Math.distance(this.vel,{x:0,y:0})//current speed
		var dir = Math.atan2(this.vel.y,this.vel.x)
		this.vel.x = Math.cos(dir)*Math.min(this.MAXSPEED,cs)
		this.vel.y = Math.sin(dir)*Math.min(this.MAXSPEED,cs)
	}
	limitRot() {
		if (this.vel.z == 0) return
		var dir = this.vel.z/Math.abs(this.vel.z)
		this.vel.z = Math.min(this.MAXROT,Math.abs(this.vel.z))*dir
	}
	rotate(modifier) {
		this.ROTATING = modifier
		this.acc.z = this.ROTSPEED*modifier
	}
	thrust(modifier) {
		this.THRUSTINGFORWARD = modifier>0
		this.acc.x = Math.cos(this.pos.z)*(this.THRUST*modifier)
		this.acc.y = Math.sin(this.pos.z)*(this.THRUST*modifier)
	}
	draw() {
		ctx.setColor("white")
		//draw ship itself
		ctx.beginPath()
		ctx.moveTo(this.pos.x+(Math.cos(this.pos.z)*this.SIZE),this.pos.y+(Math.sin(this.pos.z)*this.SIZE))
		ctx.lineTo(this.pos.x+(Math.cos(this.pos.z+2.25)*this.SIZE),this.pos.y+(Math.sin(this.pos.z+2.25)*this.SIZE))
		ctx.lineTo(this.pos.x,this.pos.y)
		ctx.lineTo(this.pos.x+(Math.cos(this.pos.z-2.25)*this.SIZE),this.pos.y+(Math.sin(this.pos.z-2.25)*this.SIZE))
		ctx.closePath();
		ctx.stroke()
		
		//draw flame
		if (this.THRUSTINGFORWARD) {//is engine thrusting forward?
			var cs = (Math.random()*(this.SIZE*0.5))+(this.SIZE*1.5)//1.5 is flame size, 0.5 is the amount of jitter
			ctx.beginPath()
			ctx.moveTo(this.pos.x+(Math.cos(this.pos.z+2.25)*(this.SIZE/2)),this.pos.y+(Math.sin(this.pos.z+2.25)*(this.SIZE/2)))
			ctx.lineTo(this.pos.x-(Math.cos(this.pos.z)*cs),this.pos.y-(Math.sin(this.pos.z)*cs))
			ctx.lineTo(this.pos.x+(Math.cos(this.pos.z-2.25)*(this.SIZE/2)),this.pos.y+(Math.sin(this.pos.z-2.25)*(this.SIZE/2)))
			ctx.stroke()
		}
		//draw rotating thruster
		if (Math.abs(this.ROTATING)>0.1) {//is engine thrusting at all?
			var sp = this.ROTATING<0?//decide where the starting point is
				{	x:this.pos.x+(Math.cos(this.pos.z+2.25)*(this.SIZE)),
					y:this.pos.y+(Math.sin(this.pos.z+2.25)*(this.SIZE))}
				:{	x:this.pos.x+(Math.cos(this.pos.z-2.25)*(this.SIZE)),
					y:this.pos.y+(Math.sin(this.pos.z-2.25)*(this.SIZE))}
			ctx.beginPath()
			ctx.moveTo(sp.x,sp.y)
			ctx.lineTo(sp.x+(Math.cos(this.pos.z-0.5)*(this.SIZE*-0.3)),sp.y+(Math.sin(this.pos.z-0.5)*(this.SIZE*-0.3)))
			ctx.lineTo(sp.x+(Math.cos(this.pos.z+0.5)*(this.SIZE*-0.3)),sp.y+(Math.sin(this.pos.z+0.5)*(this.SIZE*-0.3)))
			ctx.closePath()
			ctx.stroke()
		}
		
		//draw reload meter
		ctx.fillText("Re"+(((Date.now()-this.lastFire)/this.RELOADSPEED<1)?"loading...":"ady to fire!"),0,8)
		ctx.strokeRect(0,10,100,10)
		ctx.fillRect(0,10,(Math.min((Date.now()-this.lastFire)/this.RELOADSPEED,1))*100,10)
	}
}

class _bullet {
	constructor(x=0,y=0,vx=1,vy=1) {
		this.SIZE = 2
		this.active = 50
		this.pos = new _vector(x,y)
		this.vel = new _vector(vx,vy)
		this.birthTime = Date.now()
	}
	update() {
		this.active--
		this.pos = this.pos.add(this.vel)
		if (this.pos.x>(SCREENWIDTH+this.SIZE)) this.pos.x-=SCREENWIDTH+(this.SIZE*2);
		if (this.pos.x<(0-this.SIZE)) this.pos.x+=SCREENWIDTH+(this.SIZE*2);
		if (this.pos.y>(SCREENHEIGHT+this.SIZE)) this.pos.y-=SCREENHEIGHT+(this.SIZE*2);
		if (this.pos.y<(0-this.SIZE)) this.pos.y+=SCREENHEIGHT+(this.SIZE*2);
	}
	draw() {
		ctx.setColor("white")
		ctx.strokeCircle(this.pos.x,this.pos.y,this.SIZE)
	}
}

update = function() {
	player.update()
	asteroids.forEach(a=>a.update())
	bullets.forEach(a=>a.update())
	
	asteroids = asteroids.filter(a=>a.active)
	bullets = bullets.filter(a=>a.active)
}

draw = function() {
	ctx.clearScreen()
	player.draw()
	asteroids.forEach(a=>a.draw())
	bullets.forEach(a=>a.draw())
}

loop = function() {
	requestAnimationFrame(loop)
	update()
	draw()
}

window.onload = init;
