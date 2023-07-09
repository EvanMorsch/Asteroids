class HeightMap
{
	constructor(resolution, start_height = 0)
	{
		this.map = new Array(resolution).fill(start_height)
	}
	get min()
	{
		return Math.min(...this.map)
	}
	get max()
	{
		return Math.max(...this.map)
	}
	randomize(min, max)
	{
		this.map.forEach(
			function(a, b, c){
				c[b] = Math.rand_range(min, max)
			}
		)
	}
	get_coords(i, offset = new Position2D(0, 0)) {
		return Position2D.fromRad(
			this.map[i],
			( Math.PI2 * (i / this.map.length) ) + offset.r
		).add(offset)
	}
	to_particles(offset = new Position2D(0, 0))
	{
		var ret_particles = []

		for (let i=0;i<this.map.length;i++)
		{
			let endpoint_a = this.get_coords(i, offset)
			let endpoint_b = this.get_coords((i+1)%this.map.length, offset)
			ret_particles.push(
				new Fragment(
					endpoint_a,
					endpoint_b
				)
			)
		}
		
		return ret_particles
	}
	height_at(angle) {//returns the radius of the heightmap at a given angle to it
		var stepWidth = Math.PI2/(this.map.length)
		angle = (angle)<0?(angle)+(Math.PI2*Math.ceil(Math.abs(angle)/Math.PI2)):
		(angle)%Math.PI2
		let h1 = this.map[Math.floor(angle/stepWidth)%this.map.length]
		let h2 = this.map[Math.ceil(angle/stepWidth)%this.map.length]
		let perc = (angle/stepWidth)%1

		return Math.lerp(h1, h2, perc)
	}
	draw(offset = new Position2D(0, 0))
	{
		ctx.beginPath()
		this.map.forEach(function(a, b) {
			b==0 ? 
			ctx.moveTo(this.get_coords(b, offset).x, this.get_coords(b, offset).y) : 
			ctx.lineTo(this.get_coords(b, offset).x, this.get_coords(b, offset).y)
		}, this)
		ctx.closePath()
		ctx.stroke()
	}
}