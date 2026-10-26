import type { Container, Rectangle } from "pixi.js";
import type { Shape } from "./Shape";
import { createRandomShape } from "./shapeFactory";

export class ShapeManager {
  // called whenever a shape is added or removed
  public onChange: () => void = () => {};

  private shapes: Shape[] = [];
  private layer: Container;
  private screen: Rectangle;

  constructor(layer: Container, screen: Rectangle) {
    this.layer = layer;
    this.screen = screen;
  }

  public get shapeCounts(): number {
    return this.shapes.length;
  }

  public get totalArea(): number {
    return this.shapes.reduce((sum, shape) => sum + shape.area, 0);
  }

  public spawn(x?: number, y?: number) {
    const shape = createRandomShape();

    shape.position.set(
      x ?? shape.width / 2 + Math.random() * (this.screen.width - shape.width),
      y ?? -shape.height / 2,
    );

    shape.eventMode = "static";
    shape.cursor = "pointer";
    shape.on("pointerdown", (e) => {
      e.stopPropagation();
      this.remove(shape);
    });

    this.layer.addChild(shape);
    this.shapes.push(shape);
    this.onChange();
  }

  public update(deltaTime: number, gravity: number) {
    const oldShapesLength = this.shapes.length;

    this.shapes = this.shapes.filter((shape) => {
      shape.y += gravity * deltaTime;

      if (shape.y - shape.height / 2 > this.screen.height) {
        shape.destroy();
        return false;
      }
      return true;
    });

    if (this.shapes.length !== oldShapesLength) this.onChange();
  }

  private remove(shape: Shape) {
    this.shapes = this.shapes.filter((s) => s !== shape);
    shape.destroy();
    this.onChange();
  }
}
