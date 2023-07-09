const ASTEROID_SCALE_DEVIATION = 0.1
const ASTEROID_RESOLUTION = 10
const ASTEROID_MAX_START_SPEED = 1
const ASTEROID_MIN_START_SPEED = 0.1
const ASTEROID_MAX_START_RSPEED = 0.04
const ASTEROID_CHILD_COUNT = 1
const ASTEROID_CHILD_SCALE = 0.5
const ASTEROID_DEFAULT_SIZE = 45
const ASTEROID_MIN_PARENT_SIZE = 15//smallest px size of a child bearing asteroid
//how far the velocity will deviate from aiming directly at the center of the screen
const ASTEROID_START_DIR_DEVIATION = 0.35
const ASTEROID_DEFAULT_TARGET = {x:SCREENWIDTH/2, y:SCREENHEIGHT/2}

class Asteroid extends Entity {
	constructor(pos, size=ASTEROID_DEFAULT_SIZE) {
		//clip it to 1 rad per quadrant to encourage going toward the center of the screen
		let dir = 	Math.atan2(ASTEROID_DEFAULT_TARGET.y-pos.y, ASTEROID_DEFAULT_TARGET.x-pos.x)
					+ Math.rand_range(-ASTEROID_START_DIR_DEVIATION, ASTEROID_START_DIR_DEVIATION)
		let spd = Math.rand_range(ASTEROID_MIN_START_SPEED, ASTEROID_MAX_START_SPEED)
		let vel = Position2D.fromRad(spd, dir)

		super(pos, vel, size)

		this.vel.r = Math.rand_range(-ASTEROID_MAX_START_RSPEED, ASTEROID_MAX_START_RSPEED)

		this.heightMap = new HeightMap(ASTEROID_RESOLUTION)
		this.heightMap.randomize(
			size*(1-ASTEROID_SCALE_DEVIATION),
			size*(1+ASTEROID_SCALE_DEVIATION)
		)

        this.set_collision_mask(Asteroid, Particle)
	}
	collide(coll_with) {//spawn new asteroids if needed and kill the asteroid
		super.collide(coll_with)
		//create children
		if (this.heightMap.min >= ASTEROID_MIN_PARENT_SIZE)
		{
			for (var i=0;i<ASTEROID_CHILD_COUNT;i++)
			{
				entities.push(new Asteroid(this.pos, this.heightMap.min*ASTEROID_CHILD_SCALE))
			}
		}
	}
	draw()
	{
		super.draw()
		ctx.fillRect(this.pos.x, this.pos.y, 3, 3)
	}
}