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
			let endpoint_a = this.get_coords(i, offset, rot)
			let endpoint_b = this.get_coords((i+1)%this.map.length, offset, rot)
			let center = new _vector((endpoint_a.x + endpoint_b.x) / 2, (endpoint_a.y + endpoint_b.y) / 2)
			let vel_dir = Math.atan2(center.y - offset.y, center.x - offset.x)
			let speed = Math.random()*2
			ret_particles.push(
				new Fragment(
					endpoint_a,
					endpoint_b,
					new _vector(Math.cos(vel_dir)*speed, Math.sin(vel_dir)*speed),
					FRAGMENT_FADE_TIME
				)
			)
		}
		
		return ret_particles
	}
	heightAt(angle) {//returns the radius of the heightmap at a given angle to it
		/*var stepWidth = (Math.PI*2)/(this.heightMap.map.length)
		var actualAngle = (angle-this.rot)<0?(angle-this.rot)+((Math.PI*2)*Math.ceil(Math.abs(angle-this.rot)/(Math.PI*2))):(angle-this.rot)%(Math.PI*2)
		var h1 = this.heightMap.map[Math.floor(actualAngle/stepWidth)%this.heightMap.map.length]
		var h2 = this.heightMap.map[Math.ceil(actualAngle/stepWidth)%this.heightMap.map.length]
		var perc = (actualAngle/stepWidth)%1
		
		return Math.lerp(h1, h2, perc)*/
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