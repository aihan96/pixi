import { initDevtools } from "@pixi/devtools";
import { Application, Graphics, Text, Container } from "pixi.js";
import { randomRange } from "./utils/random";

export class App {
  private pixi = new Application();
  private rects: Graphics[] = [];
  private spawnTimer = 0;
  private spawnInterval = 1000; // ms
  private rectsLayer!: Container;
  private areaLabel!: Text;
  private countLabel!: Text;

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
      if (e.target !== this.pixi.stage) return; // only empty space
      this.spawnRect(e.global.x, e.global.y);
    });

    this.rectsLayer = new Container();
    this.pixi.stage.addChild(this.rectsLayer);

    this.countLabel = new Text({
      text: "Shapes: 0 Area: 0px²",
      style: {
        fill: "#ffffff",
        fontSize: 24,
      },
    });
    this.countLabel.position.set(16, 16);
    this.pixi.stage.addChild(this.countLabel);

    this.areaLabel = new Text({
      text: "Area: 0px²",
      style: { fill: "#ffffff", fontSize: 24 },
    });
    this.areaLabel.position.set(16, 16 + this.countLabel.height + 8);
    this.pixi.stage.addChild(this.areaLabel);

    this.pixi.ticker.add((t) => {
      this.spawnTimer += t.deltaMS;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer -= this.spawnInterval;
        this.spawnRect();
      }

      const before = this.rects.length;
      this.rects = this.rects.filter((r) => {
        r.y += 2 * t.deltaTime; // moves down, Multiplying by deltaTime keeps the speed the same on every screen
        if (r.y - r.height / 2 > this.pixi.screen.height) {
          r.destroy();
          return false;
        }
        return true;
      });
      if (this.rects.length !== before) this.updateStats();
    });
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
      this.updateStats();
    });
    this.rectsLayer.addChild(rect);
    this.rects.push(rect);
    this.updateStats();
  }

  private updateStats() {
    const total = this.rects.reduce((sum, r) => sum + r.width * r.height, 0);
    this.countLabel.text = `Rects: ${this.rects.length}`;
    this.areaLabel.text = `Area: ${Math.round(total)}px²`;
  }
}
