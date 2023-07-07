//do a once-over and organize everything
	//move constants to settings if possible
	//comment
//points
	//time spent in low flight assist grants more points
//move constants to a settings object (practice implementing pseudo-constants)
//create new velocity and pos object that contains the rotation as well
//create world object and pass it into entities
//add attrib to entity to control explosion particles (so ship doesnt double explode)
//make static vectro function to support from_rad(r,theta)

Math.rand_range = function(min, max)
{
	return ( Math.random() * (max-min) ) + (min)
}

init = function() {
	ctx.init()
	keyboard = new _keyboard();
	keyboard.addKey(" ", true)

	entities = [new Ship()]
	for (let i of Array(10))
	{
		console.log(i)
		entities.push(new Asteroid(
			new Position2D(
				Math.round(Math.random())*SCREENWIDTH,
				Math.round(Math.random())*SCREENHEIGHT
			)
		))
	}
	PAUSED = false//used for debugging
	GAMEOVER = false
	LEVEL = 1
	SHOWINSTRUCTIONS = true
	INITTIME = Date.now()

	loop();
}

update = function() {
	entities.forEach(a=>a.update(entities))
	entities = entities.filter(a=>a.active)
}

drawGameover = function() {
	var ts = 20
	ctx.font = "20px sans-serif"
	var tw = ctx.measureText("GAME OVER!").width
	ctx.clearRect((SCREENWIDTH/2)-(tw/1.5), (SCREENHEIGHT/2)-(10), tw*1.333, ts*1.333)
	ctx.strokeRect((SCREENWIDTH/2)-(tw/1.5), (SCREENHEIGHT/2)-(10), tw*1.333, ts*1.333)
	ctx.fillText("GAME OVER!", (SCREENWIDTH/2)-(tw/2), (SCREENHEIGHT/2)+(ts/1.75))
}

draw = function() {
	ctx.clearScreen()
	ctx.setColor("white")
	entities.forEach(a=>a.draw())
	//draw level text
	ctx.setColor("white")
	ctx.font = "20px sans-serif"
	ctx.fillText("LEVEL "+LEVEL, (SCREENWIDTH/2)-(ctx.measureText("LEVEL "+LEVEL).width/2), 20)
	if (SHOWINSTRUCTIONS) {
		ctx.font = "10px sans-serif"
		ctx.fillText("Use Wasd to move, Space to fire, and up/down to change flight assist", (SCREENWIDTH/2)-(ctx.measureText("Use Wasd to move, Space to fire, and up/down to change flight assist").width/2), 30)
		if (Date.now()-INITTIME>10000) SHOWINSTRUCTIONS = false
	}
}

loop = function() {
	requestAnimationFrame(loop)
	if (!PAUSED) update()
	draw()
	if (GAMEOVER) drawGameover()
	if (entities.length==1) {
		LEVEL++
		for (let i in new Array(10))
		{
			entities.push(new Asteroid(
				new Position2D(
					Math.round(Math.random())*SCREENWIDTH,
					Math.round(Math.random())*SCREENHEIGHT
				)
			))
		}
	}
}

window.onload = init;
