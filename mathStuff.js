Math.distance = function(a,b) {
	return Math.sqrt(((a.x-b.x)*(a.x-b.x))+((a.y-b.y)*(a.y-b.y)))
}
Math.angle = function(a,b) {
	return Math.atan2(b.y-a.y,b.x-a.x)
}
Math.lerp = function(a, b, f) {
    return a + f * (b - a);
}

class _vector {
	constructor (x,y,z=null) {
		this.x = x;
		this.y = y;
		if (z!=null) this.z = z
	}
	add(a) {
		return new _vector(this.x+a.x,this.y+a.y,this.z+a.z);
	}
	subtract(a) {
		return new _vector(this.x-a.x,this.y-a.y,this.z-a.z);
	}
}

Math.rotatePoint = function(p, c, angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var nx = (cos * (p.x - c.x)) + (sin * (p.y - c.y)) + c.x;
        var ny = (cos * (p.y - c.y)) - (sin * (p.x - c.x)) + c.y;
    return new _VECTOR3D(nx,ny,p.z);
}

Math.cot = function(a) {
   return 1/Math.tan(a);
}

Math.pointInTriangle = function(pt, tr)
{
	function sign(p1,p2,p3)
	{
	    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
	}

    var d1 = sign(pt, tr.p1, tr.p2);
    var d2 = sign(pt, tr.p2, tr.p3);
    var d3 = sign(pt, tr.p3, tr.p1);

   	var has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    var has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
}

Math.eulerToVector = function(a) { //WIP
		return new _VECTOR3D(
			-Math.cos(a.yaw)*Math.sin(a.pitch)-Math.sin(a.yaw),
			-Math.sin(a.yaw)*Math.sin(a.pitch)+Math.cos(a.yaw),
			Math.cos(a.pitch)
		)
}
Math.rayTriangleIntersection = function(rayOrigin,rayVector,inTriangle) {
	kEpsilon = 0.0000000001;
    v0v1 = inTriangle.p2.subtract(inTriangle.p1);
    v0v2 = inTriangle.p3.subtract(inTriangle.p1);
    pvec = rayVector.cross(v0v2);
	det = v0v1.dot(pvec);
    // if the determinant is negative the triangle is backfacing
    // if the determinant is close to 0, the ray misses the triangle
    if (det < kEpsilon) return false;
    // ray and triangle are parallel if det is close to 0
    if (Math.abs(det) < kEpsilon) return false;
    invDet = 1 / det;
 
    tvec = rayOrigin.subtract(inTriangle.p1);
    u = tvec.dot(pvec) * invDet;
    if (u < 0 || u > 1) return false;
 
    qvec = tvec.cross(v0v1);
    v = rayVector.dot(qvec) * invDet;
    if (v < 0 || u + v > 1) return false;
 
    t = v0v2.dot(qvec) * invDet;
 
    return true;
}

Math.average = function(a) {
	var b=0;
	for (var i=0;i<a.length;i++) {
		b+=a[i]
	}
	return b/a.length
}
