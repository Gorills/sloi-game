import { ellipse, line, pigment, polygon } from "@sloi/scene/art/drawing";
import type { StudyState } from "@sloi/scene/state";

function lanternGlow(c: CanvasRenderingContext2D, x: number, y: number, time: number): void {
  const g = c.createRadialGradient(x, y, 0, x, y, 65);
  g.addColorStop(0, pigment("art-window")); g.addColorStop(1, "transparent");
  c.globalAlpha = 0.14 + Math.sin(time * 3) * 0.015;
  ellipse(c, x, y, 65, 55, g);
  c.globalAlpha = 1;
}
function smoke(c: CanvasRenderingContext2D, time: number): void {
  c.save();
  for (let i = 0; i < 7; i++) {
    const age = (time * 0.19 + i / 7) % 1;
    c.globalAlpha = (1 - age) * 0.12;
    ellipse(c, 945 + age * 33, 466 - age * 90, 8 + age * 20, 10 + age * 22, pigment("color-text"));
  }
  c.restore();
}
function wind(c: CanvasRenderingContext2D, time: number): void {
  c.save(); c.globalAlpha = 0.25;
  for (let i = 0; i < 18; i++) {
    const x = 600 + ((i * 113 + time * 13) % 1500);
    const y = 400 + ((i * 77 + Math.sin(time + i) * 6) % 900);
    polygon(c, [[x, y], [x + 4, y - 2], [x + 9, y + 1], [x + 3, y + 2]], pigment("art-straw"));
  }
  c.restore();
}
function shots(c: CanvasRenderingContext2D, s: StudyState): void {
  for (const shot of s.shots) {
    if (shot.age < 0.085) {
      c.globalAlpha = 1 - shot.age / 0.085;
      line(c, [[shot.from.x, shot.from.y], [shot.to.x, shot.to.y]], pigment("color-accent"), 2);
      if (!s.reduced) ellipse(c, shot.from.x, shot.from.y, 8, 5, pigment("art-window"));
    }
    const radius = shot.age * 52;
    c.globalAlpha = Math.max(0, 1 - shot.age * 2);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      line(c, [[shot.to.x + Math.cos(a) * radius, shot.to.y + Math.sin(a) * radius],
        [shot.to.x + Math.cos(a) * (radius + 5), shot.to.y + Math.sin(a) * (radius + 5)]], pigment("art-straw"), 1.5);
    }
    c.globalAlpha = 1;
  }
}
export function effects(c: CanvasRenderingContext2D, s: StudyState): void {
  const t = s.reduced ? 0 : s.time;
  lanternGlow(c, 1108, 695, t);
  lanternGlow(c, 1798, 683, t);
  if (!s.reduced) { smoke(c, t); wind(c, t); }
  shots(c, s);
}
