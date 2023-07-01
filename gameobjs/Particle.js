const PARTICLE_DEFAULT_COLOR = [255, 255, 255]
const PARTICLE_DEFAULT_SIZE = 1.5
const FRAGMENT_ROT_VEL_RANGE = [-0.05, 0.05]

class Particle extends Entity
{
	constructor(pos, vel, fade = -1) {//if fade == -1, itll never fade
        super(pos, vel)

		this.fade = new Fade(fade)

        this.collision_mask = [Bullet, Ship, Particle, Asteroid]
	}
    update(ent)
    {
        super.update(ent)
        this.active = this.fade.value > 0
    }
    draw() {
		ctx.setColor( this.fade.applyTo(...PARTICLE_DEFAULT_COLOR) )
		ctx.fillRect( this.pos.x, this.pos.y, PARTICLE_DEFAULT_SIZE, PARTICLE_DEFAULT_SIZE )
	}
}

//created by engine and explosions as 'dust particles'
class Dust extends Particle
{
    constructor(pos, vel, fade = -1)
    {
		super(
			pos, 
			vel, 
			fade
		)
    }
}

//fragments are line particles, they spin at random speeds
class Fragment extends Particle
{
	constructor(a, b, vel, fade = -1)
    {
        let frag_center = new _vector((a.x + b.x) / 2, (a.y + b.y) / 2)
		super(
			frag_center,
			vel, 
			fade
		)
		this.rot = Math.atan2(a.y - b.y, a.x - b.x)
		this.rot_vel = Math.rand_range(...FRAGMENT_ROT_VEL_RANGE)
		this.frag_len = Math.distance(a, frag_center)
	}
	draw() {
		ctx.setColor( this.fade.applyTo(...PARTICLE_DEFAULT_COLOR) )
		ctx.beginPath()
		ctx.moveTo(this.pos.x + (Math.cos(this.rot) * this.frag_len), this.pos.y + (Math.sin(this.rot) * this.frag_len))
		ctx.lineTo(this.pos.x - (Math.cos(this.rot) * this.frag_len), this.pos.y - (Math.sin(this.rot) * this.frag_len))
		ctx.stroke()
	}
}