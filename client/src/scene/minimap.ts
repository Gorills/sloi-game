import { pigment, ellipse, line, polygon } from "@sloi/scene/art/drawing";
import { EXIT, props, SUPPLY, TARGET } from "@sloi/scene/world";
import { road } from "@sloi/scene/art/terrain";
import type { StudyState } from "@sloi/scene/state";
export function minimap(canvas: HTMLCanvasElement, s: StudyState): void {
  const c = canvas.getContext("2d");
  if (!c) return;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = pigment("hud-bg"); c.fillRect(0, 0, canvas.width, canvas.height);
  const scale = canvas.width / 2000;
  c.save(); c.scale(scale, scale); c.translate(-430, -280);
  c.strokeStyle = pigment("art-path"); c.lineWidth = 52; c.stroke(road());
  for (const p of props.filter((v) => ["forge", "lodge", "tower"].includes(v.asset))) {
    c.save(); c.translate(p.x, p.y - 40); c.rotate(Math.PI / 6);
    c.fillStyle = pigment("art-stone"); c.fillRect(-50, -35, 100, 65); c.restore();
  }
  polygon(c, [[SUPPLY.x, SUPPLY.y - 31], [SUPPLY.x + 31, SUPPLY.y],
    [SUPPLY.x, SUPPLY.y + 31], [SUPPLY.x - 31, SUPPLY.y]], pigment("color-accent"));
  ellipse(c, TARGET.x, TARGET.y, 26, 26, pigment("color-danger"));
  ellipse(c, TARGET.x, TARGET.y, 14, 14, pigment("hud-bg"));
  ellipse(c, TARGET.x, TARGET.y, 6, 6, pigment("color-danger"));
  line(c, [[EXIT.x - 30, EXIT.y], [EXIT.x, EXIT.y - 30], [EXIT.x + 30, EXIT.y]], pigment("color-text"), 10);
  ellipse(c, s.player.x, s.player.y, 26, 26, pigment("color-info"));
  c.restore();
}
