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
        return this.elapsed / this.start_time
    }
    //apply fading to rgb value and return formatted string
	applyTo(r, g, b)
	{
		return "rgba("+(255*this.value)+", "+(255*this.value)+", "+(255*this.value)+", 1)"
	}
}