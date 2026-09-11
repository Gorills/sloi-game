import { distance, TARGET } from '@sloi/scene/world';
import { toWorld, type View } from '@sloi/scene/renderer';
import type { Panel, StudyState } from '@sloi/scene/model';
export interface Actions {
    fire(): void;
    reload(): void;
    interact(): void;
    panel(name: Exclude<Panel, null>): void;
}
const MOVEMENT: Record<string, [
    number,
    number
]> = {
    KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1],
    KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0],
};
export interface StudyInput {
    direction(): [number, number];
    clear(): void;
    dispose(): void;
}
export function bindInput(canvas: HTMLCanvasElement, state: StudyState, view: View, actions: Actions): StudyInput {
    const held = new Set<string>();
    const controller = new AbortController();
    const options = { signal: controller.signal };
    const clear = (): void => { held.clear(); state.walking = false; };
    window.addEventListener('blur', clear, options);
    document.addEventListener('visibilitychange', clear, options);
    document.addEventListener('focusin', () => { if (document.activeElement !== canvas)
        clear(); }, options);
    window.addEventListener('keyup', event => held.delete(event.code), options);
    window.addEventListener('keydown', event => {
        if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing)
            return;
        if (state.panel) {
            clear();
            panelKey(event, state, actions);
            return;
        }
        if (document.activeElement !== canvas && document.activeElement !== document.body)
            return;
        if (MOVEMENT[event.code]) {
            event.preventDefault();
            held.add(event.code);
            return;
        }
        const command = keyAction(event.code, state, actions);
        if (command) {
            event.preventDefault();
            if (!event.repeat)
                command();
        }
    }, options);
    canvas.addEventListener('pointerdown', event => pickTarget(event, canvas, state, view), options);
    return {
        clear,
        direction() {
            if (state.panel || document.hidden) {
                clear();
                return [0, 0];
            }
            let x = 0;
            let y = 0;
            for (const key of held) {
                const value = MOVEMENT[key];
                if (value) {
                    x += value[0];
                    y += value[1];
                }
            }
            return [Math.sign(x), Math.sign(y)];
        },
        dispose() { clear(); controller.abort(); },
    };
}
function selectTarget(state: StudyState): void {
    state.selected = true;
    state.notice = 'Мишень выбрана. Space — выстрел; если далеко, подойдите ближе.';
}
function keyAction(code: string, state: StudyState, actions: Actions): (() => void) | undefined {
    const bindings: Record<string, () => void> = {
        KeyF: () => selectTarget(state), Space: actions.fire, KeyR: actions.reload, KeyE: actions.interact,
        KeyI: () => actions.panel('inventory'), KeyM: () => actions.panel('map'),
        Escape: () => { if (state.selected)
            state.selected = false;
        else
            actions.panel('settings'); },
    };
    return bindings[code];
}
function pickTarget(event: PointerEvent, canvas: HTMLCanvasElement, state: StudyState, view: View): void {
    if (event.button !== 0 || state.panel)
        return;
    canvas.focus({ preventScroll: true });
    const rect = canvas.getBoundingClientRect();
    const point = toWorld(view, event.clientX - rect.left, event.clientY - rect.top);
    if (distance(point, { x: TARGET.x, y: TARGET.y - 70 }) < 65)
        selectTarget(state);
}
function panelKey(event: KeyboardEvent, state: StudyState, actions: Actions): void {
    if (event.code === 'Escape')
        return;
    const current = state.panel;
    if ((current === 'inventory' && event.code === 'KeyI') || (current === 'map' && event.code === 'KeyM')) {
        event.preventDefault();
        if (!event.repeat)
            actions.panel(current);
    }
}
