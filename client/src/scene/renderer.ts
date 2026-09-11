import { atmosphere } from '@sloi/scene/atmosphere';
import { makeGround } from '@sloi/scene/ground';
import { drawActor } from '@sloi/scene/actor';
import { PROPS, TARGET, WORLD, type Point, type Prop } from '@sloi/scene/world';
import type { StudyAssets } from '@sloi/scene/assets';
import type { StudyState } from '@sloi/scene/model';
export interface View {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
    dpr: number;
}
export function toWorld(view: View, x: number, y: number): Point {
    return { x: x / view.scale + view.x, y: y / view.scale + view.y };
}
function shadows(ctx: CanvasRenderingContext2D): void {
    for (const p of PROPS) {
        ctx.fillStyle = p.art === 'tree' ? '#213e3537' : '#193a353d';
        ctx.beginPath();
        ctx.ellipse(p.x + p.w * 0.12, p.y + 14, p.w * 0.42, p.h * 0.14, 0.35, 0, Math.PI * 2);
        ctx.fill();
    }
}
function prop(ctx: CanvasRenderingContext2D, p: Prop, state: StudyState, assets: StudyAssets, now: number): void {
    const left = p.x - p.w / 2;
    const top = p.y - p.foot;
    const behind = state.player.y < p.y && state.player.y > top && Math.abs(state.player.x - p.x) < p.w * 0.4;
    ctx.save();
    // The player is never completely lost under opaque roofs or foliage.
    if (behind && ['tree', 'house', 'forge', 'wall', 'gate'].includes(p.art))
        ctx.globalAlpha = 0.40;
    const sway = p.art === 'tree' && !state.reduced ? Math.sin(now * 0.8 + p.x) * 1.3 : 0;
    ctx.drawImage(assets.image(p.art), left + sway, top, p.w, p.h);
    ctx.restore();
}
function details(ctx: CanvasRenderingContext2D, state: StudyState, now: number): void {
    if (state.selected) {
        ctx.strokeStyle = '#efbd83';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(TARGET.x, TARGET.y, 32, 11, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#f5e4bc';
        ctx.font = '13px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Учебная мишень', TARGET.x, TARGET.y - 159);
    }
    const age = now - state.shotAt;
    if (age < 0.18) {
        ctx.strokeStyle = `rgba(253,220,145,${1 - age / 0.18})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(state.player.x + 33, state.player.y - 48);
        ctx.lineTo(TARGET.x, TARGET.y - 65);
        ctx.stroke();
        ctx.fillStyle = '#ffe8af';
        ctx.beginPath();
        ctx.arc(state.player.x + 37, state.player.y - 50, 5 * (1 - age / 0.18), 0, Math.PI * 2);
        ctx.fill();
    }
    if (age < 0.7) {
        ctx.strokeStyle = `rgba(249,216,140,${1 - age / 0.7})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 7; i++) {
            const angle = i * Math.PI * 2 / 7;
            ctx.beginPath();
            ctx.moveTo(TARGET.x + Math.cos(angle) * age * 25, TARGET.y - 65 + Math.sin(angle) * age * 15);
            ctx.lineTo(TARGET.x + Math.cos(angle) * age * 50, TARGET.y - 65 + Math.sin(angle) * age * 30);
            ctx.stroke();
        }
    }
}
export function createRenderer(canvas: HTMLCanvasElement, assets: StudyAssets): {
    view: View;
    draw(state: StudyState, now: number, dt: number): void;
    dispose(): void;
} {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context)
        throw new Error('Canvas 2D unavailable');
    const ctx = context;
    const ground = makeGround();
    const view: View = { x: 0, y: 0, width: 0, height: 0, scale: 1, dpr: 1 };
    const resize = (): void => {
        const rect = canvas.getBoundingClientRect();
        view.width = rect.width;
        view.height = rect.height;
        view.scale = Math.max(0.7, Math.min(1.35, rect.height / 900));
        view.dpr = Math.min(devicePixelRatio || 1, 2);
        canvas.width = Math.round(rect.width * view.dpr);
        canvas.height = Math.round(rect.height * view.dpr);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    let first = true;
    return {
        view,
        draw(state, now, dt) {
            const targetX = Math.max(0, Math.min(WORLD.w - view.width / view.scale, state.player.x - view.width / view.scale / 2));
            const targetY = Math.max(0, Math.min(WORLD.h - view.height / view.scale, state.player.y - view.height / view.scale * 0.62));
            const follow = first || state.reduced ? 1 : 1 - Math.exp(-dt * 7);
            view.x += (targetX - view.x) * follow;
            view.y += (targetY - view.y) * follow;
            first = false;
            ctx.setTransform(view.dpr * view.scale, 0, 0, view.dpr * view.scale, -view.x * view.dpr * view.scale, -view.y * view.dpr * view.scale);
            ctx.drawImage(ground, 0, 0);
            shadows(ctx);
            const actors: (Prop | 'player')[] = [...PROPS, 'player'];
            actors.sort((a, b) => (a === 'player' ? state.player.y : a.y) - (b === 'player' ? state.player.y : b.y));
            for (const item of actors) {
                if (item === 'player')
                    drawActor(ctx, state, assets, now);
                else
                    prop(ctx, item, state, assets, now);
            }
            atmosphere(ctx, now, state.reduced);
            details(ctx, state, now);
        },
        dispose() { observer.disconnect(); },
    };
}
