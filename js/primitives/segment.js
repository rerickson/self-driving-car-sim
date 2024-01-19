class Segment {
    constructor(p1, p2){
        this.p1 = p1;
        this.p2 = p2;
    }

    equals(segment){
        return this.includesPoint(segment.p1) && this.includesPoint(segment.p2);
    }

    includesPoint(point){
        return this.p1.equals(point) || this.p2.equals(point);
    }

    draw(ctx, {width = 2, color = "black", dash = []} = {}){
        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.setLineDash(dash);
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    length() {
        return distance(this.p1, this.p2);
    }

    directionVector(){
        return normalize(subtract(this.p2, this.p1));
    }
}