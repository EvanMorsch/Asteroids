//do a once-over and organize everything
	//move constants to settings if possible
	//comment
//points
	//time spent in low flight assist grants more points
//move constants to a settings object (practice implementing pseudo-constants)

init = function() {
	ctx.init()
	keyboard = new _keyboard();
	keyboard.addKey(" ",true)

	player = new _ship()
	asteroids = new Array(10).fill()//make empty array
	asteroids.forEach(function(a,b){this[b]=new _asteroid()},asteroids)//fill with different asteroids
	bullets = []
	particles = []
	PAUSED = false//used for debugging
	GAMEOVER = false
	LEVEL = 1
	SHOWINSTRUCTIONS = true
	INITTIME = Date.now()

	loop();
}

class _particle {//particles are all lines, they spin at random speeds in random directions
	constructor(a,b,c,fade=-1) {//if fade == -1, itll never fade, c is the point they flee from
		this.pos = new _vector(
			(a.x+b.x)/2,(a.y+b.y)/2,
			Math.atan2(a.y-b.y,a.x-b.x)
		)
		this.SIZE = Math.distance(a,b)/2
		var dir = Math.atan2(this.pos.y-c.y,this.pos.x-c.x)
		var spd = (Math.random()*2)
		this.vel = new _vector(Math.cos(dir)*spd,Math.sin(dir)*spd,(Math.random()*0.1)-0.05)
		this.fade = fade
		this.fadeStart = fade
	}
	update() {
		this.pos = this.pos.add(this.vel)
		if (this.fade>0) this.fade--
	}
	draw() {
		ctx.setColor("rgba("+(255*(this.fade/this.fadeStart))+","+(255*(this.fade/this.fadeStart))+","+(255*(this.fade/this.fadeStart))+",1)")
		ctx.beginPath()
		ctx.moveTo(this.pos.x+(Math.cos(this.pos.z)*this.SIZE),this.pos.y+(Math.sin(this.pos.z)*this.SIZE))
		ctx.lineTo(this.pos.x-(Math.cos(this.pos.z)*this.SIZE),this.pos.y-(Math.sin(this.pos.z)*this.SIZE))
		ctx.stroke()
	}
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
		this.color = "white"
		
