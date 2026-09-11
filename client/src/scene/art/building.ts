import { box, face, line, pigment, project, random, shade, shadow, sprite } from "@sloi/scene/art/drawing";
import type { Sprite, Vertex } from "@sloi/scene/art/drawing";

function masonry(c: CanvasRenderingContext2D, w: number, d: number, h: number): void {
  const stone = pigment("art-stone");
  const rng = random(61);
  box(c, -w / 2, -d / 2, 0, w, d, h, stone);
  for (let z = 0; z < h; z += 16) {
    for (let x = -w / 2; x < w / 2; x += 25) {
      const shift = z % 32 ? 9 : 0;
      const start = Math.max(-w / 2, x - shift);
      const end = Math.min(w / 2, x + 23 - shift);
      face(c, [[start, d / 2 + 0.1, z + 1], [end, d / 2 + 0.1, z + 1],
        [end, d / 2 + 0.1, z + 14], [start, d / 2 + 0.1, z + 14]], shade(stone, rng() * 22 - 25));
    }
    for (let y = -d / 2; y < d / 2; y += 25) {
      const end = Math.min(d / 2, y + 23);
      face(c, [[w / 2 + 0.1, y, z + 1], [w / 2 + 0.1, end, z + 1],
        [w / 2 + 0.1, end, z + 14], [w / 2 + 0.1, y, z + 14]], shade(stone, rng() * 15 - 43));
    }
  }
}

function windowFront(c: CanvasRenderingContext2D, x: number, y: number, z: number): void {
  const dark = pigment("art-shadow");
  face(c, [[x, y, z], [x + 23, y, z], [x + 23, y, z + 34], [x, y, z + 34]], dark);
  face(c, [[x + 3, y + 0.3, z + 4], [x + 20, y + 0.3, z + 4],
    [x + 20, y + 0.3, z + 30], [x + 3, y + 0.3, z + 30]], pigment("art-window"));
  line(c, [project([x + 11.5, y + 1, z + 2]), project([x + 11.5, y + 1, z + 32])], dark, 3);
  line(c, [project([x, y + 1, z + 15]), project([x + 23, y + 1, z + 15])], dark, 3);
  box(c, x - 3, y, z - 3, 29, 7, 4, pigment("art-wood"));
}

function roof(c: CanvasRenderingContext2D, w: number, d: number, h: number, color: string): void {
  const half = d / 2 + 12;
  const rise = 62;
  const left = -w / 2 - 13;
  const right = w / 2 + 13;
  const slope = (x: number, y: number): Vertex => [x, y, h + rise * (1 - Math.abs(y) / half)];
  face(c, [slope(left, -half), slope(right, -half), slope(right, 0), slope(left, 0)], shade(color, -16));
  face(c, [slope(left, 0), slope(right, 0), slope(right, half), slope(left, half)], color);
  const rng = random(9);
  for (let y = 0; y < half; y += 11) {
    for (let x = left; x < right; x += 15) {
      const x1 = Math.min(x + 14, right);
      const y1 = Math.min(y + 10, half);
      face(c, [slope(x, y), slope(x1, y), slope(x1, y1), slope(x, y1)], shade(color, rng() * 29 - 10));
      line(c, [project(slope(x, y1)), project(slope(x1, y1))], shade(color, -29), 1.3);
    }
  }
  line(c, [project(slope(left, half)), project(slope(right, half))], pigment("art-wood"), 6);
  line(c, [project(slope(right, -half)), project(slope(right, 0)), project(slope(right, half))], shade(color, 22), 5);
  line(c, [project(slope(left, 0)), project(slope(right, 0))], shade(color, 29), 4);
}

function entrance(c: CanvasRenderingContext2D, y: number): void {
  const wood = pigment("art-wood");
  face(c, [[-14, y, 0], [16, y, 0], [16, y, 59], [-14, y, 59]], shade(wood, -25));
  for (let x = -12; x < 15; x += 6) {
    line(c, [project([x, y + 1, 3]), project([x, y + 1, 57])], shade(wood, 2), 3);
  }
  box(c, -23, y, -1, 46, 17, 6, pigment("art-stone"));
  const [px, py] = project([10, y + 2, 27]);
  c.fillStyle = pigment("color-accent");
  c.fillRect(px, py, 3, 3);
}

export function house(kind: "forge" | "lodge"): Sprite {
  return sprite(380, 370, (c) => {
    const w = kind === "forge" ? 160 : 190;
    const d = 110;
    const h = kind === "forge" ? 83 : 114;
    shadow(c, 130, 44);
    c.translate(0, -70);
    masonry(c, w, d, h);
    entrance(c, d / 2 + 1);
    windowFront(c, -w / 2 + 17, d / 2 + 1, 29);
    windowFront(c, 40, d / 2 + 1, 29);
    face(c, [[w / 2, -d / 2, h], [w / 2, d / 2, h], [w / 2, 0, h + 62]], pigment("art-plaster"));
    roof(c, w, d, h, pigment(kind === "forge" ? "art-roof" : "art-roof-rust"));
    box(c, -45, -12, h + 42, 25, 22, 64, pigment("art-stone"));
    box(c, -49, -16, h + 102, 33, 30, 8, pigment("art-stone"));
    face(c, [[-45, -12, h + 111], [-24, -12, h + 111], [-24, 6, h + 111], [-45, 6, h + 111]], pigment("art-shadow"));
    if (kind === "forge") canopy(c, d / 2 + 1);
  });
}

function canopy(c: CanvasRenderingContext2D, y: number): void {
  const wood = pigment("art-wood");
  box(c, -64, y + 42, 0, 5, 5, 60, wood);
  box(c, 57, y + 42, 0, 5, 5, 60, wood);
  const cloth = pigment("art-cloth");
  for (let x = -67; x < 65; x += 22) {
    const color = shade(cloth, x % 44 === -1 ? -10 : 8);
    face(c, [[x, y, 82], [x + 22, y, 82], [x + 22, y + 49, 62], [x, y + 49, 62]], color);
    face(c, [[x, y + 49, 62], [x + 22, y + 49, 62], [x + 22, y + 49, 53], [x, y + 49, 53]], shade(color.startsWith("#") ? color : cloth, -14));
  }
  box(c, 27, y + 13, 0, 27, 23, 27, wood);
  box(c, 20, y + 12, 27, 43, 16, 9, pigment("art-metal"));
}

export function gateTower(): Sprite {
  return sprite(230, 255, (c) => {
    shadow(c, 67, 25);
    c.translate(0, -33);
    masonry(c, 69, 69, 130);
    box(c, -39, -39, 127, 78, 78, 10, pigment("art-stone"));
    for (let x = -39; x < 39; x += 26) {
      box(c, x, 29, 137, 16, 10, 20, pigment("art-stone"));
      box(c, 29, x, 137, 10, 16, 20, pigment("art-stone"));
    }
    windowFront(c, -11, 36, 75);
  });
}
