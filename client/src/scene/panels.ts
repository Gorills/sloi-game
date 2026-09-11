import { CACHE, PROPS, ROAD, TARGET, WORLD } from '@sloi/scene/world';
import type { Panel, StudyState } from '@sloi/scene/model';
export function element<T extends HTMLElement>(id: string): T {
    const found = document.getElementById(id);
    if (!found)
        throw new Error(`Missing UI element: ${id}`);
    return found as T;
}
function drawMap(state: StudyState): void {
    const canvas = element<HTMLCanvasElement>('local-map');
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    ctx.fillStyle = '#182e2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(canvas.width / WORLD.w, canvas.height / WORLD.h);
    ctx.strokeStyle = '#a59566';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ROAD.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
    for (const p of PROPS) {
        ctx.fillStyle = p.art === 'tree' ? '#425d41' : '#77826a';
        ctx.fillRect(p.x - p.w * 0.3, p.y - p.h * 0.15, p.w * 0.6, p.h * 0.25);
    }
    for (const [p, label, color] of [[CACHE, 'Припасы', '#e8c180'], [TARGET, 'Мишень', '#ffa99d'], [state.player, 'Вы', '#f3eee2']] as const) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '42px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(label, p.x, p.y + 72);
    }
    ctx.restore();
}
export function createPanels(state: StudyState, canvas: HTMLCanvasElement, clearInput: () => void): {
    open(panel: Exclude<Panel, null>): void;
    close(): void;
    dispose(): void;
} {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    let returnTo: HTMLElement = canvas;
    function close(): void {
        if (!state.panel)
            return;
        element<HTMLDialogElement>(state.panel).close();
        state.panel = null;
        clearInput();
        // Complete focus restoration synchronously. A later close event must not steal
        // focus back after the player has already clicked the world.
        (returnTo.isConnected ? returnTo : canvas).focus({ preventScroll: true });
    }
    for (const dialog of document.querySelectorAll<HTMLDialogElement>('dialog')) {
        dialog.querySelector('button.close-panel')?.addEventListener('click', close, options);
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); }, options);
    }
    return {
        open(panel) {
            if (state.panel === panel) {
                close();
                return;
            }
            if (state.panel)
                return;
            clearInput();
            state.walking = false;
            returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : canvas;
            state.panel = panel;
            if (panel === 'map')
                drawMap(state);
            element<HTMLDialogElement>(panel).showModal();
        },
        close,
        dispose() { controller.abort(); },
    };
}
