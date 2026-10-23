import { initDevtools } from "@pixi/devtools";
import { Application, Graphics } from "pixi.js";

export class App {
  private pixi = new Application();
  private rects: Graphics[] = [];
  private spawnTimer = 0;
  private spawnInterval = 1000; // ms

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
      // console.log("🚀 ~ App ~ init ~ e:", e);
      if (e.target !== this.pixi.stage) return; // only empty space
      this.spawnRect(e.global.x, e.global.y);
    });

    this.pixi.ticker.add((t) => {
      this.spawnTimer += t.deltaMS;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer -= this.spawnInterval;
        this.spawnRect();
      }

      this.rects = this.rects.filter((r) => {
        r.y += 2 * t.deltaTime; // moves down, Multiplying by deltaTime keeps the speed the same on every screen
        if (r.y - r.height / 2 > this.pixi.screen.height) {
          r.destroy();
          // console.log(this.rects);
          return false;
        }
        return true;
      });
    });
  }

  private spawnRect(x?: number, y?: number) {
    // It pops in at the top. With y = 0 the whole rect appears instantly, because its top edge is on the screen edge. To have it slide in from above, start it fully off-screen:
    // The height is size * 2 (120px), so -size * 2 places the bottom edge exactly at the top of the screen. Keeping 0 is fine if you want the instant appearance.
    const w = 60;
    const h = w * 2;
    const rect = new Graphics().rect(-w / 2, -h / 2, w, h).fill(0xffffff);
    rect.position.set(
      x ?? Math.random() * (this.pixi.screen.width - w),
      y ?? -h,
    );
    rect.eventMode = "static";
    rect.cursor = "pointer";
    rect.on("pointerdown", (e) => {
      e.stopPropagation();
      console.log("🚀 ~ App ~ spawnRect ~ e:", e);
      this.rects = this.rects.filter((r) => r !== rect);
      rect.destroy();
    });
    this.pixi.stage.addChild(rect);
    this.rects.push(rect);
  }
}
