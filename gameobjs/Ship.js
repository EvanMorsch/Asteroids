class Ship extends Entity{
	constructor(pos = new _vector(SCREENWIDTH/2, SCREENHEIGHT/2)) {
        super(pos)
		this.THRUST = 0.1;//force applied when engines are on
		this.SIZE = 10
		this.MAXSPEED = 5
		this.MUZZLEVELOCITY = 10
		this.RELOADSPEED = 100//milliseconds
		this.MAXROT = 0.1;
		this.ROTSPEED = 0.004
		this.ROTFRICTION = 5;//speed at which we slow as compared to accelerate
	
		this.acc = new _vector(0, 0)
        this.rot_acc = 0
		this.lastFire = -Infinity//last time of fire
		this.THRUSTINGFORWARD = false//tracks whether to play the thrust animation
		this.ROTATING = false;
		this.flightAssist = 1;//0-1
		this.active = true;
        this.radius = 10

        this.collision_mask = [Bullet, Ship, Particle]
	}
	update(ent) {
		if (!this.active) return

        super.update(ent)

		if (keyboard.callKey(" ").poll()) this.shoot(ent)
		if (keyboard.callKey("arrowup").poll()) this.flightAssist = Math.min(1, this.flightAssist+0.25)
		if (keyboard.callKey("arrowdown").poll()) this.flightAssist = Math.max(0, this.flightAssist-0.25)
	
		if (keyboard.callKey("w").state) {
			this.thrust(1)
		} else if (keyboard.callKey("s").state) {
			this.thrust(-1)
		} else {
			this.thrust(0)
			if (Math.distance(this.vel, {x:0, y:0})!=0) {
				if (this.flightAssist>=0.5) this.slow()//slow us down if neot thrusting
			}
		}
		if (this.flightAssist>=1) this.limitVel()//it was hard to limit the thrust, so just correct any overages here
	
		if (keyboard.callKey("d").state) {
			this.rotate(1)
		} else if (keyboard.callKey("a").state) {
			this.rotate(-1)
		} else {
			if (Math.abs(this.rot_vel)>0 && this.flightAssist>=0.25) {//if needed, slow down
				this.rotate(-this.ROTFRICTION*(Math.sqrt(Math.abs(this.rot_vel))*(this.rot_vel/Math.abs(this.rot_vel))))
			} else {this.rotate(0)}
		}
		if (this.flightAssist>=0.75) this.limitRot()
		//update vel
		this.vel = this.vel.add(this.acc)
        this.rot_vel += this.rot_acc
	}
	shoot(ent) {
		SHOWINSTRUCTIONS = false
		if ((Date.now()-this.lastFire)>this.RELOADSPEED) {//check if heve cooled down enough
			ent.push(new Bullet(this.pos, this.vel.add(new _vector(Math.cos(this.rot)*this.MUZZLEVELOCITY, Math.sin(this.rot)*this.MUZZLEVELOCITY))))
			this.lastFire = Date.now()//update cooldown time
		}
	}
	collide(ent) {//spawn in particles and retire the ship :(
		if (!this.active) return
		this.active = false
		var p1 = {x:this.pos.x+(Math.cos(this.rot)*this.SIZE), y:this.pos.y+(Math.sin(this.rot)*this.SIZE)}
		var p2 = {x:this.pos.x+(Math.cos(this.rot+2.25)*this.SIZE), y:this.pos.y+(Math.sin(this.rot+2.25)*this.SIZE)}
		var p3 = {x:this.pos.x, y:this.pos.y}
		var p4 = {x:this.pos.x+(Math.cos(this.rot-2.25)*this.SIZE), y:this.pos.y+(Math.sin(this.rot-2.25)*this.SIZE)}
		ent.push(	new Fragment(p1, p2, p3), 
						new Fragment(p2, p3, p3), 
						new Fragment(p3, p4, p3), 
						new Fragment(p4, p1, p3))
		GAMEOVER = true
	}
	slow() {//slow down the positional velocity
		if (this.vel.x!=0) this.acc.x = -0.05*(Math.sqrt(Math.abs(this.vel.x))*(this.vel.x/Math.abs(this.vel.x)))
		if (this.vel.y!=0) this.acc.y = -0.05*(Math.sqrt(Math.abs(this.vel.y))*(this.vel.y/Math.abs(this.vel.y)))
	}
	limitVel() {//normalize to the max speed
		var cs = Math.distance(this.vel, {x:0, y:0})//current speed
		var dir = Math.atan2(this.vel.y, this.vel.x)
		this.vel.x = Math.cos(dir)*Math.min(this.MAXSPEED, cs)
		this.vel.y = Math.sin(dir)*Math.min(this.MAXSPEED, cs)
	}
	limitRot() {
		if (this.rot_vel == 0) return
		var dir = this.rot_vel/Math.abs(this.rot_vel)
		this.rot_vel = Math.min(this.MAXROT, Math.abs(this.rot_vel))*dir
	}
	rotate(modifier) {
		this.ROTATING = modifier
		this.rot_acc = this.ROTSPEED*modifier
	}
	thrust(modifier) {
		this.THRUSTINGFORWARD = modifier>0
		this.acc.x = Math.cos(this.rot)*(this.THRUST*modifier)
		this.acc.y = Math.sin(this.rot)*(this.THRUST*modifier)
	}
	draw() {
		if (!this.active) return
		ctx.setColor("white")
		//draw ship itself
		ctx.beginPath()
		ctx.moveTo(this.pos.x+(Math.cos(this.rot)*this.SIZE), this.pos.y+(Math.sin(this.rot)*this.SIZE))
		ctx.lineTo(this.pos.x+(Math.cos(this.rot+2.25)*this.SIZE), this.pos.y+(Math.sin(this.rot+2.25)*this.SIZE))
		ctx.lineTo(this.pos.x, this.pos.y)
		ctx.lineTo(this.pos.x+(Math.cos(this.rot-2.25)*this.SIZE), this.pos.y+(Math.sin(this.rot-2.25)*this.SIZE))
		ctx.closePath();
		ctx.stroke()
		
		//draw flame
		if (this.THRUSTINGFORWARD) {//is engine thrusting forward?
			var cs = (Math.random()*(this.SIZE*0.5))+(this.SIZE*1.5)//1.5 is flame size, 0.5 is the amount of jitter
			ctx.beginPath()
			ctx.moveTo(this.pos.x+(Math.cos(this.rot+2.25)*(this.SIZE/2)), this.pos.y+(Math.sin(this.rot+2.25)*(this.SIZE/2)))
			ctx.lineTo(this.pos.x-(Math.cos(this.rot)*cs), this.pos.y-(Math.sin(this.rot)*cs))
			ctx.lineTo(this.pos.x+(Math.cos(this.rot-2.25)*(this.SIZE/2)), this.pos.y+(Math.sin(this.rot-2.25)*(this.SIZE/2)))
			ctx.stroke()
		}
		//draw rotating thruster
		if (Math.abs(this.ROTATING)>0.1) {//is engine thrusting at all?
			var sp = this.ROTATING<0?//decide where the starting point is
				{	x:this.pos.x+(Math.cos(this.rot+2.25)*(this.SIZE)), 
					y:this.pos.y+(Math.sin(this.rot+2.25)*(this.SIZE))}
				:{	x:this.pos.x+(Math.cos(this.rot-2.25)*(this.SIZE)), 
					y:this.pos.y+(Math.sin(this.rot-2.25)*(this.SIZE))}
			ctx.beginPath()
			ctx.moveTo(sp.x, sp.y)
			ctx.lineTo(sp.x+(Math.cos(this.rot-0.5)*(this.SIZE*-0.3)), sp.y+(Math.sin(this.rot-0.5)*(this.SIZE*-0.3)))
			ctx.lineTo(sp.x+(Math.cos(this.rot+0.5)*(this.SIZE*-0.3)), sp.y+(Math.sin(this.rot+0.5)*(this.SIZE*-0.3)))
			ctx.closePath()
			ctx.stroke()
		}
		
		//draw reload meter
		ctx.font = "10px sans-serif"
		ctx.fillText("Re"+(((Date.now()-this.lastFire)/this.RELOADSPEED<1)?"loading...":"ady to fire!"), 0, 8)
		ctx.strokeRect(0, 10, 100, 10)
		ctx.fillRect(0, 10, (Math.min((Date.now()-this.lastFire)/this.RELOADSPEED, 1))*100, 10)
		//draw flight assist meter
		ctx.fillText("Flight assist level:", 0, 30)
		ctx.strokeRect(0, 32, 100, 10)
		ctx.fillRect(0, 32, this.flightAssist*100, 10)
	
	}
}