const ASTEROID_SCALE_DEVIATION = 0.1
const ASTEROID_RESOLUTION_MAX = 15
const ASTEROID_RESOLUTION_MIN = 10
const ASTEROID_MAX_START_SPEED = 1
const ASTEROID_MIN_START_SPEED = 0.1
const ASTEROID_MAX_START_RSPEED = 0.04
const ASTEROID_CHILD_COUNT = 1
const ASTEROID_MIN_PARENT_SIZE = 15//smallest px size of a child bearing asteroid
//how far the velocity will deviate from aiming directly at the center of the screen
const ASTEROID_START_DIR_DEVIATION = 0.35

class Asteroid extends Entity {
	constructor(pos, size=45) {
		//clip it to 1 rad per quadrant to encourage going toward the center of the screen
		//THIS ISNT RIGHT, AIM FOR THE CENTER THEN ADD RAND_RANGE
		let dir = Math.rand_range(-ASTEROID_START_DIR_DEVIATION, ASTEROID_START_DIR_DEVIATION)
				  + (Math.floor(Math.rand_range(0, 4)) * (Math.PI/2)) 
				  + (Math.PI/4)
		let spd = Math.rand_range(ASTEROID_MIN_START_SPEED, ASTEROID_MAX_START_SPEED)
		let vel = new _vector(Math.cos(dir)*spd, Math.sin(dir)*spd)

		super(pos, vel, size)

		this.rot_vel = Math.rand_range(-ASTEROID_MAX_START_RSPEED, ASTEROID_MAX_START_RSPEED)

		this.heightMap = new HeightMap(
			Math.floor(
				Math.rand_range(ASTEROID_RESOLUTION_MIN, ASTEROID_RESOLUTION_MAX)
			)
		)
		this.heightMap.randomize(
			this.radius*(1-ASTEROID_SCALE_DEVIATION),
			this.radius*(1+ASTEROID_SCALE_DEVIATION)
		)

        this.set_collision_mask(Asteroid, Particle)
	}
	collide(ent) {//spawn new asteroids if needed and kill the asteroid
		super.collide(ent)
		//create children
		if (this.size >= ASTEROID_MIN_PARENT_SIZE)
		{
			for (var i=0;i<ASTEROID_CHILD_COUNT;i++)
			{
				ent.push(new Asteroid(this.pos, (this.MAXSIZE/15)-1))
			}
		}
	}
}