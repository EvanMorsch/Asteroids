const BULLET_LIFE = 1000      //in ms
const BULLET_RADIUS = 2     //in px
const BULLET_RESOLUTION = 3 //heightmap resolution for bullet

class Bullet extends Entity {
	constructor(pos, vel) {
		super(pos, vel)
		this.heightMap = new HeightMap(BULLET_RESOLUTION, BULLET_RADIUS)
		this.active = true
        this.collision_mask = [Bullet, Ship]
	}
	update(ent) {
		super.update(ent)
		this.active = this.active ? (Date.now() - this.birth_time) < BULLET_LIFE : false
	}
    collide()
    {
        super.collide()
        console.log("BULLCOLL")
    }
}