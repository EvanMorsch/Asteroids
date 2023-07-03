const BULLET_LIFE = 1000      //in ms
const BULLET_RADIUS = 2     //in px

class Bullet extends Entity {
	constructor(pos, vel) {
		super(pos, vel, BULLET_RADIUS)
        this.set_collision_mask(Bullet, Ship, Particle)
	}
	update(ent) {
		super.update(ent)
		//activity is based on time alive
		this.active = this.active ? (Date.now() - this.birth_time) < BULLET_LIFE : false
	}
}