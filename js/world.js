class World{
    constructor(graph, roadWidth = 100,
         roadRoundess = 10,
         buildingWidth = 150,
         buildingMinLength = 150,
         spacing = 50,
         treeSize = 160
    ){
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundess = roadRoundess;
        this.buildingMinLength = buildingMinLength;
        this.buildingWidth = buildingWidth;
        this.spacing = spacing;
        this.treeSize = treeSize;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];
        this.trees = [];

        this.generate();
    }

    generate(){
        this.envelopes.length = 0;
        for(const seg of this.graph.segments){
            this.envelopes.push(new Envelope(seg, this.roadWidth, this.roadRoundess));
        }

        this.roadBorders = Polygon.union(this.envelopes.map((e) => e.poly));

        this.buildings = this.#generateBuildings();
        this.trees = this.#generateTrees();
    }

    draw(ctx, viewPoint){
        for(const env of this.envelopes){
            env.draw(ctx, {fill: "#BBB", stroke: "#BBB", lineWidth: 15});
        }
        for(const seg of this.graph.segments){
            seg.draw(ctx, {color: "white", width: 4, dash: [10,10]});
        }
        for(const seg of this.roadBorders){
            seg.draw(ctx, { color: "white", width: 4});
        }
        for(const bld of this.buildings){
            bld.draw(ctx);
        }

        for(const tree of this.trees){
            tree.draw(ctx, viewPoint);
        }
    }

    #generateBuildings(){
        const tmpEnvelopes = [];
        for(const seg of this.graph.segments)   {
            tmpEnvelopes.push(new Envelope(seg, this.roadWidth + this.buildingWidth + this.spacing*2, this.roadRoundess));
        }

        const guides = Polygon.union(tmpEnvelopes.map((e)=>e.poly));

        for (let i = 0; i < guides.length; i++) {
            const seg = guides[i];
            if(seg.length() < this.buildingMinLength){
                guides.splice(i,1);
                i--;
            }
            
        }

        const supports = [];
        for(let seg of guides){
            const len = seg.length() + this.spacing;
            const buildingCount = Math.floor(len / (this.buildingMinLength + this.spacing));
            const buildingLength = len / buildingCount - this.spacing;

            const dir = seg.directionVector();
            
            let q1 = seg.p1;
            let q2 = add(q1, scale(dir, buildingLength));
            supports.push(new Segment(q1, q2));

            for (let i = 2; i <= buildingCount; i++) {
                
                q1 = add(q2, scale(dir, this.spacing));
                q2 = add(q1, scale(dir, buildingLength));
                supports.push(new Segment(q1, q2));
            }
        }

        const bases = [];
        for(const seg of supports){
            bases.push( new Envelope(seg, this.buildingWidth).poly);
        }

        const eps = .001;
        for (let i = 0; i < bases.length; i++) {
            for (let j = i + 1; j < bases.length; j++) {
                if(bases[i].intersectsPoly(bases[j]) ||
                    bases[i].distanceToPoly(bases[j]) < this.spacing - eps
                ){
                    bases.splice(j, 1);
                    j--;
                }
            }
        }
        return bases;
    }

    #generateTrees(){
        const trees = [];
        const points = [
            ...this.roadBorders.map((s) => [s.p1, s.p2]).flat(),
            ...this.buildings.map((b) => b.points).flat()
        ];

        const left = Math.min(...points.map((p)=> p.x));
        const right = Math.max(...points.map((p)=> p.x));
        
        const top = Math.max(...points.map((p)=> p.y));
        const bottom = Math.min(...points.map((p)=> p.y));

        const illegalPolys = [
            ...this.buildings, 
            ...this.envelopes.map((e)=> e.poly)
        ];

        let tryCount = 0;
        while (tryCount < 100){
            tryCount++;
            const p = new Point(lerp(left, right, Math.random()),lerp(bottom, top, Math.random()));
            if(this.#intersectsWithStructure(p, illegalPolys)){
                continue;
            }

            if(this.#isCloseToAnotherTree(p, trees)){
                continue;
            }

            if(this.#isNotCloseToAnything(p, illegalPolys)){
                continue;
            }
            trees.push(new Tree(p, this.treeSize));
            tryCount = 0;
        
        }
        return trees;
    }

    #intersectsWithStructure(p, illegalPolys){
        for(const poly of illegalPolys){
            if(poly.containsPoint(p) || poly.distanceToPoint(p) < this.treeSize/2){
                return true;
            }
        }
        return false;
    }

    #isCloseToAnotherTree(p, trees){
        for(const tree of trees){
            if(distance(tree.center, p) < this.treeSize){
                return true;
            }
        }
        return false;
    }

    #isNotCloseToAnything(p, illegalPolys){
        for(const poly of illegalPolys){
            if(poly.distanceToPoint(p) < this.treeSize * 2){
                return false;
            }
        }
        return true;
    }
}