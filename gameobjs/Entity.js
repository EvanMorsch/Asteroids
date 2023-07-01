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

		this.heightMap = new HeightMap(3, 1)
        this.radius = radius //will deprecate
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
        for (let i = 0; i < Math.rand_range(5, 10); i++)
        {
            let dust_dir = Math.rand_range(0, 2 * Math.PI)
            let dust_speed = 2.5
            entities.push(
                new Dust(
                    this.pos,
                    this.vel.add(new _vector(
                        Math.cos(dust_dir)*dust_speed,
                        Math.sin(dust_dir)*dust_speed
                    )),
                    1000
                )
            )
        }
    }
    draw() {
		ctx.setColor(this.color)
		this.heightMap.draw(this.pos, 0)
	}
}