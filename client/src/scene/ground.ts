import { ROAD, WORLD, type Point } from '@sloi/scene/world';
function randomGenerator(): () => number {
    let value = 917;
    return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}
function pathDistance(p: Point): number {
    let result = Infinity;
    for (let i = 1; i < ROAD.length; i++) {
        const a = ROAD[i - 1];
        const b = ROAD[i];
        if (!a || !b)
            continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
        result = Math.min(result, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
    }
    return result;
}
function groundBlades(ctx: CanvasRenderingContext2D, rng: () => number): void {
    const colors = ['#4e6545', '#78875a', '#9b9d69', '#b5ac73', '#536d47', '#85905e'];
    for (let i = 0; i < 23000; i++) {
        const x = rng() * WORLD.w;
        const y = rng() * WORLD.h;
        if (pathDistance({ x, y }) < 55 + rng() * 18)
            continue;
        if (Math.sin(x / 38) + Math.cos(y / 25) + Math.sin((x + y) / 51) < 0.5)
            continue;
        const length = 2 + rng() * 7;
        ctx.strokeStyle = colors[Math.floor(rng() * colors.length)] ?? '#7b8658';
        ctx.lineWidth = 0.7 + rng() * 1.3;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + rng() * 6 - 2, y - length);
        ctx.stroke();
    }
}
function road(ctx: CanvasRenderingContext2D, rng: () => number): void {
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    for (const [width, color] of [[146, '#78835b'], [124, '#999772'], [100, '#b6ab81']] as const) {
        ctx.beginPath();
        ROAD.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.lineWidth = width;
        ctx.strokeStyle = color;
        ctx.stroke();
    }
    for (let i = 0; i < 11500; i++) {
        const x = rng() * WORLD.w;
        const y = rng() * WORLD.h;
        if (pathDistance({ x, y }) > 48)
            continue;
        ctx.fillStyle = rng() > 0.5 ? '#938e68' : '#d0c5a0';
        ctx.beginPath();
        ctx.ellipse(x, y, 1 + rng() * 3.5, 1 + rng() * 1.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
}
function courtyard(ctx: CanvasRenderingContext2D, rng: () => number): void {
    for (let row = 0; row < 16; row++) {
        for (let col = 0; col < 25; col++) {
            const x = 561 + col * 23 + (row % 2) * 11;
            const y = 616 + row * 14;
            if (Math.hypot((x - 857) / 1.9, y - 730) > 165 || rng() < 0.09)
                continue;
            ctx.fillStyle = '#637260';
            ctx.beginPath();
            ctx.roundRect(x, y, 21, 13, 3);
            ctx.fill();
            ctx.fillStyle = ['#9e9c80', '#a8a689', '#a2a38a', '#b4ad8c'][Math.floor(rng() * 4)] ?? '#aaa286';
            ctx.beginPath();
            ctx.roundRect(x + 1, y, 19, 10, 3);
            ctx.fill();
        }
    }
}
export function makeGround(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = WORLD.w;
    canvas.height = WORLD.h;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        throw new Error('Canvas 2D unavailable');
    const rng = randomGenerator();
    const fill = ctx.createLinearGradient(0, 0, WORLD.w, WORLD.h);
    fill.addColorStop(0, '#647b52');
    fill.addColorStop(0.5, '#7b8a57');
    fill.addColorStop(1, '#566f50');
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, WORLD.w, WORLD.h);
    for (let i = 0; i < 750; i++) {
        const x = rng() * WORLD.w;
        const y = rng() * WORLD.h;
        ctx.fillStyle = rng() > 0.45 ? '#b4b17812' : '#233e2d0d';
        ctx.beginPath();
        ctx.ellipse(x, y, 30 + rng() * 85, 10 + rng() * 35, -0.1, 0, Math.PI * 2);
        ctx.fill();
    }
    road(ctx, rng);
    groundBlades(ctx, rng);
    courtyard(ctx, rng);
    // Fine grain is baked once, never regenerated during frames.
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
        const delta = (rng() - 0.5) * 14;
        for (let channel = 0; channel < 3; channel++)
            pixels.data[i + channel] = (pixels.data[i + channel] ?? 0) + delta;
    }
    ctx.putImageData(pixels, 0, 0);
    return canvas;
}
