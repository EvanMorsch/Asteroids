class Particle extends Entity
{
	constructor(pos, vel, speed = 1, fade = -1) {//if fade == -1, itll never fade
		if (fade < -1) throw new Error("Bad Particle fade val")

        super(pos, vel)

		this.fade = new Fade(fade)
	}
    draw(){}
}
class Repulsive_Particle extends Particle
{
	constructor(pos, repulsion_point, speed = 1, fade = -1) {
		if (fade < -1) throw new Error("Bad Repulsive_Particle fade val")

		let vel_dir = Math.atan2(pos.y-repulsion_point.y, pos.x-repulsion_point.x)

		super(
			pos, 
			new _vector(Math.cos(vel_dir)*speed, Math.sin(vel_dir)*speed), 
			speed, 
			fade
		)
	}
}

class Fragment extends Repulsive_Particle
{//fragments are line particles, they spin at random speeds (-0.05 - 0.05)
	constructor(a, b, repulsion_point, fade = -1) {
		if (fade < -1) throw new Error("Bad Fragment fade val")

		super(
			new _vector((a.x + b.x) / 2, (a.y + b.y) / 2), 
			repulsion_point, 
			Math.random() * 2, 
			fade
		)
		this.rot = Math.atan2(a.y - b.y, a.x - b.x)
		this.rot_vel = (Math.random() * 0.1) - 0.05
		this.SIZE = Math.distance(a, b) / 2
	}
	update() {
		this.pos = this.pos.add(this.vel)
		this.fade.fade()
	}
	draw() {
		ctx.setColor(this.fade.applyTo(255, 255, 255))
		ctx.beginPath()
		ctx.moveTo(this.pos.x + (Math.cos(this.rot) * this.SIZE), this.pos.y + (Math.sin(this.rot) * this.SIZE))
		ctx.lineTo(this.pos.x - (Math.cos(this.rot) * this.SIZE), this.pos.y - (Math.sin(this.rot) * this.SIZE))
		ctx.stroke()
	}
}