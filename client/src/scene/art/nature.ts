import { ellipse, line, pigment, polygon, random, shade, shadow, sprite } from "@sloi/scene/art/drawing";
import type { Point, Sprite } from "@sloi/scene/art/drawing";

function leaves(c: CanvasRenderingContext2D, x: number, y: number, r: number, color: string,
  rng: () => number): void {
  const points: Point[] = [];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2;
    const radius = r * (0.74 + rng() * 0.32);
    points.push([x + Math.cos(a) * radius, y + Math.sin(a) * radius * 0.7]);
  }
  polygon(c, points, color);
}

export function tree(seed: number, golden = false): Sprite {
  return sprite(270, 320, (c) => {
    const rng = random(seed);
    const base = pigment(golden ? "art-leaf-gold" : "art-leaf");
    const bark = pigment("art-wood");
    shadow(c, 76, 27);
    polygon(c, [[-15, -3], [3, -17], [12, -88], [40, -159], [20, -177],
      [-3, -107], [-16, -136], [-29, -124], [-7, -68], [-7, -20], [-25, -5]], shade(bark, -22));
    line(c, [[-6, -8], [3, -77], [26, -152]], shade(bark, 18), 5);
    for (let i = 0; i < 12; i++) {
      const x = (rng() - 0.5) * 123;
      const y = -147 - rng() * 86;
      line(c, [[0, -61], [x * 0.55, y * 0.7], [x, y]], shade(bark, -14), 5);
    }
    for (let i = 0; i < 85; i++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * 86;
      const x = Math.cos(a) * r;
      const y = -181 + Math.sin(a) * r * 0.75;
      leaves(c, x, y, 20 + rng() * 20, shade(base, -24 + rng() * 28 - y / 22 - x / 12), rng);
    }
    for (let i = 0; i < 130; i++) {
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * 77;
      const x = Math.cos(a) * r - 3;
      const y = -191 + Math.sin(a) * r * 0.65;
      c.globalAlpha = 0.24;
      leaves(c, x, y, 3 + rng() * 8, shade(base, 36), rng);
    }
    c.globalAlpha = 1;
    for (let i = 0; i < 9; i++) {
      line(c, [[-25 + i * 6, 0], [-30 + i * 6, -11 - rng() * 10]], shade(base, 5), 1.5);
    }
  });
}

export function rock(seed: number): Sprite {
  return sprite(105, 90, (c) => {
    const rng = random(seed);
    const s = pigment("art-rock");
    shadow(c, 36, 10);
    polygon(c, [[-41, -14], [-36, -40], [-17, -58], [15, -60], [37, -34], [42, -12], [14, -2], [-18, -4]], shade(s, -22));
    polygon(c, [[-36, -40], [-17, -58], [15, -60], [25, -35], [-5, -25]], shade(s, 19));
    polygon(c, [[-41, -14], [-36, -40], [-5, -25], [0, -5], [-18, -4]], s);
    polygon(c, [[15, -60], [37, -34], [42, -12], [22, -19], [25, -35]], shade(s, -34));
    line(c, [[-20, -38], [-5, -25], [22, -19]], shade(s, -35), 1.5);
    for (let i = 0; i < 50; i++) {
      c.globalAlpha = 0.15;
      ellipse(c, -25 + rng() * 51, -13 - rng() * 27, 1 + rng() * 3, 1, pigment("art-stone"));
    }
    c.globalAlpha = 1;
  });
}

export function shrub(seed: number): Sprite {
  return sprite(80, 65, (c) => {
    const rng = random(seed);
    shadow(c, 25, 7);
    for (let i = 0; i < 22; i++) {
      const x = (rng() - 0.5) * 43;
      const y = -9 - rng() * 25;
      line(c, [[0, 0], [x, y]], pigment("art-wood"));
      leaves(c, x, y, 9 + rng() * 5, shade(pigment("art-leaf"), rng() * 34 - 12), rng);
    }
  });
}
