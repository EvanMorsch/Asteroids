Math.distance = function(a,b) {
	return Math.sqrt(((a.x-b.x)*(a.x-b.x))+((a.y-b.y)*(a.y-b.y)))
}
Math.angle = function(a,b) {
	return Math.atan2(b.y-a.y,b.x-a.x)
}
Math.lerp = function(a, b, f) {
    return a + f * (b - a);
}

class Position2D {
	constructor (x, y, r=0) {
		this.x = x
		this.y = y
		this.r = r
	}
	static fromRad(r, theta)
	{
		return new Position2D(Math.cos(theta)*r, Math.sin(theta)*r)
	}
	add(a) {
		return new Position2D(this.x+a.x, this.y+a.y, this.r+a.r)
	}
	subtract(a) {
		return new Position2D(this.x-a.x, this.y-a.y, this.r-a.r)
	}
	mul(a) {
		return new Position2D(this.x*a.x, this.y*a.y, this.r*a.r)
	}
	scale(a) {
		return new Position2D(this.x*a, this.y*a, this.r*a)
	}
}