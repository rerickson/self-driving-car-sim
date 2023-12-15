class GraphEditor{
    constructor(viewport, graph){
        this.viewport = viewport;
        this.canvas = viewport.canvas;
        this.graph = graph;

        this.ctx = this.canvas.getContext("2d");

        this.selected = null;
        this.hovered = null;
        this.dragging = false;
        this.mouse = null;

        this.#addEventListeners();
    }

    display(){
        this.graph.draw(this.ctx);
        if(this.selected){
            const intent = this.hovered ? this.hovered : this.mouse;
            new Segment(this.selected, intent).draw(this.ctx, {dash: [3,3]});
            this.selected.draw(this.ctx, {outline: true});
        }
        if(this.hovered){
            this.hovered.draw(this.ctx, {fill: true});
        }
    }

    dispose(){
        this.graph.dispose();
        this.selected = null;
        this.hovered = null;
    }

    #addEventListeners(){
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));

        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));

        this.canvas.addEventListener("mouseup", () => {
            this.dragging = false;
        });

        this.canvas.addEventListener("contextmenu", (evt) => { evt.preventDefault();});

    }

    #selectPoint(point){
        if(this.selected){
            this.graph.tryAddSegment(new Segment(this.selected, point));
        }
        this.selected = point;
    }
    
    #removePoint(point){
        this.graph.removePoint(point);
        if(this.selected == point){
            this.selected = null;
        }
        this.hovered = null;
    }

    #handleMouseDown(evt){
        if(evt.button == 2){ // right click
            if(this.selected){
                this.selected = null;
            } else if(this.hovered){
                this.#removePoint(this.hovered);
            }
        }
        if(evt.button == 0){ // left click
            if(this.hovered){
                this.#selectPoint(this.hovered);
                this.dragging = true;
                return;
            }
            this.graph.addPoint(this.mouse);
            this.#selectPoint(this.mouse);
            this.hovered = this.mouse;
        }
    }

    #handleMouseMove(evt){
        this.mouse = viewport.getMouse(evt, true);
        this.hovered = getNearestPoint(this.mouse, this.graph.points, 20 * this.viewport.zoom);
        if(this.dragging){
            this.selected.x = this.mouse.x;
            this.selected.y = this.mouse.y;
        }
    }
}