class World{
    constructor(graph, roadWidth = 100,
         roadRoundess = 10,
         buildingWidth = 150,
         buildingMinLength = 150,
         spacing = 50
    ){
        this.graph = graph;
        this.roadWidth = roadWidth;
        this.roadRoundess = roadRoundess;
        this.buildingMinLength = buildingMinLength;
        this.buildingWidth = buildingWidth;
        this.spacing = spacing;

        this.envelopes = [];
        this.roadBorders = [];
        this.buildings = [];

        this.generate();
    }

    generate(){
        this.envelopes.length = 0;
        for(const seg of this.graph.segments){
            this.envelopes.push(new Envelope(seg, this.roadWidth, this.roadRoundess));
        }

        this.roadBorders = Polygon.union(this.envelopes.map((e) => e.poly));

        this.buildings = this.#generateBuildings();
    }

    draw(ctx){
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
    }

    #generateBuildings(){
        const tmpEnvelopes = [];
        for(const seg of this.graph.segments)   {
            tmpEnvelopes.push(new Envelope(seg, this.roadWidth + this.buildingWidth + this.spacing*2, this.roadRoundess));
        }
        return tmpEnvelopes;
    }
}