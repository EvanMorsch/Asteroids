//color scaler function (b-w scale)
//poly line array drawing function
//update to class based?..

var c = document.getElementById("Canvas");//create global ctx object
ctx = c.getContext("2d");

ctx.init = function() {
	ctx.canvas.width = window.innerWidth;//set canvas size
	ctx.canvas.height = window.innerHeight;
	SCREENWIDTH = window.innerWidth;//create size global
	SCREENHEIGHT = window.innerHeight;
}
ctx.changeFontSize = function(ns=12) {//searches for the first non number and replaces to that char with the new size
	for (var i=0;i<ctx.font.length;i++) {
		if (isNaN(ctx.font.charAt(i))) {
			ctx.font = ns+ctx.font.substr(2)
		}
	}
}
ctx.strokeCircle = function(x,y,r,color="white") {
	ctx.beginPath();
	ctx.arc(x,y,r,0,Math.PI*2);
	ctx.strokeStyle = color
	ctx.stroke()
}
ctx.clearScreen = function() {//clears entire screen
	ctx.clearRect(0,0,SCREENWIDTH,SCREENHEIGHT);
}
ctx.setColor = function(col) {//sets all drawing functions to given color
	ctx.strokeStyle = col
	ctx.fillStyle = col
}
