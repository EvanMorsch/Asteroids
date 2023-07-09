class Ship extends Entity{
	constructor(pos = new Position2D(SCREENWIDTH/2, SCREENHEIGHT/2)) {
        super(pos)
		this.fragment_lifetime = -1

		this.THRUST = 0.1;//force applied when engines are on
		this.SIZE = 10
		this.MAXSPEED = 5
		this.MUZZLEVELOCITY = 10
		this.RELOADSPEED = 100//milliseconds
		this.MAXROT = 0.1;
		this.ROTSPEED = 0.004
		this.ROTFRICTION = 5;//speed at which we slow as compared to accelerate
	
		this.acc = new Position2D(0, 0, 0)
		this.lastFire = -Infinity//last time of fire
		this.THRUSTINGFORWARD = false//tracks whether to play the thrust animation
		this.ROTATING = false;
		this.flightAssist = 1;//0-1
		this.active = true;
        this.radius = 10

        this.set_collision_mask(Bullet, Ship, Particle)
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
			if (Math.abs(this.vel.r)>0 && this.flightAssist>=0.25) {//if needed, slow down
				this.rotate(-this.ROTFRICTION*(Math.sqrt(Math.abs(this.vel.r))*(this.vel.r/Math.abs(this.vel.r))))
			} else {this.rotate(0)}
		}
		if (this.flightAssist>=0.75) this.limitRot()
		//update vel
		this.vel = this.vel.add(this.acc)
	}
	shoot(ent) {
		SHOWINSTRUCTIONS = false
		if ((Date.now()-this.lastFire)>this.RELOADSPEED) {//check if heve cooled down enough
			ent.push(
				new Bullet(
					this.pos,
					this.vel.add(Position2D.fromRad(this.MUZZLEVELOCITY, this.pos.r))
				)
			)
			this.lastFire = Date.now()//update cooldown time
		}
	}
	collide(coll_with) {//spawn in particles and retire the ship :(
		if (!this.active) return
		super.collide(coll_with)
		GAMEOVER = true
	}
	slow() {//slow down the positional velocity
		if (this.vel.x!=0) this.acc.x = -0.05*(Math.sqrt(Math.abs(this.vel.x))*(this.vel.x/Math.abs(this.vel.x)))
		if (this.vel.y!=0) this.acc.y = -0.05*(Math.sqrt(Math.abs(this.vel.y))*(this.vel.y/Math.abs(this.vel.y)))
	}
	limitVel() {//normalize to the max speed
		var cs = Math.distance(this.vel, {x:0, y:0})//current speed
		var dir = Math.atan2(this.vel.y, this.vel.x)
		let old_r_vel = this.vel.r
		this.vel = Position2D.fromRad(Math.min(this.MAXSPEED, cs), dir)
		this.vel.r = old_r_vel
	}
	limitRot() {
		if (this.vel.r == 0) return
		var dir = this.vel.r/Math.abs(this.vel.r)
		this.vel.r = Math.min(this.MAXROT, Math.abs(this.vel.r))*dir
	}
	rotate(modifier) {
		this.ROTATING = modifier
		this.acc.r = this.ROTSPEED*modifier
	}
	thrust(modifier) {
		this.THRUSTINGFORWARD = modifier>0
		this.acc.x = Math.cos(this.pos.r)*(this.THRUST*modifier)
		this.acc.y = Math.sin(this.pos.r)*(this.THRUST*modifier)
        if (modifier>0 && Math.random()<0.15)
        {
            //let dust_dir = this.pos.r + Math.PI + Math.rand_range(-0.5, 0.5)
            let dust_dir = this.pos.r + Math.PI + Math.rand_range(-0.25, 0.25)
            let dust_speed = 5
            entities.push(
                new Dust(
                    this.pos,
                    this.vel.add(new Position2D(
                        Math.cos(dust_dir)*dust_speed,
                        Math.sin(dust_dir)*dust_speed
                    )),
                    1000
                )
            )
        }
    }
	draw() {
		super.draw()
		if (!this.active) return
		ctx.setColor("white")
		//draw ship itself
		ctx.beginPath()
		ctx.moveTo(this.pos.x+(Math.cos(this.pos.r)*this.SIZE), this.pos.y+(Math.sin(this.pos.r)*this.SIZE))
		ctx.lineTo(this.pos.x+(Math.cos(this.pos.r+2.25)*this.SIZE), this.pos.y+(Math.sin(this.pos.r+2.25)*this.SIZE))
		ctx.lineTo(this.pos.x, this.pos.y)
		ctx.lineTo(this.pos.x+(Math.cos(this.pos.r-2.25)*this.SIZE), this.pos.y+(Math.sin(this.pos.r-2.25)*this.SIZE))
		ctx.closePath();
		ctx.stroke()
		
		//draw flame
		if (this.THRUSTINGFORWARD) {//is engine thrusting forward?
			var cs = (Math.random()*(this.SIZE*0.5))+(this.SIZE*1.5)//1.5 is flame size, 0.5 is the amount of jitter
			ctx.beginPath()
			ctx.moveTo(this.pos.x+(Math.cos(this.pos.r+2.25)*(this.SIZE/2)), this.pos.y+(Math.sin(this.pos.r+2.25)*(this.SIZE/2)))
			ctx.lineTo(this.pos.x-(Math.cos(this.pos.r)*cs), this.pos.y-(Math.sin(this.pos.r)*cs))
			ctx.lineTo(this.pos.x+(Math.cos(this.pos.r-2.25)*(this.SIZE/2)), this.pos.y+(Math.sin(this.pos.r-2.25)*(this.SIZE/2)))
			ctx.stroke()
		}
		//draw rotating thruster
		if (Math.abs(this.ROTATING)>0.1) {//is engine thrusting at all?
			var sp = this.ROTATING<0?//decide where the starting point is
				{	x:this.pos.x+(Math.cos(this.pos.r+2.25)*(this.SIZE)), 
					y:this.pos.y+(Math.sin(this.pos.r+2.25)*(this.SIZE))}
				:{	x:this.pos.x+(Math.cos(this.pos.r-2.25)*(this.SIZE)), 
					y:this.pos.y+(Math.sin(this.pos.r-2.25)*(this.SIZE))}
			ctx.beginPath()
			ctx.moveTo(sp.x, sp.y)
			ctx.lineTo(sp.x+(Math.cos(this.pos.r-0.5)*(this.SIZE*-0.3)), sp.y+(Math.sin(this.pos.r-0.5)*(this.SIZE*-0.3)))
			ctx.lineTo(sp.x+(Math.cos(this.pos.r+0.5)*(this.SIZE*-0.3)), sp.y+(Math.sin(this.pos.r+0.5)*(this.SIZE*-0.3)))
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