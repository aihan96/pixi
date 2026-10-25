import { initDevtools } from "@pixi/devtools";
import { Application, Container, Graphics } from "pixi.js";
import { randomRange } from "./utils/random";

type ControlOptions = {
  initial: number;
  min: number;
  max: number;
  step: number;
};

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

type ShapeKind =
  | "triangle"
  | "square"
  | "pentagon"
  | "hexagon"
  | "circle"
  | "ellipse"
  | "star";

const KINDS: ShapeKind[] = [
  "triangle",
  "square",
  "pentagon",
  "hexagon",
  "circle",
  "ellipse",
  "star",
];

class Shape extends Graphics {
  // vy = 0;
  area = 0;
}

export class App {
  private pixi = new Application();
  private shapes: Shape[] = [];
  private spawnTimer = 0;
  private spawnInterval = 1000; // ms
  private shapesLayer!: Container;
  private gravity: number = GRAVITY_OPTIONS.initial;

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
    this.pixi.stage.eventMode = "static";
    this.pixi.stage.hitArea = this.pixi.screen;

    this.pixi.stage.on("pointerdown", (e) => {
      this.spawnShape(e.global.x, e.global.y);
    });

    this.shapesLayer = new Container();
    this.pixi.stage.addChild(this.shapesLayer);

    this.pixi.ticker.add((t) => {
      this.spawnTimer += t.deltaMS;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnShape();
        this.spawnTimer -= this.spawnInterval;
      }

      const oldShapesLength = this.shapes.length;
      this.shapes = this.shapes.filter((shape) => {
        shape.y += this.gravity * t.deltaTime; // moves down, Multiplying by deltaTime keeps the speed the same on every screen
        if (shape.y - shape.height / 2 > this.pixi.screen.height) {
          shape.destroy();
          return false;
        }
        return true;
      });
      if (this.shapes.length !== oldShapesLength) this.updateAreaInfoStats();
    });

    this.initControls();
  }

  private spawnShape(x?: number, y?: number) {
    const kind = KINDS[Math.floor(Math.random() * KINDS.length)];
    const shape = this.createShape(kind);
    // It pops in at the top. With y = 0 the whole rect appears instantly, because its top edge is on the screen edge. To have it slide in from above, start it fully off-screen:
    // The height is size * 2 (120px), so -size * 2 places the bottom edge exactly at the top of the screen. Keeping 0 is fine if you want the instant appearance.

    //Without subtracting w, the rect can spawn partly off the right edge.

    // shape.position.set(0, 0);
    shape.position.set(
      x ??
        shape.width / 2 +
          Math.random() * (this.pixi.screen.width - shape.width),
      y ?? -shape.height / 2,
    );
    shape.eventMode = "static";
    shape.cursor = "pointer";
    shape.on("pointerdown", (e) => {
      e.stopPropagation();
      this.shapes = this.shapes.filter((r) => r !== shape);
      shape.destroy();
      this.updateAreaInfoStats();
    });
    this.shapesLayer.addChild(shape);
    this.shapes.push(shape);
    this.updateAreaInfoStats();
  }

  private updateAreaInfoStats() {
    const areaInfoLabel = document.getElementById(
      "area-info-label",
    ) as HTMLSpanElement;

    const total = this.shapes.reduce((sum, r) => sum + r.area, 0);
    areaInfoLabel.textContent = `Rects: ${this.shapes.length} Area: ${Math.round(total)}px²`;
  }

  private initControls() {
    this.handleControlChange("rate", RATE_OPTIONS, (newValue) => {
      this.spawnInterval = 1000 / newValue;
    });

    this.handleControlChange("gravity", GRAVITY_OPTIONS, (newValue) => {
      this.gravity = newValue;
    });
  }

  private handleControlChange(
    id: string,
    options: ControlOptions,
    onChange: (value: number) => void,
  ) {
    const decreaseBtn = document.getElementById(
      `${id}-decrease`,
    ) as HTMLButtonElement;
    const increaseBtn = document.getElementById(
      `${id}-increase`,
    ) as HTMLButtonElement;
    const valueLabel = document.getElementById(
      `${id}-value`,
    ) as HTMLSpanElement;
    let value = options.initial;

    const setValues = () => {
      valueLabel.textContent = String(value);
      decreaseBtn.disabled = value <= options.min;
      increaseBtn.disabled = value >= options.max;
      onChange(value);
    };

    decreaseBtn.addEventListener("click", () => {
      value = Math.max(options.min, value - options.step);
      setValues();
    });
    increaseBtn.addEventListener("click", () => {
      value = Math.min(options.max, value + options.step);
      setValues();
    });

    setValues();
  }

  private createShape(kind: ShapeKind): Shape {
    const shape = new Shape();
    const radius = randomRange(25, 75);
    const polyArea = (n: number) =>
      0.5 * n * radius * radius * Math.sin((2 * Math.PI) / n);
    switch (kind) {
      case "triangle":
        shape.regularPoly(0, 0, radius, 3);
        shape.area = polyArea(3);
        break;
      case "square":
        shape.regularPoly(0, 0, radius, 4, Math.PI / 4);
        shape.area = polyArea(4);
        break;
      case "pentagon":
        shape.regularPoly(0, 0, radius, 5);
        shape.area = polyArea(5);
        break;
      case "hexagon":
        shape.regularPoly(0, 0, radius, 6);
        shape.area = polyArea(6);
        break;
      case "circle":
        shape.circle(0, 0, radius);
        shape.area = Math.PI * radius * radius;
        break;
      case "ellipse": {
        const rx = radius;
        const ry = radius * randomRange(0.4, 0.7);
        shape.ellipse(0, 0, rx, ry);
        shape.area = Math.PI * rx * ry;
        break;
      }
      case "star": {
        const inner = radius * 0.45;
        shape.star(0, 0, 5, radius, inner);
        shape.area = 5 * radius * inner * Math.sin(Math.PI / 5);
        break;
      }
    }

    return shape.fill(
      `hsl(${Math.random() * 360}, 80%, ${50 + Math.random() * 20}%)`,
    );
  }
}