		this.pos = new _vector(x,y,0)//z is rotation
		var dir = Math.atan2((Math.random()*SCREENHEIGHT)-y,(Math.random()*SCREENWIDTH)-x)
		var spd = (Math.random()*this.SPEED)
		this.vel = new _vector(Math.cos(dir)*spd,Math.sin(dir)*spd,(Math.random()*(this.ROTSPEED*2))-(this.ROTSPEED))
		this.heightMap = new Array(Math.floor(this.MINRES+(Math.random()*(this.MAXRES-this.MINRES)))).fill()
		this.heightMap.forEach(function(a,b){this.heightMap[b]=(Math.random()*(this.MAXSIZE-this.MINSIZE))+(this.MINSIZE)},this)//range from (size*10)-(size*15)
	}
	update() {
		if (!this.active) return
		this.pos = this.pos.add(this.vel)
		if (this.pos.x>(SCREENWIDTH+this.MAXSIZE)) this.pos.x-=SCREENWIDTH+(this.MAXSIZE*2);
		if (this.pos.x<(0-this.MAXSIZE)) this.pos.x+=SCREENWIDTH+(this.MAXSIZE*2);
		if (this.pos.y>(SCREENHEIGHT+this.MAXSIZE)) this.pos.y-=SCREENHEIGHT+(this.MAXSIZE*2);
		if (this.pos.y<(0-this.MAXSIZE)) this.pos.y+=SCREENHEIGHT+(this.MAXSIZE*2);
		//detect collisions
		if (//bullets overlaps quite a bit once theyre detected but it just because of the speed of them
			bullets.some(function(a){
						if (a.active && (Math.distance(a.pos,this.pos)<=a.SIZE+this.heightAt(Math.atan2(a.pos.y-this.pos.y,a.pos.x-this.pos.x)))) {
							a.explode();
							return true;
						}
						return false;
					}
			,this)
		) {this.explode()}
		if ((Math.distance(player.pos,this.pos)<=player.SIZE+this.heightAt(Math.atan2(player.pos.y-this.pos.y,player.pos.x-this.pos.x)))) {player.explode()}
	}
	draw() {
		ctx.setColor(this.color)
		ctx.beginPath()
		this.heightMap.forEach(function(a,b) {
			b==0?ctx.moveTo(this.getLoc(b).x,this.getLoc(b).y):ctx.lineTo(this.getLoc(b).x,this.getLoc(b).y)
		},this)
		ctx.closePath()
		ctx.stroke()
	}
	explode() {//spawn new asteroids if needed and kill the asteroid
		this.active = false
		for (var i=0;i<this.heightMap.length;i++) particles.push(new _particle(this.getLoc(i),this.getLoc((i+1)%this.heightMap.length),this.pos,100))//create particles
		if ((this.MAXSIZE/15)>1) for (var i=0;i<this.MAXSIZE/15;i++) asteroids.push(new _asteroid(this.pos.x,this.pos.y,(this.MAXSIZE/15)-1))
	}
	getLoc(i) {
		return new _vector(this.pos.x+(Math.cos(((Math.PI*2)*(i/this.heightMap.length))+this.pos.z)*this.heightMap[i]),
							this.pos.y+(Math.sin(((Math.PI*2)*(i/this.heightMap.length))+this.pos.z)*this.heightMap[i]) )
	}
	heightAt(angle) {//returns the radius of the asteroid at a given angle to it
		//angle = angle-this.pos.z
		var stepWidth = (Math.PI*2)/(this.heightMap.length)
		var actualAngle = (angle-this.pos.z)<0?(angle-this.pos.z)+((Math.PI*2)*Math.ceil(Math.abs(angle-this.pos.z)/(Math.PI*2))):(angle-this.pos.z)%(Math.PI*2)
		var h1 = this.heightMap[Math.floor(actualAngle/stepWidth)%this.heightMap.length]
		var h2 = this.heightMap[Math.ceil(actualAngle/stepWidth)%this.heightMap.length]
		var perc = (actualAngle/stepWidth)%1
		//lerp h1-h2 by perc
		
		return Math.lerp(h1,h2,perc)
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
		this.active = true;
	}
	update() {
		if (!this.active) return
		if (keyboard.callKey(" ").poll()) this.shoot()
		if (keyboard.callKey("arrowup").poll()) this.flightAssist = Math.min(1,this.flightAssist+0.25)
		if (keyboard.callKey("arrowdown").poll()) this.flightAssist = Math.max(0,this.flightAssist-0.25)
	
		if (keyboard.callKey("w").state) {
			this.thrust(1)
		} else if (keyboard.callKey("s").state) {
			this.thrust(-1)
		} else {
			this.thrust(0)
			if (Math.distance(this.vel,{x:0,y:0})!=0) {
				if (this.flightAssist>=0.5) this.slow()//slow us down if neot thrusting
			}
		}
		if (this.flightAssist>=1) this.limitVel()//it was hard to limit the thrust, so just correct any overages here
	
		if (keyboard.callKey("d").state) {
			this.rotate(1)
		} else if (keyboard.callKey("a").state) {
			this.rotate(-1)
		} else {
			if (Math.abs(this.vel.z)>0 && this.flightAssist>=0.25) {//if needed, slow down
				this.rotate(-this.ROTFRICTION*(Math.sqrt(Math.abs(this.vel.z))*(this.vel.z/Math.abs(this.vel.z))))
			} else {this.rotate(0)}
		}
		if (this.flightAssist>=0.75) this.limitRot()
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
		SHOWINSTRUCTIONS = false
		if ((Date.now()-this.lastFire)>this.RELOADSPEED) {//check if heve cooled down enough
			bullets.push(new _bullet(this.pos.x,this.pos.y,this.vel.x+(Math.cos(this.pos.z)*this.MUZZLEVELOCITY),this.vel.y+(Math.sin(this.pos.z)*this.MUZZLEVELOCITY)))
			this.lastFire = Date.now()//update cooldown time
		}
	}
	explode() {//spawn in particles and retire the ship :(
		if (!this.active) return
		this.active = false
		var p1 = {x:this.pos.x+(Math.cos(this.pos.z)*this.SIZE),y:this.pos.y+(Math.sin(this.pos.z)*this.SIZE)}
		var p2 = {x:this.pos.x+(Math.cos(this.pos.z+2.25)*this.SIZE),y:this.pos.y+(Math.sin(this.pos.z+2.25)*this.SIZE)}
		var p3 = {x:this.pos.x,y:this.pos.y}
		var p4 = {x:this.pos.x+(Math.cos(this.pos.z-2.25)*this.SIZE),y:this.pos.y+(Math.sin(this.pos.z-2.25)*this.SIZE)}
		particles.push(	new _particle(p1,p2,p3),
						new _particle(p2,p3,p3),
						new _particle(p3,p4,p3),
						new _particle(p4,p1,p3))
		GAMEOVER = true
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
		if (!this.active) return
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
		ctx.font = "10px sans-serif"
		ctx.fillText("Re"+(((Date.now()-this.lastFire)/this.RELOADSPEED<1)?"loading...":"ady to fire!"),0,8)
		ctx.strokeRect(0,10,100,10)
		ctx.fillRect(0,10,(Math.min((Date.now()-this.lastFire)/this.RELOADSPEED,1))*100,10)
		//draw flight assist meter
		ctx.fillText("Flight assist level:",0,30)
		ctx.strokeRect(0,32,100,10)
		ctx.fillRect(0,32,this.flightAssist*100,10)
	
	}
}

