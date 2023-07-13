//points
	//time spent in low flight assist grants more points
	//large asts are worth less
//create world object and pass it into entities
//use thrust to limit ship vel
//have keyyboard belong to game class

init = function() {
	ctx.init()
	keyboard = new _keyboard();
	keyboard.addKey(" ", true)

	world = new World()
	world.init()

	loop();
}

loop = function() {
	requestAnimationFrame(loop)
	world.update()
	world.draw()
}

window.onload = init;
