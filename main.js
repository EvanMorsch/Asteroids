//points
	//time spent in low flight assist grants more points
	//large asts are worth less
//create world object and pass it into entities
//use thrust to limit ship vel
//have keyyboard belong to game class
//init entity with world val passed in
	//new World.Entity
	//world.CreateEntity()

init = function() {
	ctx.init()
	let keyboard = new _keyboard()
	keyboard.addKey(" ", true)

	world = new World(keyboard)
	world.init(1)

	loop();
}

loop = function() {
	requestAnimationFrame(loop)
	world.update()
	world.draw()
}

window.onload = init;
