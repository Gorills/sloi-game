import { loadAssets } from '@sloi/scene/assets';
import { createRenderer } from '@sloi/scene/renderer';
import { advance, createState, interact, move, reload, shoot } from '@sloi/scene/model';
import { bindInput, type Actions } from '@sloi/scene/input';
import { createPanels, element } from '@sloi/scene/panels';
import { bindUI } from '@sloi/scene/ui';
import { createAudio } from '@sloi/scene/audio';
async function start(): Promise<void> {
    const canvas = element<HTMLCanvasElement>('world');
    const assets = await loadAssets();
    const state = createState(matchMedia('(prefers-reduced-motion: reduce)').matches);
    const renderer = createRenderer(canvas, assets);
    const audio = createAudio();
    const actions: Actions = {
        fire: () => { if (shoot(state, performance.now() / 1000))
            audio.shot(); },
        reload: () => reload(state, performance.now() / 1000),
        interact: () => interact(state),
        panel: name => panels.open(name),
    };
    const input = bindInput(canvas, state, renderer.view, actions);
    const panels = createPanels(state, canvas, input.clear);
    const ui = bindUI(state, assets, actions, audio);
    let previous = performance.now();
    let frame = 0;
    let stopped = false;
    const frameTimes: number[] = [];
    function render(now: number): void {
        if (stopped)
            return;
        const dt = Math.min((now - previous) / 1000, 0.05);
        previous = now;
        const [x, y] = input.direction();
        move(state, x, y, dt);
        advance(state, now / 1000);
        const began = performance.now();
        renderer.draw(state, now / 1000, dt);
        ui.update(renderer.view);
        frameTimes.push(performance.now() - began);
        if (frameTimes.length > 600)
            frameTimes.shift();
        frame = requestAnimationFrame(render);
    }
    Object.defineProperty(window, 'sloiStudy', {
        configurable: true,
        value: Object.freeze({ snapshot: () => ({
                player: { ...state.player }, facing: state.facing, walking: state.walking,
                ammo: state.ammo, reserve: state.reserve, hits: state.hits, panel: state.panel,
                reduced: state.reduced, selected: state.selected, suppliesTaken: state.suppliesTaken,
                view: { ...renderer.view }, drawMilliseconds: [...frameTimes],
            }) }),
    });
    window.addEventListener('pagehide', () => {
        stopped = true;
        cancelAnimationFrame(frame);
        input.dispose();
        panels.dispose();
        ui.dispose();
        renderer.dispose();
        audio.dispose();
    }, { once: true });
    element('loading').hidden = true;
    document.documentElement.dataset['ready'] = 'true';
    canvas.focus({ preventScroll: true });
    frame = requestAnimationFrame(render);
}
void start().catch(error => {
    element('loading').textContent = 'Не удалось загрузить сцену. Перезагрузите страницу.';
    console.error(error);
});
