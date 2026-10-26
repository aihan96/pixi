import { initDevtools } from "@pixi/devtools";
import { Application, Container } from "pixi.js";
import { ShapeManager } from "./shapes/ShapeManager";
import { Controls, type ControlOptions } from "./ui/Controls";
import { InfoStats } from "./ui/InfoStats";

const RATE_OPTIONS: ControlOptions = {
  initial: 1,
  min: 0,
  max: 10,
  step: 1,
};
const GRAVITY_OPTIONS: ControlOptions = {
  initial: 5,
  min: 0,
  max: 100,
  step: 5,
};

export class App {
  private pixi = new Application();
  // private shapes: Shape[] = [];
  private spawnTimer = 0;
  private spawnInterval = 1000; // ms
  // private shapesLayer!: Container;
  private gravity: number = GRAVITY_OPTIONS.initial;
  private infoStats!: InfoStats;
  private manager!: ShapeManager;

  public async init(host: HTMLElement) {
    await this.pixi.init({
      resizeTo: window,
      background: "#1e1e2e",
      antialias: true,
      autoDensity: true,
    });
    initDevtools({
      app: this.pixi,
    });
    this.pixi.canvas.style.position = "absolute";
    host.appendChild(this.pixi.canvas);

    const shapesLayer = new Container();
    this.pixi.stage.addChild(shapesLayer);

    this.manager = new ShapeManager(shapesLayer, this.pixi.screen);
    this.manager.onChange = () =>
      this.infoStats.update(this.manager.shapeCounts, this.manager.totalArea);

    this.pixi.stage.eventMode = "static";
    this.pixi.stage.hitArea = this.pixi.screen;

    this.pixi.stage.on("pointerdown", (e) => {
      this.manager.spawn(e.global.x, e.global.y);
    });

    this.pixi.ticker.add((t) => {
      this.spawnTimer += t.deltaMS;
      if (this.spawnTimer >= this.spawnInterval) {
        this.manager.spawn();
        this.spawnTimer -= this.spawnInterval;
      }
      this.manager.update(t.deltaTime, this.gravity);

      // const oldShapesLength = this.shapes.length;
      // this.shapes = this.shapes.filter((shape) => {
      //   shape.y += this.gravity * t.deltaTime; // moves down, Multiplying by deltaTime keeps the speed the same on every screen
      //   if (shape.y - shape.height / 2 > this.pixi.screen.height) {
      //     shape.destroy();
      //     return false;
      //   }
      //   return true;
      // });
      // if (this.shapes.length !== oldShapesLength) this.updateAreaInfoStats();
    });
    this.infoStats = new InfoStats("area-info-label");
    this.initControls();
  }

  // private spawnShape(x?: number, y?: number) {
  //   const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
  //   const shape = this.createShape(kind);
  //   // It pops in at the top. With y = 0 the whole rect appears instantly, because its top edge is on the screen edge. To have it slide in from above, start it fully off-screen:
  //   // The height is size * 2 (120px), so -size * 2 places the bottom edge exactly at the top of the screen. Keeping 0 is fine if you want the instant appearance.

  //   //Without subtracting w, the rect can spawn partly off the right edge.

  //   // shape.position.set(0, 0);
  //   shape.position.set(
  //     x ??
  //       shape.width / 2 +
  //         Math.random() * (this.pixi.screen.width - shape.width),
  //     y ?? -shape.height / 2,
  //   );
  //   shape.eventMode = "static";
  //   shape.cursor = "pointer";
  //   shape.on("pointerdown", (e) => {
  //     e.stopPropagation();
  //     this.shapes = this.shapes.filter((r) => r !== shape);
  //     shape.destroy();
  //     this.updateAreaInfoStats();
  //   });
  //   this.shapesLayer.addChild(shape);
  //   this.shapes.push(shape);
  //   this.updateAreaInfoStats();
  // }

  // private updateAreaInfoStats() {
  //   const total = this.shapes.reduce((sum, r) => sum + r.area, 0);
  //   this.infoStats.update(this.shapes.length, total);
  // }

  private initControls() {
    new Controls("rate", RATE_OPTIONS, (newValue) => {
      this.spawnInterval = 1000 / newValue;
    });

    new Controls("gravity", GRAVITY_OPTIONS, (newValue) => {
      this.gravity = newValue;
    });
  }

  // private createShape(kind: ShapeKind): Shape {
  //   const shape = new Shape();
  //   const radius = randomRange(25, 75);
  //   const polyArea = (n: number) =>
  //     0.5 * n * radius * radius * Math.sin((2 * Math.PI) / n);
  //   switch (kind) {
  //     case "triangle":
  //       shape.regularPoly(0, 0, radius, 3);
  //       shape.area = polyArea(3);
  //       break;
  //     case "square":
  //       shape.regularPoly(0, 0, radius, 4, Math.PI / 4);
  //       shape.area = polyArea(4);
  //       break;
  //     case "pentagon":
  //       shape.regularPoly(0, 0, radius, 5);
  //       shape.area = polyArea(5);
  //       break;
  //     case "hexagon":
  //       shape.regularPoly(0, 0, radius, 6);
  //       shape.area = polyArea(6);
  //       break;
  //     case "circle":
  //       shape.circle(0, 0, radius);
  //       shape.area = Math.PI * radius * radius;
  //       break;
  //     case "ellipse": {
  //       const rx = radius;
  //       const ry = radius * randomRange(0.4, 0.7);
  //       shape.ellipse(0, 0, rx, ry);
  //       shape.area = Math.PI * rx * ry;
  //       break;
  //     }
  //     case "star": {
  //       const inner = radius * 0.45;
  //       shape.star(0, 0, 5, radius, inner);
  //       shape.area = 5 * radius * inner * Math.sin(Math.PI / 5);
  //       break;
  //     }
  //   }

  //   return shape.fill(
  //     `hsl(${Math.random() * 360}, 80%, ${50 + Math.random() * 20}%)`,
  //   );
  // }
}
