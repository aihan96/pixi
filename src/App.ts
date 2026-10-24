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

export class App {
  private pixi = new Application();
  private rects: Graphics[] = [];
  private spawnTimer = 0;
  private spawnInterval = 1000; // ms
  private rectsLayer!: Container;
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
      this.spawnRect(e.global.x, e.global.y);
    });

    this.rectsLayer = new Container();
    this.pixi.stage.addChild(this.rectsLayer);

    this.pixi.ticker.add((t) => {
      this.spawnTimer += t.deltaMS;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnRect();
        this.spawnTimer -= this.spawnInterval;
      }

      const oldRectsLength = this.rects.length;
      this.rects = this.rects.filter((r) => {
        r.y += this.gravity * t.deltaTime; // moves down, Multiplying by deltaTime keeps the speed the same on every screen
        if (r.y - r.height / 2 > this.pixi.screen.height) {
          r.destroy();
          return false;
        }
        return true;
      });
      if (this.rects.length !== oldRectsLength) this.updateAreaInfoStats();
    });

    this.initControls();
  }

  private spawnRect(x?: number, y?: number) {
    // It pops in at the top. With y = 0 the whole rect appears instantly, because its top edge is on the screen edge. To have it slide in from above, start it fully off-screen:
    // The height is size * 2 (120px), so -size * 2 places the bottom edge exactly at the top of the screen. Keeping 0 is fine if you want the instant appearance.
    const w = randomRange(50, 150);
    const h = randomRange(50, 150);
    const rect = new Graphics()
      .rect(-w / 2, -h / 2, w, h)
      .fill(`hsl(${Math.random() * 360}, 80%, 60%)`);
    rect.position.set(
      x ?? Math.random() * (this.pixi.screen.width - w), //Without subtracting w, the rect can spawn partly off the right edge.
      y ?? -h,
    );
    rect.eventMode = "static";
    rect.cursor = "pointer";
    rect.on("pointerdown", (e) => {
      e.stopPropagation();
      this.rects = this.rects.filter((r) => r !== rect);
      rect.destroy();
      this.updateAreaInfoStats();
    });
    this.rectsLayer.addChild(rect);
    this.rects.push(rect);
    this.updateAreaInfoStats();
  }

  private updateAreaInfoStats() {
    const areaInfoLabel = document.getElementById(
      "area-info-label",
    ) as HTMLSpanElement;

    const total = this.rects.reduce((sum, r) => sum + r.width * r.height, 0);
    areaInfoLabel.textContent = `Rects: ${this.rects.length} Area: ${Math.round(total)}px²`;
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
    opts: ControlOptions,
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
    let value = opts.initial;

    const setValues = () => {
      valueLabel.textContent = String(value);
      decreaseBtn.disabled = value <= opts.min;
      increaseBtn.disabled = value >= opts.max;
      onChange(value);
    };

    decreaseBtn.addEventListener("click", () => {
      value = Math.max(opts.min, value - opts.step);
      setValues();
    });
    increaseBtn.addEventListener("click", () => {
      value = Math.min(opts.max, value + opts.step);
      setValues();
    });

    setValues(); // sync the display and the field with the initial value
  }
}
