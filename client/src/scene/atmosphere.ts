/** Small local effects with no relationship to damage or game rules. */
export function atmosphere(ctx: CanvasRenderingContext2D, now: number, reduced: boolean): void {
    if (reduced)
        return;
    // The forge chimney in the authored location; particles are deterministic from elapsed time.
    for (let i = 0; i < 9; i++) {
        const age = (now * 0.17 + i / 9) % 1;
        const x = 852 + Math.sin(age * 4) * 25;
        const y = 325 - age * 110;
        const radius = 4 + age * 19;
        const smoke = ctx.createRadialGradient(x, y, 0, x, y, radius);
        smoke.addColorStop(0, `rgba(213,207,174,${(1 - age) * 0.10})`);
        smoke.addColorStop(1, 'rgba(213,207,174,0)');
        ctx.fillStyle = smoke;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    for (let i = 0; i < 22; i++) {
        const x = 250 + (i * 193 + now * 8) % 1700;
        const y = 500 + (i * 67 + Math.sin(now + i) * 12) % 600;
        ctx.fillStyle = `rgba(236,213,157,${0.16 + Math.sin(now * 0.4 + i) * 0.12})`;
        ctx.beginPath();
        ctx.ellipse(x, y, 1.8, 0.8, now * 0.3 + i, 0, Math.PI * 2);
        ctx.fill();
    }
    const glow = ctx.createRadialGradient(765, 580, 1, 765, 580, 46);
    glow.addColorStop(0, `rgba(255,184,73,${0.18 + Math.sin(now * 6) * 0.03})`);
    glow.addColorStop(1, 'rgba(255,171,61,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(719, 534, 92, 92);
}
