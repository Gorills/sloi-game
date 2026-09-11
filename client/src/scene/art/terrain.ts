import { ellipse, line, pigment, polygon, random, shade } from "@sloi/scene/art/drawing";
import { WORLD } from "@sloi/scene/world";
import type { Point } from "@sloi/scene/art/drawing";

export function road(): Path2D {
  const path = new Path2D();
  path.moveTo(1260, 1850);
  path.bezierCurveTo(1270, 1500, 1470, 1270, 1310, 1080);
  path.bezierCurveTo(1090, 850, 1500, 870, 1760, 660);
  path.bezierCurveTo(1920, 535, 2040, 385, 2460, 230);
  return path;
}

function groundNoise(c: CanvasRenderingContext2D): void {
  const rng = random(331);
  const base = pigment("art-grass");
  const rgb = [1, 3, 5].map((i) => parseInt(base.slice(i, i + 2), 16));
  const image = c.createImageData(WORLD.width, WORLD.height);
  for (let y = 0; y < WORLD.height; y++) {
    for (let x = 0; x < WORLD.width; x++) {
      const index = (y * WORLD.width + x) * 4;
      const wave = Math.sin(x * 0.011 + y * 0.007) * 5 + Math.sin(y * 0.019 - x * 0.008) * 4;
      const v = (rng() - 0.5) * 13 + wave;
      image.data[index] = (rgb[0] ?? 0) + v;
      image.data[index + 1] = (rgb[1] ?? 0) + v;
      image.data[index + 2] = (rgb[2] ?? 0) + v;
      image.data[index + 3] = 255;
    }
  }
  c.putImageData(image, 0, 0);
}

function paths(c: CanvasRenderingContext2D): void {
  const path = road();
  c.lineCap = "round";
  const dirt = pigment("art-path");
  for (const [width, offset, opacity] of [[220, -40, 0.12], [192, -25, 0.3], [175, -9, 0.65], [151, 0, 0.94]]) {
    c.globalAlpha = opacity ?? 1;
    c.strokeStyle = shade(dirt, offset ?? 0); c.lineWidth = width ?? 150; c.stroke(path);
  }
  c.globalAlpha = 1;
  const branches = new Path2D();
  branches.moveTo(1290, 1010); branches.quadraticCurveTo(1210, 885, 966, 800);
  branches.moveTo(1430, 861); branches.lineTo(1260, 698);
  branches.moveTo(1400, 922); branches.quadraticCurveTo(1560, 880, 1710, 886);
  for (const width of [105, 95, 85, 75]) {
    c.globalAlpha = 0.25; c.lineWidth = width; c.strokeStyle = shade(dirt, -10); c.stroke(branches);
  }
  c.globalAlpha = 1;
  c.globalAlpha = 0.19;
  c.strokeStyle = pigment("art-shadow"); c.lineWidth = 3;
  c.translate(-30, 0); c.stroke(path); c.translate(60, 0); c.stroke(path); c.translate(-30, 0);
  c.globalAlpha = 1;
}

function details(c: CanvasRenderingContext2D): void {
  const rng = random(809);
  const r = road();
  const grass = pigment("art-grass");
  const path = pigment("art-path");
  c.lineWidth = 155;
  for (let i = 0; i < 24000; i++) {
    const x = rng() * WORLD.width, y = rng() * WORLD.height;
    c.lineWidth = 155;
    const onPath = c.isPointInStroke(r, x, y);
    c.globalAlpha = onPath ? 0.2 : 0.29;
    if (onPath) {
      ellipse(c, x, y, 0.6 + rng() * 2.7, 0.4 + rng(), shade(path, rng() * 65 - 48));
    } else {
      const h = 2 + rng() * 6;
      line(c, [[x, y], [x - 2, y - h], [x + 1, y - h * 0.7]], shade(grass, rng() * 54 - 20), 1);
    }
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 170; i++) {
    const x = 1180 + rng() * 340, y = 855 + rng() * 285;
    c.lineWidth = 155;
    if (!c.isPointInStroke(r, x, y)) continue;
    const w = 4 + rng() * 12;
    const points: Point[] = [[x, y], [x + w, y - 3], [x + w + 4, y + 3], [x + 3, y + 6]];
    polygon(c, points, shade(pigment("art-stone"), rng() * 25 - 30));
    line(c, [points[0]!, points[1]!], shade(pigment("art-stone"), 18), 0.8);
  }
}

function stream(c: CanvasRenderingContext2D): void {
  const p = new Path2D();
  p.moveTo(310, 0); p.bezierCurveTo(770, 440, 350, 800, 390, 1800);
  c.lineCap = "round";
  c.strokeStyle = pigment("art-bank"); c.lineWidth = 115; c.stroke(p);
  c.strokeStyle = pigment("art-water"); c.lineWidth = 70; c.stroke(p);
  c.strokeStyle = shade(pigment("art-water"), 14); c.lineWidth = 36; c.stroke(p);
  const rng = random(4);
  c.lineWidth = 65;
  for (let i = 0; i < 350; i++) {
    const x = 330 + rng() * 280, y = rng() * 1800;
    c.lineWidth = 65;
    if (!c.isPointInStroke(p, x, y)) continue;
    c.globalAlpha = 0.16;
    line(c, [[x, y], [x + 7 + rng() * 17, y - 3]], pigment("color-text"), 1);
  }
  c.globalAlpha = 1;
}

export function terrain(): HTMLCanvasElement {
  const image = document.createElement("canvas");
  image.width = WORLD.width; image.height = WORLD.height;
  const c = image.getContext("2d");
  if (!c) throw new Error("Canvas 2D unavailable");
  groundNoise(c);
  paths(c);
  details(c);
  stream(c);
  return image;
}
