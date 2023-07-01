const FRAGMENT_FADE_TIME = 1000

class HeightMap
{
	constructor(resolution, start_height = 0)
	{
		this.map = new Array(resolution).fill(start_height)
	}
	randomize(min, max)
	{
		this.map.forEach(
			function(a, b, c){
				c[b] = Math.rand_range(min, max)
			}
		)
	}
	get_coords(i, offset = new _vector(0, 0), rot = 0) {
		return new _vector(
			offset.x + ( Math.cos( ( (Math.PI * 2) * (i / this.map.length) ) + rot ) * this.map[i] ), 
			offset.y + ( Math.sin( ( (Math.PI * 2) * (i / this.map.length) ) + rot ) * this.map[i] )
		)
	}
	to_particles(offset = new _vector(0, 0), rot = 0)
	{
		var ret_particles = []

		for (let i=0;i<this.map.length;i++)
		{
			ret_particles.push(
				new Fragment( this.get_coords(i, offset, rot), this.get_coords((i+1)%this.map.length, offset, rot), offset, FRAGMENT_FADE_TIME )
			)
		}
		
		return ret_particles
	}
	draw(offset = new _vector(0, 0), rot = 0)
	{
		ctx.beginPath()
		this.map.forEach(function(a, b) {
			b==0 ? ctx.moveTo(this.get_coords(b, offset, rot).x, this.get_coords(b, offset, rot).y) : ctx.lineTo(this.get_coords(b, offset, rot).x, this.get_coords(b, offset, rot).y)
		}, this)
		ctx.closePath()
		ctx.stroke()
	}
}