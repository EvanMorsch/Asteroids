const ENTITY_DEFAULT_FRAGMENT_LIFETIME = 1000
const ENTITY_DEFAULT_DUST_LIFETIME = 1000
const ENTITY_DUST_VEL = 2.5
const ENTITY_DUST_COUNT = 5
const ENTITY_FRAGMENT_SPEED_RANGE = {min:0.5, max:2}

class Entity
{
	constructor(pos, vel = new Position2D(0, 0), radius=10)
	{
		this.pos = pos
		this.rot = 0

		this.vel = vel
		this.rot_vel = 0

		this.active = true
        this.birth_time = Date.now()

		this.heightMap = new HeightMap(3, radius)
        this.fragment_lifetime = ENTITY_DEFAULT_FRAGMENT_LIFETIME
        this.dust_lifetime = ENTITY_DEFAULT_DUST_LIFETIME

		this.color = "white"

        this._collision_mask = []
	}
	update()
	{
		if (!this.active) return

		this.pos = this.pos.add(this.vel)
		this.rot += this.rot_vel

		this.keep_on_screen()
        //detect collisions
        let collidables = entities.filter(
            //filter for non-masked entities
            function(a)
            {
                for (var inst of this._collision_mask)
                {
                    if (a instanceof inst) 
                    {
                        return false
                    }
                }
                return true
            }, this
        )
        //we dont actually use some for its intended purpose...
        //we just want a foreach that stops at a success
        collidables.some(
            function(a)
            {
                if (this.is_colliding(a)) {
                    a.collide(this) //let the other know theyre being collided with
                    this.collide(a) //let them know who collided with eachother
                    return true
                }
            }, this
        )
	}
	keep_on_screen()
	{
		if (this.pos.x>(SCREENWIDTH+this.heightMap.max)) this.pos.x-=SCREENWIDTH+(this.heightMap.max*2);
		if (this.pos.x<(0-this.heightMap.max)) this.pos.x+=SCREENWIDTH+(this.heightMap.max*2);
		if (this.pos.y>(SCREENHEIGHT+this.heightMap.max)) this.pos.y-=SCREENHEIGHT+(this.heightMap.max*2);
		if (this.pos.y<(0-this.heightMap.max)) this.pos.y+=SCREENHEIGHT+(this.heightMap.max*2);
	}
    set_collision_mask(...masks)
    {
        //i dont like using the arguments object, not very readable
        this._collision_mask = []
        for (const mask of masks)
        {
            this._collision_mask.push(mask)
        }
    }
    is_colliding(a)
    {
        let dir_a_t = Math.atan2(this.pos.y-a.pos.y, this.pos.x-a.pos.x)
        let dir_t_a = Math.atan2(a.pos.y-this.pos.y, a.pos.x-this.pos.x)
        let coll_dist = this.heightMap.height_at(dir_t_a-this.rot)+a.heightMap.height_at(dir_a_t-a.rot)
        return Math.distance(this.pos, a.pos) <= coll_dist
    }
	collide(coll_with)
	{
		this.active = false

        //create particles with a zero vel
        let fragments = this.heightMap.to_particles(
            this.pos,
            this.rot
        )
        //set vel and fade time
        fragments.forEach(
            function(a)
            {
                let vel_dir = Math.atan2(a.pos.y - this.coll_bod.pos.y, a.pos.x - this.coll_bod.pos.x)
			    let speed = Math.rand_range(ENTITY_FRAGMENT_SPEED_RANGE.min, ENTITY_FRAGMENT_SPEED_RANGE.max)
                a.vel = Position2D.fromRad(speed, vel_dir).add(this.parent_bod.vel)
                a.fade.fade_time = this.parent_bod.fragment_lifetime
            },
            //thisarg
            {parent_bod: this, coll_bod: coll_with}
        )
		entities.push(...fragments)

        //create dust
        let dust = new Array(ENTITY_DUST_COUNT).fill().map(
            function() {
                let dust_dir = Math.rand_angle()
                return new Dust(
                    this.pos,
                    Position2D.fromRad(ENTITY_DUST_VEL, dust_dir),
                    this.dust_lifetime
                )
            }, this
        )
        entities.push(...dust)
	}
    draw() {
		ctx.setColor(this.color)
		this.heightMap.draw(this.pos, this.rot)
	}
}