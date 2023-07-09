//little helper class to control the fading of various things
//works by keeping track of its instantiation time and 'counting down' to its designated fade time
class Fade
{
	constructor(fade_time)
	{
		this.fade_time = fade_time
		this.start_time = Date.now()
	}
    //get the elapsed ms since instantiatiojn
	get elapsed()
	{
		return Date.now() - this.start_time;
	}
    //get the effective fade value based on time since instantiation
    get value()
    {
        //ensure its always from 0-1
        return Math.max(0,
                    Math.min(
                        1 - (this.elapsed / this.fade_time),
                        1)
                    )
    }
    //apply fading to rgb value and return formatted string
	applyTo(r, g, b)
	{
		return "rgba("+(r*this.value)+", "+(g*this.value)+", "+(b*this.value)+", 1)"
	}
}