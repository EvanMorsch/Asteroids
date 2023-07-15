//points
	//time spent in low flight assist grants more points
	//large asts are worth less
	//add an asteroid every level
//move toParticles out of heightmap or make it return list of lines and make caller turn into entities

var world

init = function() {
	ctx.init()
	let keyboard = new _keyboard()
	keyboard.addKey(" ", true)

	world = new World(ctx, keyboard)
	world.init(1)

	loop();
}

loop = function() {
	requestAnimationFrame(loop)
	world.update()
	world.draw()
}

window.onload = init;
