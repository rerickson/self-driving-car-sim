class Envelope {
    constructor(skeleton, width, roundness = 1){
        this.skeleton = skeleton;
        this.poly = this.#generatePolygon(width, roundness);
    }

    #generatePolygon(width, roundness){
        const { p1, p2 } = this.skeleton;
        const radius = width/2;
        const alpha = angle(subtract(p1, p2));
        const alphaCW = alpha + Math.PI / 2;
        const alphaCCW = alpha - Math.PI / 2;

        const step = Math.PI / Math.max(1,roundness);
        const eps = step/2;
        const points = [];
        for(let i = alphaCCW; i<= alphaCW + eps; i+= step){
            points.push(translate(p1, i, radius));
        }
        for(let i = alphaCCW; i<= alphaCW + eps; i+= step){
            points.push(translate(p2, Math.PI + i, radius));
        }

        return new Polygon(points);
    }

    draw(ctx, options){
        this.poly.draw(ctx, options);
    }
}