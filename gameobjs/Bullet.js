const BULLET_LIFE = 1000      //in ms
const BULLET_RADIUS = 2     //in px
const BULLET_RESOLUTION = 3 //heightmap resolution for bullet

class Bullet extends Entity {
	constructor(pos, vel) {
		super(pos, vel, BULLET_RADIUS)
        this.set_collision_mask(Bullet, Ship, Particle) //dont hit these things
	}
	update(ent) {
		super.update(ent)
		//activity is based on time alive
		this.active = this.active ? (Date.now() - this.birth_time) < BULLET_LIFE : false
	}
}