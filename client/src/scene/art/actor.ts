import { ellipse, line, pigment, polygon, shade, shadow, sprite } from "@sloi/scene/art/drawing";
import type { Sprite } from "@sloi/scene/art/drawing";

function boots(c: CanvasRenderingContext2D, step: number): void {
  const dark = pigment("art-shadow");
  const trouser = pigment("art-trouser");
  for (const side of [-1, 1]) {
    const x = side * 6;
    const dy = step * side * 5;
    polygon(c, [[x - 4, -27], [x + 5, -27], [x + 4, -5 + dy], [x - 3, -4 + dy]], trouser);
    polygon(c, [[x - 4, -10 + dy], [x + 4, -10 + dy], [x + 7, -2 + dy], [x - 5, dy]], dark);
    line(c, [[x - 3, -8 + dy], [x + 3, -8 + dy]], pigment("art-leather"), 2);
  }
}

function coat(c: CanvasRenderingContext2D, back: boolean, stride: number): void {
  const coatColor = pigment("art-coat");
  polygon(c, [[-13, -54], [-7, -59], [8, -59], [15, -51], [11, -36],
    [17 + stride, -20], [3, -15], [-3, -23], [-15 + stride, -17], [-11, -38]], shade(coatColor, -18));
  polygon(c, [[-12, -51], [-5, -56], [-2, -28], [-12 + stride, -21], [-8, -39]], shade(coatColor, 20));
  polygon(c, [[-4, -54], [10, -53], [7, -30], [-2, -26]], coatColor);
  line(c, [[-9, -34], [9, -34]], pigment("art-leather"), 4);
  if (back) {
    polygon(c, [[-9, -55], [7, -55], [10, -33], [-10, -33]], pigment("art-leather"));
    polygon(c, [[-9, -55], [7, -55], [5, -44], [-8, -44]], shade(pigment("art-leather"), 23));
    line(c, [[-9, -43], [7, -43]], pigment("art-straw"), 2);
    line(c, [[-8, -34], [8, -34]], pigment("art-shadow"), 2);
  } else {
    line(c, [[-8, -54], [8, -36]], pigment("art-leather"), 4);
    c.fillStyle = pigment("color-accent"); c.fillRect(1, -35, 4, 3);
  }
}

function head(c: CanvasRenderingContext2D, back: boolean, side: number): void {
  const skin = pigment("art-skin");
  ellipse(c, side, -65, 8.5, 10.5, shade(skin, -15));
  ellipse(c, side - 2, -66, 6, 8, skin);
  const hair = pigment("art-hair");
  polygon(c, [[-8, -65], [-10, -72], [-6, -79], [4, -80], [9, -75], [9, -65], [4, -70], [-5, -71]], hair);
  line(c, [[-6, -75], [-1, -78], [5, -74]], shade(hair, 18), 2);
  if (back) ellipse(c, 0, -66, 8, 9, hair);
  else {
    line(c, [[side + 2, -65], [side + 4, -65]], pigment("art-shadow"), 1.5);
    line(c, [[side + 1, -58], [side + 5, -60]], shade(skin, -40), 2);
  }
  polygon(c, [[-8, -57], [5, -58], [10, -53], [-6, -50]], pigment("art-scarf"));
  polygon(c, [[-7, -53], [-11, -39], [-6, -35], [-2, -51]], shade(pigment("art-scarf"), -13));
}

export function traveller(direction: number, frame: number): Sprite {
  return sprite(116, 116, (c) => {
    shadow(c, 16, 6);
    const angle = direction / 8 * Math.PI * 2;
    const stride = Math.sin(frame / 6 * Math.PI * 2);
    const back = Math.sin(angle) < -0.3;
    c.translate(0, -Math.abs(stride) * 2);
    boots(c, stride);
    coat(c, back, stride * 2);
    c.save(); c.translate(0, -56); c.scale(0.78, 0.87); c.translate(0, 56);
    head(c, back, Math.cos(angle) * 3); c.restore();
    const skin = pigment("art-skin");
    const coatColor = pigment("art-coat");
    line(c, [[-12, -50], [-16, -38 + stride * 3], [-13, -32 + stride * 3]], shade(coatColor, 5), 7);
    ellipse(c, -13, -31 + stride * 3, 3.2, 4, skin);
    const ax = Math.cos(angle) * 18;
    const ay = Math.sin(angle) * 10;
    line(c, [[11, -49], [12 + ax * 0.3, -40], [ax, -39 + ay]], coatColor, 7);
    ellipse(c, ax, -39 + ay, 3.7, 3.5, skin);
    line(c, [[ax, -39 + ay], [ax + Math.cos(angle) * 15, -39 + ay * 1.7]], pigment("art-metal"), 4);
    line(c, [[ax - 1, -39 + ay - 1], [ax + Math.cos(angle) * 14, -40 + ay * 1.7]], pigment("art-stone"), 1);
  });
}
