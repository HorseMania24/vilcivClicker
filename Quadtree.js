class Point {
    constructor(x, y) {
        this.PosX = x
        this.PosY = y
    }
}

class Rectangle {
    constructor(PosX, PosY, Width, Height) {
        this.PosX = PosX
        this.PosY = PosY
        this.Width = Width
        this.Height = Height
    }

    ContainsPoint(point) {
        return (point.PosX > this.PosX - this.Width && 
            point.PosX < this.PosX + this.Width &&
            point.PosY > this.PosY - this.Height &&
            point.PosY < this.PosY + this.Height);
    }
}

class Quadtree {
    constructor(boundary) {
        this.Boundary = boundary
        this.Capacity = 4
        this.Points = []
        this.IsSubdivided = false
        this.Northwest = null
        this.Northeast = null
        this.Southwest = null
        this.Southeast = null
    }

    SubdivideQuad() {
        let Ne = new Rectangle(this.Boundary.PosX + this.Boundary.Width/2, this.Boundary.PosY - this.Boundary.Height/2, this.Boundary.Width/2, this.Boundary.Height/2)
        this.Northeast = new Quadtree(Ne)
        let Nw = new Rectangle(this.Boundary.PosX - this.Boundary.Width/2, this.Boundary.PosY - this.Boundary.Height/2, this.Boundary.Width/2, this.Boundary.Height/2)
        this.Northwest = new Quadtree(Nw)
        let Se = new Rectangle(this.Boundary.PosX + this.Boundary.Width/2, this.Boundary.PosY + this.Boundary.Height/2, this.Boundary.Width/2, this.Boundary.Height/2)
        this.Southeast = new Quadtree(Se)
        let Sw = new Rectangle(this.Boundary.PosX - this.Boundary.Width/2, this.Boundary.PosY + this.Boundary.Height/2, this.Boundary.Width/2, this.Boundary.Height/2)
        this.Southwest = new Quadtree(Sw)
        this.IsSubdivided = true
    }

    InsertPoint(point) {
        if (!this.Boundary.ContainsPoint(point)) {
            return
        }

        if (this.Points.length < this.Capacity) {
            this.Points.push(point)
        } else {
            if (!this.IsSubdivided) {
                this.SubdivideQuad()
            }
            this.Northeast.InsertPoint(point)
            this.Northwest.InsertPoint(point)
            this.Southeast.InsertPoint(point)
            this.Southwest.InsertPoint(point)
        }
    }

    ShowQuad() {
        ctx.beginPath();
        ctx.fillStyle = "white"
        ctx.rect(this.Boundary.PosX, this.Boundary.PosY, this.Boundary.Width * 2, this.Boundary.Height * 2);
        if (this.IsSubdivided) {
            this.Northwest.ShowQuad()
            this.Northeast.ShowQuad()
            this.Southwest.ShowQuad()
            this.Southeast.ShowQuad()
        }
        for (let p of this.Points) {
            ctx.fillRect(p.PosX,p.PosY,2,2)
        }
        ctx.stroke();
    }
}