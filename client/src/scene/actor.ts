import type { StudyAssets } from '@sloi/scene/assets';
import type { StudyState } from '@sloi/scene/model';
export function drawActor(ctx: CanvasRenderingContext2D, state: StudyState, assets: StudyAssets, now: number): void {
    const step = state.walking ? Math.sin(state.stride) : 0;
    const recoil = Math.max(0, 1 - (now - state.shotAt) / 0.18);
    ctx.save();
    ctx.translate(state.player.x, state.player.y);
    ctx.fillStyle = '#0e272d55';
    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e3d6a1';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.ellipse(0, 1, 26, 10, 0, 0.2, Math.PI - 0.2);
    ctx.stroke();
    if (state.facing === 'left')
        ctx.scale(-1, 1);
    ctx.drawImage(assets.image('boot'), -14, -28 + step * 4, 16, 31);
    ctx.drawImage(assets.image('boot'), 0, -28 - step * 4, 16, 31);
    const back = state.facing === 'back';
    const bob = state.walking ? Math.abs(step) * 1.7 : (state.reduced ? 0 : Math.sin(now * 1.8) * 0.5);
    ctx.drawImage(assets.image(back ? 'hunter-back' : 'hunter'), -29 - recoil * 2, -86 + bob, 59, 66);
    if (state.selected && !back) {
        ctx.save();
        ctx.translate(22 - recoil * 4, -49 + bob);
        ctx.rotate(-0.15 - recoil * 0.15);
        ctx.drawImage(assets.image('revolver'), -8, -10, 35, 25);
        ctx.restore();
    }
    ctx.restore();
}
