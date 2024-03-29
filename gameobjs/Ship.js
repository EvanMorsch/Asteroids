const SHIP_THRUST = 0.1 //thrust force
const SHIP_RTHRUST = 0.004
const SHIP_MAX_SPEED = 5 //when using speed limiter
const SHIP_MAX_RSPEED = 0.08//rads per sec
const SHIP_MUZZLE_VELOCITY = 10
const SHIP_RELOAD_SPEED = 50//ms

const SHIP_ROT_SLOW_SCALE = 10//definitely deprecating...
const SHIP_ROT_SPEED_EPS = 0.002

const SHIP_VEL_SLOW_SCALE = 0.05

const SHIP_DUST_CHANCE = 0.15 //per frame chance to spawn dust
const SHIP_DUST_SPEED = 5
const SHIP_DUST_SPREAD = 0.25 //radians

const SHIP_SIZE = 10

class Ship extends Entity{
	constructor(world, pos = new Position2D(SCREENWIDTH/2, SCREENHEIGHT/2)) {
        super(world, pos)
		this.fragment_lifetime = -1 //dont fade
	
		this.acc = new Position2D(0, 0, 0)

		this.lastFire = -Infinity//last time of fire
		this.thrusting = false//whether to play the thrust animation
		this.flightAssist = 1;//0-1 --------------- CHANGE THIS
		this.active = true;

		this.speed_limit = true

		this.heightMap = new HeightMap(6, SHIP_SIZE)
		//preset heights
		this.heightMap.map[1] = 5
		this.heightMap.map[3] = 0
		this.heightMap.map[5] = 5
		
        this.set_collision_mask(Bullet, Ship, Particle)
	}
	update(ent) {
		if (!this.active) return

        super.update(ent)
		//prepare acc
		this.acc = new Position2D()

		if (this.world.keyboard.callKey("arrowup").poll()) this.flightAssist = Math.min(1, this.flightAssist+0.25)
		if (this.world.keyboard.callKey("arrowdown").poll()) this.flightAssist = Math.max(0, this.flightAssist-0.25)

		if (this.world.keyboard.callKey(" ").poll()) this.shoot(ent)
	 
		if (this.thrusting = this.world.keyboard.callKey("w").state)
		{
			this.accelerate_torward(SHIP_THRUST, this.pos.r)

			//spawn dust
			if (Math.random()<this.thrusting*SHIP_DUST_CHANCE)
			{
				let dust_dir = (this.pos.r + Math.PI) + Math.rand_range(-SHIP_DUST_SPREAD, SHIP_DUST_SPREAD)
				this.world.entities.push(
					new Dust(
						this.world, 
						this.pos,
						this.vel.add(Position2D.fromRad(SHIP_DUST_SPEED, dust_dir)),
						1000
					)
				)
			}
		}
		else
		{
			if (this.flightAssist>=0.5)
			{
				let r = Math.distance(this.vel, {x:0, y:0})
				let theta = Math.atan2(this.vel.y, this.vel.x)
				this.accelerate_torward(r*-SHIP_VEL_SLOW_SCALE, theta) //slow us down if neot thrusting
			}
		}
	
		if (this.world.keyboard.callKey("d").state) {
			this.rotate(SHIP_RTHRUST)
		} else if (this.world.keyboard.callKey("a").state) {
			this.rotate(-SHIP_RTHRUST)
		} else {
			if (Math.abs(this.vel.r)>0 && this.flightAssist>=0.25) {//if needed, slow down
				let slow_amnt = SHIP_RTHRUST*Math.sqrt(SHIP_ROT_SLOW_SCALE*Math.abs(this.vel.r))
				this.rotate(this.vel.r > 0 ? -slow_amnt : slow_amnt)
			} else {this.rotate(0)}
		}
		this.rspeed_limit = this.flightAssist>=0.75
		this.speed_limit = this.flightAssist>=1

		//update vel
		this.vel = this.vel.add(this.acc)

		//kill eps
		if (Math.abs(this.vel.r) < SHIP_ROT_SPEED_EPS)
		{
			this.vel.r = 0
		}
	}
	shoot(ent) {
		this.world.showInstructions = false
		if ((Date.now()-this.lastFire)>SHIP_RELOAD_SPEED) {//check if heve cooled down enough
			ent.push(
				new Bullet(
					this.world, 
					this.pos,
					this.vel.add(Position2D.fromRad(SHIP_MUZZLE_VELOCITY, this.pos.r))
				)
			)
			this.lastFire = Date.now()//update cooldown time
		}
	}
	collide(coll_with) {//spawn in particles and retire the ship :(
		super.collide(coll_with)
		this.world.gameOver = true
	}
	rotate(amnt) {
		this.acc.r = amnt

		if (this.rspeed_limit)
		{
			let r = this.vel.r + this.acc.r
			if (r > SHIP_MAX_RSPEED)
			{
				this.acc.r += (SHIP_MAX_RSPEED - r)
			}
			else if (r < -SHIP_MAX_RSPEED)
			{
				this.acc.r += (-SHIP_MAX_RSPEED - r)
			}
		}
	}
	accelerate_torward(r, theta) {
		this.acc = Position2D.fromRad(r, theta, this.acc.r)

		if (this.speed_limit)
		{
			if (Math.distance(this.vel.add(this.acc), {x:0, y:0}) > SHIP_MAX_SPEED)
			{
				let r = Math.distance(this.vel.add(this.acc), {x:0, y:0})
				let theta = Math.atan2(this.vel.y, this.vel.x)
				this.acc = this.acc.add(Position2D.fromRad(SHIP_MAX_SPEED - r, theta))
			}
		}
    }
	draw() {
		super.draw()
		if (!this.active) return
		ctx.setColor("white")
		
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
		if (Math.abs(this.acc.r)) {//is engine thrusting at all?
			var sp = this.acc.r<0?//decide where the starting point is
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