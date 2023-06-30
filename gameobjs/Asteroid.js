const ASTEROID_SCALE_STEP = 15
const ASTEROID_SCALE_DEVIATION = 0.1
const ASTEROID_RESOLUTION_MAX = 15
const ASTEROID_RESOLUTION_MIN = 10
const ASTEROID_MAX_START_SPEED = 1
const ASTEROID_MIN_START_SPEED = 0.1
const ASTEROID_MAX_START_RSPEED = 0.04
const ASTEROID_MIN_START_RSPEED = 0
const ASTEROID_CHILD_COUNT = 1

class Asteroid extends Entity {
	constructor(pos, scale=3) {//size isnt exactly literal, justa scaler. 1 = 10-15px.
		super(pos)
		this.MAXSIZE = (ASTEROID_SCALE_STEP*scale) * (1 + ASTEROID_SCALE_DEVIATION) //putting these here for now... probably shoudl make them consts somewhere else later
		this.MINSIZE = (ASTEROID_SCALE_STEP*scale) * (1 - ASTEROID_SCALE_DEVIATION)
		this.radius = this.MAXSIZE //update super radius JUST AN ESTIMATE FOR NOW
		
		var dir = Math.rand_range(-0.35, 0.35) + (Math.floor(Math.rand_range(0, 4)) * (Math.PI/2)) + (Math.PI/4) //clip it to 1 rad per quadrant to encourage going toward the center of the screen
		var spd = Math.rand_range(ASTEROID_MIN_START_SPEED, ASTEROID_MAX_START_SPEED)
		this.vel = new _vector(Math.cos(dir)*spd, Math.sin(dir)*spd)
		this.rot_vel = Math.rand_range(-ASTEROID_MAX_START_RSPEED, ASTEROID_MAX_START_RSPEED)

		this.heightMap = new HeightMap(Math.floor(Math.rand_range(ASTEROID_RESOLUTION_MIN, ASTEROID_RESOLUTION_MAX)))
		this.heightMap.randomize(this.MINSIZE, this.MAXSIZE)

        this.collision_mask = [Asteroid]
	}
	update(ent) {
		if (!this.active) return
		super.update(ent) //change this to accept all entities and filter based on mask
    }
	draw() {
		ctx.setColor(this.color)
		ctx.fillRect(this.pos.x, this.pos.y, 3, 3)
		this.heightMap.draw(this.pos, this.rot)
	}
	collide() {//spawn new asteroids if needed and kill the asteroid
		super.collide()

		//create particles
		particles.push( ...this.heightMap.to_particles(this.pos, this.rot))
		//create children
		if ((this.MAXSIZE/15)>1)
		{
			for (var i=0;i<ASTEROID_CHILD_COUNT;i++)
			{
				entities.push(new Asteroid(this.pos, (this.MAXSIZE/15)-1))
			}
		}
	}
	heightAt(angle) {//returns the radius of the asteroid at a given angle to it
		var stepWidth = (Math.PI*2)/(this.heightMap.map.length)
		var actualAngle = (angle-this.rot)<0?(angle-this.rot)+((Math.PI*2)*Math.ceil(Math.abs(angle-this.rot)/(Math.PI*2))):(angle-this.rot)%(Math.PI*2)
		var h1 = this.heightMap.map[Math.floor(actualAngle/stepWidth)%this.heightMap.map.length]
		var h2 = this.heightMap.map[Math.ceil(actualAngle/stepWidth)%this.heightMap.map.length]
		var perc = (actualAngle/stepWidth)%1
		
		return Math.lerp(h1, h2, perc)
	}
}