import { CACHE, distance } from '@sloi/scene/world';
import { element } from '@sloi/scene/panels';
import type { StudyAssets } from '@sloi/scene/assets';
import type { StudyState } from '@sloi/scene/model';
import type { Actions } from '@sloi/scene/input';
import type { View } from '@sloi/scene/renderer';
const DESCRIPTIONS: Record<string, [
    string,
    string
]> = {
    revolver: ['Походный револьвер', 'Шесть патронов в барабане. В этой сцене можно проверить стрельбу только по учебной мишени.'],
    cartridges: ['Учебные патроны', 'Запас расходуется при перезарядке. В ящике у повозки можно один раз взять ещё шесть патронов.'],
    amulet: ['Дорожный амулет', 'Образец графики предмета. Его свойства и расход осколков не реализованы в этой сцене.'],
};
function setText(id: string, text: string): void {
    const node = element(id);
    if (node.textContent !== text)
        node.textContent = text;
}
export function bindUI(state: StudyState, assets: StudyAssets, actions: Actions, audio: {
    enable(value: boolean): Promise<void>;
}): {
    update(view: View): void;
    dispose(): void;
} {
    const controller = new AbortController();
    const options = { signal: controller.signal };
    for (const image of document.querySelectorAll<HTMLImageElement>('img[data-art]')) {
        image.src = assets.source(image.dataset['art'] ?? '');
    }
    const buttons: Record<string, () => void> = {
        fire: actions.fire, reload: actions.reload, interact: actions.interact,
        'open-inventory': () => actions.panel('inventory'), 'open-settings': () => actions.panel('settings'),
        'open-map': () => actions.panel('map'), 'open-about': () => actions.panel('about'),
    };
    for (const [id, action] of Object.entries(buttons))
        element(id).addEventListener('click', action, options);
    for (const item of document.querySelectorAll<HTMLButtonElement>('.item')) {
        item.addEventListener('click', () => {
            const info = DESCRIPTIONS[item.dataset['item'] ?? ''];
            if (!info)
                return;
            setText('item-title', info[0]);
            setText('item-description', info[1]);
            for (const other of document.querySelectorAll('.item'))
                other.setAttribute('aria-pressed', String(other === item));
        }, options);
    }
    settings(state, audio, options);
    return {
        update(view) {
            setText('ammo', String(state.ammo));
            setText('reserve', String(state.reserve));
            setText('inventory-ammo', String(state.reserve));
            setText('hit-count', `Попаданий: ${state.hits}`);
            setText('notice', state.notice);
            element('target-status').hidden = !state.selected;
            element<HTMLButtonElement>('reload').disabled = state.ammo === 6 || state.reserve === 0 || state.reloadUntil > 0;
            const prompt = element('context');
            prompt.hidden = state.panel !== null || distance(state.player, CACHE) > 100;
            prompt.style.left = `${(CACHE.x - view.x) * view.scale}px`;
            prompt.style.top = `${(CACHE.y - 97 - view.y) * view.scale}px`;
            setText('context-label', state.suppliesTaken ? 'Проверить ящик' : 'Забрать патроны');
            setText('objective-text', state.suppliesTaken ? 'Проверьте револьвер у мишени' : 'Проверьте припасы у повозки');
            const small = document.querySelector('#objective small');
            if (small)
                small.textContent = state.suppliesTaken ? 'На востоке · F — цель · Space — выстрел' : 'Подойдите к ящику и нажмите E';
            document.querySelectorAll('#rounds i').forEach((round, i) => round.classList.toggle('empty', i >= state.ammo));
        },
        dispose() { controller.abort(); },
    };
}
function settings(state: StudyState, audio: {
    enable(value: boolean): Promise<void>;
}, options: AddEventListenerOptions): void {
    const reduced = element<HTMLInputElement>('reduce-motion');
    reduced.checked = state.reduced;
    document.documentElement.dataset['motion'] = state.reduced ? 'reduced' : 'full';
    reduced.addEventListener('change', () => {
        state.reduced = reduced.checked;
        document.documentElement.dataset['motion'] = state.reduced ? 'reduced' : 'full';
    }, options);
    const sound = element<HTMLInputElement>('enable-sound');
    sound.addEventListener('change', () => {
        state.sound = sound.checked;
        void audio.enable(state.sound).catch(() => {
            state.sound = false;
            sound.checked = false;
            state.notice = 'Браузер не разрешил звук. Сцена работает без него.';
        });
    }, options);
    const scale = element<HTMLSelectElement>('study-text-scale');
    scale.addEventListener('change', () => {
        const value = Number(scale.value);
        document.documentElement.style.fontSize = `${16 * value / 100}px`;
        document.documentElement.dataset['largeText'] = String(value >= 150);
    }, options);
}