class _bullet {
	constructor(x=0,y=0,vx=1,vy=1) {
		this.SIZE = 2//in px
		this.active = 50//acts as its "life timer"
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
	explode() {
		this.active = 0//set its life timer to 0
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
	particles.forEach(a=>a.update())
	
	asteroids = asteroids.filter(a=>a.active)
	bullets = bullets.filter(a=>a.active>0)
	particles = particles.filter(a=>a.fade)
}

drawGameover = function() {
	var ts = 20
	ctx.font = "20px sans-serif"
	var tw = ctx.measureText("GAME OVER!").width
	ctx.clearRect((SCREENWIDTH/2)-(tw/1.5),(SCREENHEIGHT/2)-(10),tw*1.333,ts*1.333)
	ctx.strokeRect((SCREENWIDTH/2)-(tw/1.5),(SCREENHEIGHT/2)-(10),tw*1.333,ts*1.333)
	ctx.fillText("GAME OVER!",(SCREENWIDTH/2)-(tw/2),(SCREENHEIGHT/2)+(ts/1.75))
}

draw = function() {
	ctx.clearScreen()
	player.draw()
	asteroids.forEach(a=>a.draw())
	bullets.forEach(a=>a.draw())
	particles.forEach(a=>a.draw())
	//draw level text
	ctx.setColor("white")
	ctx.font = "20px sans-serif"
	ctx.fillText("LEVEL "+LEVEL,(SCREENWIDTH/2)-(ctx.measureText("LEVEL "+LEVEL).width/2),20)
	if (SHOWINSTRUCTIONS) {
		ctx.font = "10px sans-serif"
		ctx.fillText("Use Wasd to move, Space to fire, and up/down to change flight assist",(SCREENWIDTH/2)-(ctx.measureText("Use Wasd to move, Space to fire, and up/down to change flight assist").width/2),30)
		if (Date.now()-INITTIME>10000) SHOWINSTRUCTIONS = false
	}
}

loop = function() {
	requestAnimationFrame(loop)
	if (!PAUSED) update()
	draw()
	if (GAMEOVER) drawGameover()
	if (asteroids.length==0) {
		LEVEL++
		player.pos = new _vector(SCREENWIDTH/2,SCREENHEIGHT/2,0)
		asteroids = new Array(10+(LEVEL*2)).fill()//make empty array
		asteroids.forEach(function(a,b){this[b]=new _asteroid()},asteroids)//fill with different asteroids
	}
}

window.onload = init;
