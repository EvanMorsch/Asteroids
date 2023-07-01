class Particle extends Entity
{
	constructor(pos, vel, speed = 1, fade = -1) {//if fade == -1, itll never fade
		if (fade < -1) throw new Error("Bad Particle fade val")

        super(pos, vel)

		this.fade = new Fade(fade)
	}
    update()
    {
        this.pos = this.pos.add(this.vel)
        this.active = this.fade.value > 0
    }
    draw(){}
}

class Dust extends Particle
{
    constructor(pos, vel, fade = -1)
    {
        if (fade < -1) throw new Error("Bad Dust fade val")

		super(
			pos, 
			vel, 
			Math.random() * 2, 
			fade
		)
    }
    draw() {
		ctx.setColor(this.fade.applyTo(255, 255, 255))
		ctx.fillRect(this.pos.x, this.pos.y, 1.5, 1.5)
	}
}

class Fragment extends Particle
{//fragments are line particles, they spin at random speeds (-0.05 - 0.05)
	constructor(a, b, vel, fade = -1)
    {
		if (fade < -1) throw new Error("Bad Fragment fade val")

		super(
			new _vector((a.x + b.x) / 2, (a.y + b.y) / 2), 
			vel, 
			Math.random() * 2, 
			fade
		)
		this.rot = Math.atan2(a.y - b.y, a.x - b.x)
		this.rot_vel = (Math.random() * 0.1) - 0.05
		this.SIZE = Math.distance(a, b) / 2
	}
	draw() {
		ctx.setColor(this.fade.applyTo(255, 255, 255))
		ctx.beginPath()
		ctx.moveTo(this.pos.x + (Math.cos(this.rot) * this.SIZE), this.pos.y + (Math.sin(this.rot) * this.SIZE))
		ctx.lineTo(this.pos.x - (Math.cos(this.rot) * this.SIZE), this.pos.y - (Math.sin(this.rot) * this.SIZE))
		ctx.stroke()
	}
}