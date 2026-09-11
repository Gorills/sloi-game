/** Static design specimen, not game geometry or authoritative state. */
export function drawMapPreview(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable");
  const bounds = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  context.scale(ratio, ratio);
  const color = (name: string): string =>
    getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();
  const width = bounds.width;
  const height = bounds.height;
  context.fillStyle = color("bg");
  context.fillRect(0, 0, width, height);
  context.strokeStyle = color("raised");
  for (let x = 20; x < width; x += 32) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  context.strokeStyle = color("accent");
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(width * 0.14, height * 0.68);
  context.lineTo(width * 0.42, height * 0.4);
  context.lineTo(width * 0.82, height * 0.3);
  context.stroke();
  context.setLineDash([6, 6]);
  context.strokeStyle = color("danger");
  context.beginPath();
  context.moveTo(width * 0.42, height * 0.4);
  context.lineTo(width * 0.78, height * 0.76);
  context.stroke();
  context.setLineDash([]);
  drawNode(context, width * 0.14, height * 0.68, "○", color("accent"));
  drawNode(context, width * 0.42, height * 0.4, "◇", color("info"));
  drawNode(context, width * 0.82, height * 0.3, "○", color("accent"));
  drawNode(context, width * 0.78, height * 0.76, "△", color("danger"));
}

function drawNode(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  symbol: string,
  color: string,
): void {
  context.fillStyle = color;
  context.font = "28px system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(symbol, x, y);
}
