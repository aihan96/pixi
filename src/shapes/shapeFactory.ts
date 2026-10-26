import { Shape } from "./Shape";
import { randomRange } from "../utils/random";

export type ShapeKind =
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

function createShape(kind: ShapeKind): Shape {
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

export function createRandomShape(): Shape {
  return createShape(KINDS[Math.floor(Math.random() * KINDS.length)]);
}
