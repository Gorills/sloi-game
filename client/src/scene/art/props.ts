import { box, ellipse, face, line, pigment, polygon, shade, shadow, sprite } from "@sloi/scene/art/drawing";
import type { Sprite } from "@sloi/scene/art/drawing";

export function supplyCrate(): Sprite {
  return sprite(105, 96, (c) => {
    const wood = pigment("art-wood");
    shadow(c, 36, 12);
    c.translate(0, -21);
    box(c, -25, -19, 0, 50, 38, 29, wood);
    for (let z = 7; z < 29; z += 7) {
      face(c, [[-24, 19.5, z], [24, 19.5, z], [24, 19.5, z + 1], [-24, 19.5, z + 1]], shade(wood, -34));
    }
    for (const x of [-19, 14]) box(c, x, -20, 29, 5, 40, 3, pigment("art-metal"));
    box(c, -6, 19, 14, 12, 2, 11, pigment("art-metal"));
  });
}

export function practiceTarget(): Sprite {
  return sprite(115, 137, (c) => {
    shadow(c, 34, 12);
    const wood = pigment("art-wood");
    polygon(c, [[-27, 0], [-21, -1], [3, -90], [-3, -93]], wood);
    polygon(c, [[19, 0], [26, -1], [4, -90], [-3, -93]], shade(wood, -12));
    line(c, [[-23, -30], [22, -29]], shade(wood, 20), 4);
    ellipse(c, 3, -79, 30, 32, pigment("art-shadow"));
    ellipse(c, 0, -82, 30, 32, pigment("art-straw"));
    for (let r = 27; r > 2; r -= 3) {
      c.beginPath(); c.ellipse(0, -82, r, r * 1.08, 0, 0, Math.PI * 2);
      c.strokeStyle = shade(pigment("art-straw"), r % 2 ? -17 : 11); c.lineWidth = 1; c.stroke();
    }
    for (const r of [22, 10]) {
      c.beginPath(); c.ellipse(0, -82, r, r * 1.08, 0, 0, Math.PI * 2);
      c.strokeStyle = pigment("art-target"); c.lineWidth = 4; c.stroke();
    }
    ellipse(c, 0, -82, 4, 4.3, pigment("art-target"));
  });
}

export function lantern(): Sprite {
  return sprite(90, 176, (c) => {
    shadow(c, 22, 8);
    line(c, [[0, 0], [0, -129], [25, -140], [28, -130]], pigment("art-metal"), 5);
    line(c, [[-5, 0], [5, 0]], pigment("art-stone"), 6);
    polygon(c, [[15, -128], [39, -128], [35, -105], [19, -105]], pigment("art-metal"));
    polygon(c, [[19, -124], [35, -124], [32, -109], [21, -109]], pigment("art-window"));
    polygon(c, [[11, -128], [27, -137], [42, -128]], pigment("art-metal"));
  });
}

export function well(): Sprite {
  return sprite(167, 154, (c) => {
    shadow(c, 61, 20);
    const stone = pigment("art-stone");
    ellipse(c, 0, -23, 46, 25, shade(stone, -35));
    c.fillStyle = shade(stone, -30); c.fillRect(-46, -44, 92, 23);
    ellipse(c, 0, -44, 46, 25, stone);
    ellipse(c, 0, -44, 32, 16, pigment("art-shadow"));
    for (let i = 0; i < 9; i++) {
      const angle = i / 8 * Math.PI;
      line(c, [[Math.cos(angle) * 45, -44 + Math.sin(angle) * 24],
        [Math.cos(angle) * 45, -24 + Math.sin(angle) * 24]], shade(stone, -45), 2);
    }
    line(c, [[-42, -27], [-42, -108], [43, -108], [43, -29]], pigment("art-wood"), 6);
    line(c, [[-42, -103], [43, -103]], pigment("art-wood"), 8);
    line(c, [[0, -105], [0, -38]], pigment("art-straw"), 2);
    polygon(c, [[-66, -104], [-12, -138], [65, -111], [9, -78]], pigment("art-roof"));
    line(c, [[-66, -104], [9, -78], [65, -111]], shade(pigment("art-roof"), 20), 3);
  });
}

export function fence(): Sprite {
  return sprite(180, 91, (c) => {
    const wood = pigment("art-wood");
    for (const x of [-70, 0, 70]) {
      polygon(c, [[x - 4, 0], [x + 4, 0], [x + 4, -50], [x, -55], [x - 4, -50]], wood);
      line(c, [[x - 3, -47], [x - 3, -3]], shade(wood, 20), 2);
    }
    line(c, [[-76, -38], [77, -38]], shade(wood, -15), 7);
    line(c, [[-76, -18], [77, -18]], wood, 7);
    line(c, [[-74, -42], [76, -42]], shade(wood, 19), 1);
  });
}
