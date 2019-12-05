
class Main extends egret.DisplayObjectContainer {

    private index: number = 0;

    public engine;
    public runner;
    public render;
    public pointList = [];
    public lineList = [];
    public composite;
    public line;
    public shp: egret.Shape;
    public grp_line: eui.Group;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event: egret.Event) {

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin

            context.onUpdate = () => {
                this.update();
            }
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        this.runGame().catch(e => {
            console.log(e);
        })

    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);

    }

    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene() {
        //创建engine
        let engine = this.engine = Matter.Engine.create(null, null);
        //创建runner
        let runner = this.runner = Matter.Runner.create(null);
        //设置runner以固定帧率计算
        runner.isFixed = true;

        //创建render，使用egret的渲染方法替代matter自己的pixi渲染方法
        this.render = EgretRender.create({
            element: document.body,
            engine: engine,
            options: {
                width: this.stage.width,
                height: this.stage.height,
                container: this,
                showVelocity: false,
                wireframes: false,
                showAxes: false,
                showConvexHulls: false
            }
        });

        Matter.Runner.run(runner, engine);
        EgretRender.run(this.render);

        let wallAttributes = {
            isStatic: true,
        };
        let top = Matter.Bodies.rectangle(320, 0, 640, 50, wallAttributes);
        let left = Matter.Bodies.rectangle(0, 568, 50, 1136, wallAttributes);
        let right = Matter.Bodies.rectangle(640, 568, 50, 1136, wallAttributes);
        let bottom = Matter.Bodies.rectangle(320, 1100, 640, 50, wallAttributes);
        Matter.World.add(engine.world, [top, left, right, bottom]);

        let box = Matter.Bodies.rectangle(320, 568, 50, 50, wallAttributes);
        Matter.World.add(engine.world, box);

        this.shp = new egret.Shape();
        this.addChild(this.shp);

        this.grp_line = new eui.Group();
        this.addChild(this.grp_line);

        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.mouseTap, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.mouseMove, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.mouseEnd, this);
    }

    private update() {
        if (!this.grp_line) {
            return;
        }
        this.grp_line.removeChildren();
        if (this.lineList.length > 0) {
            for (let line of this.lineList) {
                let shp = new egret.Shape();
                this.grp_line.addChild(shp);
                shp.graphics.lineStyle(5, 0xc00000);
                for (let i = 1; i < line.parts.length - 1; i++) {
                    let start = line.parts[i].position;
                    let stop = line.parts[i + 1].position;
                    shp.graphics.beginFill(0xc00000);
                    shp.graphics.moveTo(start.x, start.y);
                    shp.graphics.lineTo(stop.x, stop.y);
                    shp.graphics.endFill();
                }
            }
        }
    }

    private mouseMove(event: egret.TouchEvent) {
        let pos = { x: event.localX, y: event.localY };
        if (this.pointList.length == 0) {
            this.pointList.push(pos);
            this.composite = Matter.Composite.create([]);
            return;
        }
        this.renderLine(pos);
    }

    private renderLine(pos) {
        let oldPos = this.pointList[this.pointList.length - 1];
        let distance = MathUtil.distance(pos.x, pos.y, oldPos.x, oldPos.y);
        if (distance > 25) {
            this.pointList.push(pos);
            let shp = this.shp;
            shp.graphics.lineStyle(5, 0x00ff00);
            shp.graphics.moveTo(oldPos.x, oldPos.y);
            shp.graphics.lineTo(pos.x, pos.y);
            shp.graphics.endFill();
        }
    }

    private mouseEnd(event: egret.TouchEvent) {

        this.createRigibody();
        this.shp.graphics.clear();
        this.pointList = [];
    }

    private createRigibody() {
        if (this.pointList.length < 2) {
            return;
        }
        let lines = [];
        for (let i = 0; i < this.pointList.length - 1; i++) {
            let start = this.pointList[i];
            let stop = this.pointList[i + 1];
            let angle = MathUtil.radians2(start, stop);
            let distance = MathUtil.distance2(start, stop);
            let line = Matter.Bodies.rectangle(start.x + distance / 2, start.y, distance, 5, {
                isStatic: false,
            });
            Matter.Body.rotate(line, angle, start);
            lines.push(line);
        }
        let line = Matter.Body.create({
            parts: lines,
            density: 10000
        });
        this.lineList.push(line);
        Matter.World.add(this.engine.world, line);
    }

    private createRigibody2() {
        if (this.pointList.length < 2) {
            return;
        }
        let start = this.pointList[0];
        let arrow = Matter.Vertices.create(this.pointList, null);
        let vertices = [];
        for (var i = 0; i < this.pointList.length; i++) {
            let x = this.pointList[i].x;
            let y = this.pointList[i].y;
            vertices.push([x, y]);
        }
        let centroid = PhyscisHelp.getPolygonCentroid(vertices);
        let arrowBody = Matter.Bodies.fromVertices(centroid[0], centroid[1], [arrow], null, false, false, null);
        Matter.World.add(this.engine.world, arrowBody);
    }

    private createLine(x, y, width) {
        return Matter.Bodies.rectangle(x + width / 2, y, width, 1, {
            isStatic: false,
        });
    }

    private mouseTap(event: egret.TouchEvent) {

        return;
        //获得点击坐标
        let x = event.stageX;
        let y = event.stageY;

        //创建一个带图片的圆
        let circle = Matter.Bodies.circle(x, y, 40, {
            render: {
                sprite: {
                    texture: 'circle_png', xOffset: 40, yOffset: 40
                },
            },
            stiffness: 0.6,
            restitution: 0.6
        }, null);
        Matter.World.add(this.engine.world, circle);
        return;

        if (this.index == 0) {
            //创建一个带图片的盒子
            let box = Matter.Bodies.rectangle(x, y, 52, 52, {
                render: {
                    sprite: {
                        texture: 'rect_png', xOffset: 52 / 2, yOffset: 52 / 2
                    }
                }
            });

            Matter.World.add(this.engine.world, box);
        }

        if (this.index == 1) {
            //创建一个带图片的圆
            let circle = Matter.Bodies.circle(x, y, 40, {
                render: {
                    sprite: {
                        texture: 'circle_png', xOffset: 40, yOffset: 40
                    }
                }
            }, null);
            Matter.World.add(this.engine.world, circle);

        }

        if (this.index == 2) {
            //创建一个多边形
            let arrow = Matter.Vertices.fromPath('40 0 40 20 100 20 100 80 40 80 40 100 0 50', null);
            let arrowBody = Matter.Bodies.fromVertices(x, y, [arrow], null, true, null, null);

            Matter.World.add(this.engine.world, arrowBody);
        }

        if (this.index == 3) {
            //创建一个带图片的多边形
            let polys = Matter.Vertices.fromPath('0 0 96 0 96 32 32 32 32 64 0 64', null);
            console.log(polys);

            //把polys里的顶点集合转换成[[x,y],[x,y],...]形式
            let vertices = [];
            for (var i = 0; i < polys.length; i++) {
                let x = polys[i].x;
                let y = polys[i].y;
                vertices.push([x, y]);
            }
            console.log(vertices);

            //计算多边形的重心
            let centroid = PhyscisHelp.getPolygonCentroid(vertices);
            console.log(centroid);

            let polyBody = Matter.Bodies.fromVertices(x, y, [polys], {
                render: {
                    sprite: {
                        texture: '4_png', xOffset: centroid[0], yOffset: centroid[1]
                    }
                }
            }, true, null, null);
            Matter.World.add(this.engine.world, polyBody);
        }

        this.index++;
        if (this.index > 3) this.index = 0;
    }
}
