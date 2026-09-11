/** Small objects that give the settlement a working, inhabited scale. */
import { box, ellipse, face, line, pigment, polygon, project, random, shade, shadow, sprite } from "@sloi/scene/art/drawing";
import type { Sprite } from "@sloi/scene/art/drawing";

export function barrel(): Sprite {
  return sprite(64, 73, (c) => {
    shadow(c, 23, 8);
    const wood = pigment("art-wood");
    const g = c.createLinearGradient(-20, 0, 20, 0);
    g.addColorStop(0, shade(wood, -18)); g.addColorStop(0.3, shade(wood, 23)); g.addColorStop(1, shade(wood, -31));
    c.beginPath(); c.moveTo(-18, -48); c.bezierCurveTo(-24, -36, -24, -16, -17, -4);
    c.quadraticCurveTo(0, 7, 17, -4); c.bezierCurveTo(24, -16, 24, -36, 18, -48); c.closePath();
    c.fillStyle = g; c.fill();
    for (const x of [-12, -4, 5, 13]) line(c, [[x, -47], [x * 1.2, -26], [x, -3]], shade(wood, -32), 0.8);
    for (const y of [-40, -12]) {
      c.beginPath(); c.ellipse(0, y, 20, 7, 0, 0, Math.PI); c.lineWidth = 4; c.strokeStyle = pigment("art-metal"); c.stroke();
    }
    ellipse(c, 0, -48, 18, 9, shade(wood, 22));
    ellipse(c, 0, -48, 15, 7, wood);
    line(c, [[-12, -48], [12, -48]], shade(wood, -25), 1);
  });
}

export function logPile(): Sprite {
  return sprite(137, 91, (c) => {
    shadow(c, 53, 16);
    const wood = pigment("art-wood"), core = pigment("art-straw");
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < 4 - row; i++) {
        const x = -32 + i * 19 + row * 10, y = -5 - row * 15;
        line(c, [[x - 20, y - 32], [x + 17, y - 11]], shade(wood, row * 6 - 22), 17);
        line(c, [[x - 23, y - 37], [x + 16, y - 17]], shade(wood, 14), 2);
        ellipse(c, x + 18, y - 10, 9, 9, core);
        ellipse(c, x + 18, y - 10, 6, 6, wood);
        ellipse(c, x + 18, y - 10, 5, 5, core);
        line(c, [[x + 18, y - 10], [x + 22, y - 8]], wood);
      }
    }
  });
}

export function cart(): Sprite {
  return sprite(200, 137, (c) => {
    shadow(c, 68, 21);
    const wood = pigment("art-wood");
    c.translate(0, -31);
    for (const y of [-30, 33]) {
      const [x, sy] = project([3, y, 13]);
      ellipse(c, x, sy, 16, 21, shade(wood, -25));
      ellipse(c, x, sy, 12, 17, pigment("art-shadow"));
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
        line(c, [[x, sy], [x + Math.cos(a) * 13, sy + Math.sin(a) * 18]], wood, 3);
      }
      ellipse(c, x, sy, 4, 5, pigment("art-metal"));
    }
    box(c, -44, -25, 25, 87, 50, 5, wood);
    for (let z = 30; z < 65; z += 10) {
      box(c, -44, 24, z, 87, 3, 8, wood);
      box(c, 40, -25, z, 3, 50, 8, wood);
    }
    line(c, [project([-44, 15, 27]), project([-110, 15, 16])], wood, 5);
    line(c, [project([-44, -15, 27]), project([-110, -15, 16])], wood, 5);
    box(c, -20, -15, 30, 29, 28, 27, pigment("art-cloth"));
    face(c, [[-20, -15, 57], [9, -15, 57], [9, 13, 57], [-20, 13, 57]], pigment("art-straw"));
  });
}

export function herbBed(): Sprite {
  return sprite(122, 95, (c) => {
    shadow(c, 41, 12);
    box(c, -28, -21, 0, 57, 43, 13, pigment("art-wood"));
    const rng = random(91);
    for (let i = 0; i < 38; i++) {
      const [x, y] = project([-23 + rng() * 48, -16 + rng() * 35, 14]);
      const h = 8 + rng() * 18;
      line(c, [[x, y], [x - 4, y - h]], pigment("art-leaf"), 2);
      polygon(c, [[x - 2, y - 4], [x - 11, y - h / 2], [x - 5, y - h], [x - 3, y - 7]], shade(pigment("art-leaf"), 25));
      if (i % 4 === 0) ellipse(c, x - 4, y - h, 2.3, 2, pigment("art-straw"));
    }
  });
}
