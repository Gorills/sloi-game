import { ellipse, line, pigment, stamp } from "@sloi/scene/art/drawing";
import { props, SUPPLY, TARGET } from "@sloi/scene/world";
import { effects } from "@sloi/scene/effects";
import type { Position, Prop } from "@sloi/scene/world";
import type { Assets } from "@sloi/scene/assets";
import type { StudyState } from "@sloi/scene/state";
export interface View { width: number; height: number; scale: number; camera: Position; dpr: number; }
export function makeView(): View { return { width: 0, height: 0, scale: 1, camera: {x: 1270, y: 880}, dpr: 1 }; }

export function resize(canvas: HTMLCanvasElement, view: View): void {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(devicePixelRatio || 1, 2);
  if (view.width === rect.width && view.height === rect.height && view.dpr === dpr) return;
  view.width = rect.width; view.height = rect.height; view.dpr = dpr;
  view.scale = Math.max(0.7, Math.min(1.32, rect.height / 1030));
  canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
}
export function screenPoint(view: View, p: Position): Position {
  return {x: (p.x - view.camera.x) * view.scale + view.width / 2,
    y: (p.y - view.camera.y) * view.scale + view.height / 2};
}
export function worldPoint(view: View, p: Position): Position {
  return {x: (p.x - view.width / 2) / view.scale + view.camera.x,
    y: (p.y - view.height / 2) / view.scale + view.camera.y};
}
function drawProp(c: CanvasRenderingContext2D, p: Prop, assets: Assets, s: StudyState): void {
  const asset = assets.objects.get(p.asset);
  if (!asset) throw new Error(`Missing authored asset: ${p.asset}`);
  const dx = Math.abs(s.player.x - p.x);
  const dy = s.player.y - p.y;
  const occluding = p.canopy && dx < asset.image.width / 4 * p.scale - 15 && dy < -18 && dy > -asset.image.height / 2 * p.scale;
  c.globalAlpha = occluding ? 0.42 : 1;
  stamp(c, asset, p.x, p.y, p.scale);
  c.globalAlpha = 1;
}
function highlights(c: CanvasRenderingContext2D, s: StudyState): void {
  if (!s.supplied) {
    c.strokeStyle = pigment("color-accent"); c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(SUPPLY.x, SUPPLY.y - 6, 44, 21, 0, 0, Math.PI * 2); c.stroke();
  }
  if (s.selected) {
    c.strokeStyle = pigment("color-accent"); c.lineWidth = 2;
    c.beginPath(); c.ellipse(TARGET.x, TARGET.y - 4, 38, 16, 0, 0, Math.PI * 2); c.stroke();
    line(c, [[TARGET.x - 33, TARGET.y - 118], [TARGET.x - 33, TARGET.y - 125],
      [TARGET.x - 22, TARGET.y - 125]], pigment("color-accent"), 2);
  }
  c.globalAlpha = 0.52;
  ellipse(c, s.player.x, s.player.y + 1, 18, 6, pigment("color-info"));
  c.globalAlpha = 1;
}
export function render(c: CanvasRenderingContext2D, assets: Assets, s: StudyState, view: View, dt: number): void {
  const follow = s.reduced ? 1 : 1 - Math.exp(-dt * 5);
  view.camera.x += (s.player.x - view.camera.x) * follow;
  view.camera.y += (s.player.y - 130 - view.camera.y) * follow;
  c.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  c.clearRect(0, 0, view.width, view.height);
  c.save();
  c.translate(view.width / 2, view.height / 2);
  c.scale(view.scale, view.scale);
  c.translate(-view.camera.x, -view.camera.y);
  c.drawImage(assets.ground, 0, 0);
  highlights(c, s);
  const actor = assets.actors[s.facing]?.[s.walking ? Math.floor(s.phase) % 6 : 0];
  const ordered = [...props].sort((a, b) => a.y - b.y);
  let actorDrawn = false;
  for (const p of ordered) {
    if (!actorDrawn && p.y > s.player.y) {
      if (actor) stamp(c, actor, s.player.x, s.player.y); actorDrawn = true;
    }
    drawProp(c, p, assets, s);
  }
  if (!actorDrawn && actor) stamp(c, actor, s.player.x, s.player.y);
  effects(c, s);
  c.restore();
}
