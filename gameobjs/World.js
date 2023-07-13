class World
{
    constructor()
    {
        this.entities = []
        this.paused = false
        this.level = 0
        this.showInstructions = false
        this.gameOver = false
        this.initTime = undefined
    }
    init(level)
    {
        this.entities = [new Ship()]
        this.level = level
        this.gameOver = false
        this.paused = false
        this.showInstructions = true
        this.initTime = Date.now()
    }
    update() {
        if (this.paused) return
        this.entities.forEach(a=>a.update(this.entities))
        this.entities = this.entities.filter(a=>a.active)

        if (this.entities.length==1) {
            this.level++
            for (let i in new Array(10))
            {
                this.entities.push(new Asteroid(
                    new Position2D(
                        Math.round(Math.random())*SCREENWIDTH,
                        Math.round(Math.random())*SCREENHEIGHT
                    )
                ))
            }
        }
    }
    draw()
    {
        ctx.clearScreen()
        ctx.setColor("white")
        this.entities.forEach(a=>a.draw())
        //draw level text
        ctx.setColor("white")
        ctx.font = "20px sans-serif"
        ctx.fillText("Level "+this.level, (SCREENWIDTH/2)-(ctx.measureText("Level "+this.level).width/2), 20)
        if (this.showInstructions) {
            ctx.font = "10px sans-serif"
            ctx.fillText("Use Wasd to move, Space to fire, and up/down to change flight assist", (SCREENWIDTH/2)-(ctx.measureText("Use Wasd to move, Space to fire, and up/down to change flight assist").width/2), 30)
            if (Date.now()-this.initTime>10000) this.showInstructions = false
        }
        if (this.gameOver) this.drawGameover()
    }
    drawGameover() {
        var ts = 20
        ctx.font = "20px sans-serif"
        var tw = ctx.measureText("GAME OVER!").width
        ctx.clearRect((SCREENWIDTH/2)-(tw/1.5), (SCREENHEIGHT/2)-(10), tw*1.333, ts*1.333)
        ctx.strokeRect((SCREENWIDTH/2)-(tw/1.5), (SCREENHEIGHT/2)-(10), tw*1.333, ts*1.333)
        ctx.fillText("GAME OVER!", (SCREENWIDTH/2)-(tw/2), (SCREENHEIGHT/2)+(ts/1.75))
    }
}