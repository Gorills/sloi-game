/** Shared drawing operations for the authored settlement sprites, not a scene engine. */
export type Point = readonly [number, number];
export type Vertex = readonly [number, number, number];
export interface Sprite { image: HTMLCanvasElement; anchor: Point; }
const colors = new Map<string, string>();

export function pigment(name: string): string {
  const cached = colors.get(name);
  if (cached) return cached;
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  if (!value) throw new Error(`Missing design token: ${name}`);
  colors.set(name, value);
  return value;
}

export function shade(hex: string, amount: number): string {
  const rgb = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
  return `rgb(${rgb.map((v) => Math.max(0, Math.min(255, Math.round(v + amount)))).join(",")})`;
}

export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function polygon(c: CanvasRenderingContext2D, points: readonly Point[], fill: string): void {
  const first = points[0];
  if (!first) return;
  c.beginPath();
  c.moveTo(...first);
  for (const point of points.slice(1)) c.lineTo(...point);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}

export function line(c: CanvasRenderingContext2D, points: readonly Point[], color: string, width = 1): void {
  const first = points[0];
  if (!first) return;
  c.beginPath();
  c.moveTo(...first);
  for (const point of points.slice(1)) c.lineTo(...point);
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
}

export function ellipse(c: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number,
  fill: string | CanvasGradient): void {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = fill;
  c.fill();
}

export function project([x, y, z]: Vertex): Point {
  return [(x - y) * 0.866, (x + y) * 0.5 - z];
}

export function face(c: CanvasRenderingContext2D, vertices: readonly Vertex[], fill: string): void {
  polygon(c, vertices.map(project), fill);
}

export function box(c: CanvasRenderingContext2D, x: number, y: number, z: number,
  w: number, d: number, h: number, color: string): void {
  face(c, [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], shade(color, -17));
  face(c, [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], shade(color, -37));
  face(c, [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], shade(color, 14));
}

export function sprite(w: number, h: number, paint: (c: CanvasRenderingContext2D) => void): Sprite {
  const image = document.createElement("canvas");
  image.width = w * 2;
  image.height = h * 2;
  const c = image.getContext("2d");
  if (!c) throw new Error("Canvas 2D unavailable");
  c.scale(2, 2);
  c.translate(w / 2, h - 16);
  paint(c);
  grain(c, image.width, image.height);
  return { image, anchor: [w / 2, h - 16] };
}

export function stamp(c: CanvasRenderingContext2D, asset: Sprite, x: number, y: number, scale = 1): void {
  c.drawImage(asset.image, x - asset.anchor[0] * scale, y - asset.anchor[1] * scale,
    asset.image.width / 2 * scale, asset.image.height / 2 * scale);
}

export function shadow(c: CanvasRenderingContext2D, rx: number, ry: number): void {
  c.save();
  c.translate(12, -6);
  c.scale(1, ry / rx);
  const gradient = c.createRadialGradient(0, 0, 1, 0, 0, rx + 14);
  gradient.addColorStop(0, pigment("art-shadow"));
  gradient.addColorStop(0.62, pigment("art-shadow"));
  gradient.addColorStop(1, "transparent");
  c.globalAlpha = 0.33;
  c.fillStyle = gradient;
  c.fillRect(-rx - 15, -rx - 15, rx * 2 + 30, rx * 2 + 30);
  c.restore();
}

function grain(c: CanvasRenderingContext2D, w: number, h: number): void {
  const image = c.getImageData(0, 0, w, h);
  const rng = random(w + h);
  for (let i = 0; i < image.data.length; i += 4) {
    if (!image.data[i + 3]) continue;
    const noise = (rng() - 0.5) * 9;
    for (let j = 0; j < 3; j++) image.data[i + j] = (image.data[i + j] ?? 0) + noise;
  }
  c.putImageData(image, 0, 0);
}
