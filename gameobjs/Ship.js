const SHIP_THRUST = 0.1 //thrust force
const SHIP_RTHRUST = 0.004
const SHIP_MAX_SPEED = 5 //when using speed limiter
const SHIP_MAX_RSPEED = 0.1//rads per sec
const SHIP_MUZZLE_VELOCITY = 10
const SHIP_RELOAD_SPEED = 100//ms

const SHIP_ROT_FRICTION = 5;//definitely deprecating...

const SHIP_DUST_CHANCE = 0.15 //per frame chance to spawn dust
const SHIP_DUST_SPEED = 5
const SHIP_DUST_SPREAD = 0.25 //radians

class Ship extends Entity{
	constructor(pos = new Position2D(SCREENWIDTH/2, SCREENHEIGHT/2)) {
        super(pos)
		this.fragment_lifetime = -1 //dont fade
	
		this.acc = new Position2D(0, 0, 0)

		this.lastFire = -Infinity//last time of fire
		this.thrusting = false//whether to play the thrust animation
		this.rotating = false;
		this.flightAssist = 1;//0-1 --------------- CHANGE THIS
		this.active = true;
        this.radius = 10

		this.integral = 0
		this.previous_error = 0

        this.set_collision_mask(Bullet, Ship, Particle)
	}
	update(ent) {
		if (!this.active) return

        super.update(ent)

		if (keyboard.callKey("arrowup").poll()) this.flightAssist = Math.min(1, this.flightAssist+0.25)
		if (keyboard.callKey("arrowdown").poll()) this.flightAssist = Math.max(0, this.flightAssist-0.25)

		if (keyboard.callKey(" ").poll()) this.shoot(ent)
	 
		this.thrust(keyboard.callKey("w").state * SHIP_THRUST)
		if (!this.thrusting && Math.distance(this.vel, {x:0, y:0})!=0) {
			if (this.flightAssist>=0.5) this.slow()//slow us down if neot thrusting
		}
		if (this.flightAssist>=1) this.limitVel()//it was hard to limit the thrust, so just correct any overages here
	
		if (keyboard.callKey("d").state) {
			this.rotate(SHIP_RTHRUST)
			this.integral = 0
			this.previous_error = 0
		} else if (keyboard.callKey("a").state) {
			this.rotate(-SHIP_RTHRUST)
			this.integral = 0
			this.previous_error = 0
		} else {
			if (Math.abs(this.vel.r)>0 && this.flightAssist>=0.25) {//if needed, slow down
				let dt = 1
				let Kp = 15
				let Ki = 0
				let Kd = 2

				let error = -this.vel.r
				let proportional = error
				this.integral += error * dt
				let derivative = (error - this.previous_error) / dt
				let output = Kp * proportional + Ki * this.integral + Kd * derivative
				this.previous_error = error

				console.log(`slowing from ${this.vel.r} with ${output*SHIP_RTHRUST}`)
				this.rotate(output*SHIP_RTHRUST)
			} else {this.rotate(0)}
		}
		if (this.flightAssist>=0.75) this.limitRot()
		//update vel
		this.vel = this.vel.add(this.acc)
	}
	shoot(ent) {
		SHOWINSTRUCTIONS = false
		if ((Date.now()-this.lastFire)>SHIP_RELOAD_SPEED) {//check if heve cooled down enough
			ent.push(
				new Bullet(
					this.pos,
					this.vel.add(Position2D.fromRad(SHIP_MUZZLE_VELOCITY, this.pos.r))
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
		this.vel = Position2D.fromRad(Math.min(SHIP_MAX_SPEED, cs), dir)
		this.vel.r = old_r_vel
	}
	limitRot() {
		if (this.vel.r == 0) return
		var dir = this.vel.r/Math.abs(this.vel.r)
		this.vel.r = Math.min(SHIP_MAX_RSPEED, Math.abs(this.vel.r))*dir
	}
	rotate(amnt) {
		this.rotating = amnt
		this.acc.r = amnt
	}
	thrust(amnt) {
		this.thrusting = amnt != 0
		let old_accr = this.acc.r //retain old r
		this.acc = Position2D.fromRad(amnt, this.pos.r)
		this.acc.r = old_accr
		//spawn dust
        if (Math.random()<this.thrusting*SHIP_DUST_CHANCE)
        {
            let dust_dir = (this.pos.r + Math.PI) + Math.rand_range(-SHIP_DUST_SPREAD, SHIP_DUST_SPREAD)
            entities.push(
                new Dust(
                    this.pos,
                    this.vel.add(Position2D.fromRad(SHIP_DUST_SPEED, dust_dir)),
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
		ctx.moveTo(this.pos.x+(Math.cos(this.pos.r)*this.heightMap.max), this.pos.y+(Math.sin(this.pos.r)*this.heightMap.max))
		ctx.lineTo(this.pos.x+(Math.cos(this.pos.r+2.25)*this.heightMap.max), this.pos.y+(Math.sin(this.pos.r+2.25)*this.heightMap.max))
		ctx.lineTo(this.pos.x, this.pos.y)
		ctx.lineTo(this.pos.x+(Math.cos(this.pos.r-2.25)*this.heightMap.max), this.pos.y+(Math.sin(this.pos.r-2.25)*this.heightMap.max))
		ctx.closePath();
		ctx.stroke()
		
		//draw flame
		if (this.thrusting) {//is engine thrusting forward?
			var cs = (Math.random()*(this.heightMap.max*0.5))+(this.heightMap.max*1.5)//1.5 is flame size, 0.5 is the amount of jitter
			ctx.beginPath()
			ctx.moveTo(this.pos.x+(Math.cos(this.pos.r+2.25)*(this.heightMap.max/2)), this.pos.y+(Math.sin(this.pos.r+2.25)*(this.heightMap.max/2)))
			ctx.lineTo(this.pos.x-(Math.cos(this.pos.r)*cs), this.pos.y-(Math.sin(this.pos.r)*cs))
			ctx.lineTo(this.pos.x+(Math.cos(this.pos.r-2.25)*(this.heightMap.max/2)), this.pos.y+(Math.sin(this.pos.r-2.25)*(this.heightMap.max/2)))
			ctx.stroke()
		}
		//draw rotating thruster
		if (Math.abs(this.rotating)>0.1) {//is engine thrusting at all?
			var sp = this.rotating<0?//decide where the starting point is
				{	x:this.pos.x+(Math.cos(this.pos.r+2.25)*(this.heightMap.max)), 
					y:this.pos.y+(Math.sin(this.pos.r+2.25)*(this.heightMap.max))}
				:{	x:this.pos.x+(Math.cos(this.pos.r-2.25)*(this.heightMap.max)), 
					y:this.pos.y+(Math.sin(this.pos.r-2.25)*(this.heightMap.max))}
			ctx.beginPath()
			ctx.moveTo(sp.x, sp.y)
			ctx.lineTo(sp.x+(Math.cos(this.pos.r-0.5)*(this.heightMap.max*-0.3)), sp.y+(Math.sin(this.pos.r-0.5)*(this.heightMap.max*-0.3)))
			ctx.lineTo(sp.x+(Math.cos(this.pos.r+0.5)*(this.heightMap.max*-0.3)), sp.y+(Math.sin(this.pos.r+0.5)*(this.heightMap.max*-0.3)))
			ctx.closePath()
			ctx.stroke()
		}
		
		//draw reload meter
		ctx.font = "10px sans-serif"
		ctx.fillText("Re"+(((Date.now()-this.lastFire)/SHIP_RELOAD_SPEED<1)?"loading...":"ady to fire!"), 0, 8)
		ctx.strokeRect(0, 10, 100, 10)
		ctx.fillRect(0, 10, (Math.min((Date.now()-this.lastFire)/SHIP_RELOAD_SPEED, 1))*100, 10)
		//draw flight assist meter
		ctx.fillText("Flight assist level:", 0, 30)
		ctx.strokeRect(0, 32, 100, 10)
		ctx.fillRect(0, 32, this.flightAssist*100, 10)
	
	}
}