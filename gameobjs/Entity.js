const ENTITY_DEFAULT_FRAGMENT_LIFETIME = 1000
const ENTITY_DEFAULT_DUST_LIFETIME = 1000
const ENTITY_DUST_VEL = 2.5
const ENTITY_DUST_COUNT = 5

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
        return Math.distance(this.pos, a.pos) <= this.heightMap.height_at(dir_t_a, this)+a.heightMap.height_at(dir_a_t, a)
    }
	collide()
	{
		this.active = false

        //create particles
        let fragments = this.heightMap.to_particles(
            this.pos,
            this.rot
        )
        fragments.forEach(
            (a)=>{a.fade.fade_time = this.fragment_lifetime}
        )
		entities.push(...fragments)

        //create dust
        let dust = new Array(ENTITY_DUST_COUNT).fill().map(
            function() {
                let dust_dir = Math.rand_range(0, 2 * Math.PI)
                return new Dust(
                    this.pos,
                    this.vel.add(Position2D.fromRad(ENTITY_DUST_VEL, dust_dir)),
                    this.dust_lifetime
                )
            }, this
        )
        entities.push(...dust)
	}
    draw() {
		ctx.setColor(this.color)
		this.heightMap.draw(this.pos, 0)
	}
}