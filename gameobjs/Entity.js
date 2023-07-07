const ENTITY_DEFAULT_LIFETIME = 1000
const ENTITY_DUST_VEL = 2.5
const ENTITY_DUST_COUNT = 5

class Entity
{
	constructor(pos, vel = new _vector(0, 0), radius=10)
	{
		this.pos = pos
		this.rot = 0

		this.vel = vel
		this.rot_vel = 0

		this.active = true
        this.birth_time = Date.now()

		this.heightMap = new HeightMap(3, radius)
        this.particle_lifetime = ENTITY_DEFAULT_LIFETIME

        this.radius = radius //will deprecate in favor of heightmap size tracking
		this.color = "white"

        this.collision_mask = []
	}
	update(ent)
	{
		if (!this.active) return

		this.pos = this.pos.add(this.vel)
		this.rot += this.rot_vel

		this.keep_on_screen()
        //detect collisions
		if (//bullets overlaps quite a bit once theyre detected but it just because of the speed of them
            ent.filter(
                function(a){
                    for (var inst of this.collision_mask)
                    {
                        if (a instanceof inst) 
                        {
                            return false
                        }
                    }
                    //console.log(a)
                    return true
                }, this
            )
            .some(function(a){
                        if (this.is_colliding(a)) {
                            a.collide(ent)
                            return true;
                        }
                        return false;
                    }
            , this)
        ) this.collide(ent)
	}
	keep_on_screen()
	{
		if (this.pos.x>(SCREENWIDTH+this.radius)) this.pos.x-=SCREENWIDTH+(this.radius*2);
		if (this.pos.x<(0-this.radius)) this.pos.x+=SCREENWIDTH+(this.radius*2);
		if (this.pos.y>(SCREENHEIGHT+this.radius)) this.pos.y-=SCREENHEIGHT+(this.radius*2);
		if (this.pos.y<(0-this.radius)) this.pos.y+=SCREENHEIGHT+(this.radius*2);
	}
    set_collision_mask(...masks)
    {
        //i dont like using the arguments object, not very readable
        this.collision_mask = []
        for (const mask of masks)
        {
            this.collision_mask.push(mask)
        }
    }
    is_colliding(a)
    {
        //console.log(Math.distance(this.pos, a.pos))
        return Math.distance(this.pos, a.pos) <= this.radius+a.radius
    }
	collide()
	{
		this.active = false
        this.explode()
	}
    explode()
    {

		//create particles
        let fragments = this.heightMap.to_particles(
            this.pos,
            this.rot
        )
        fragments.forEach(
            (a)=>{a.fade.fade_time = this.particle_lifetime}
        )
		entities.push(...fragments)

        //create dust
        let dust = new Array(ENTITY_DUST_COUNT).fill().map(
            function() {
                let dust_dir = Math.rand_range(0, 2 * Math.PI)
                return new Dust(
                    this.pos,
                    this.vel.add(new _vector(
                        Math.cos(dust_dir)*ENTITY_DUST_VEL,
                        Math.sin(dust_dir)*ENTITY_DUST_VEL
                    )),
                    this.particle_lifetime
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