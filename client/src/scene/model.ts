import { blocked, CACHE, clearShot, distance, SPEED, START, TARGET, type Point } from '@sloi/scene/world';
export type Facing = 'front' | 'back' | 'left' | 'right';
export type Panel = 'inventory' | 'settings' | 'map' | 'about' | null;
export interface StudyState {
    player: Point;
    facing: Facing;
    stride: number;
    walking: boolean;
    ammo: number;
    reserve: number;
    suppliesTaken: boolean;
    selected: boolean;
    hits: number;
    shotAt: number;
    reloadUntil: number;
    notice: string;
    panel: Panel;
    reduced: boolean;
    sound: boolean;
}
export function createState(reduced = false): StudyState {
    return {
        player: { ...START }, facing: 'front', stride: 0, walking: false,
        ammo: 6, reserve: 12, suppliesTaken: false, selected: false, hits: 0,
        shotAt: -10, reloadUntil: 0, notice: 'Осмотрите припасы у повозки или пройдите к мишени.',
        panel: null, reduced, sound: false,
    };
}
export function move(state: StudyState, x: number, y: number, seconds: number): void {
    const length = Math.hypot(x, y);
    state.walking = length > 0 && state.panel === null;
    if (!state.walking)
        return;
    const amount = SPEED * Math.min(0.05, Math.max(0, seconds)) / length;
    const nextX = { x: state.player.x + x * amount, y: state.player.y };
    if (!blocked(nextX))
        state.player.x = nextX.x;
    const nextY = { x: state.player.x, y: state.player.y + y * amount };
    if (!blocked(nextY))
        state.player.y = nextY.y;
    state.facing = Math.abs(y) >= Math.abs(x) ? (y < 0 ? 'back' : 'front') : (x < 0 ? 'left' : 'right');
    state.stride += Math.min(0.05, seconds) * 11;
}
export function interact(state: StudyState): void {
    if (distance(state.player, CACHE) > 100) {
        state.notice = 'Подойдите к ящику с припасами.';
    }
    else if (state.suppliesTaken) {
        state.notice = 'Припасы уже получены. В ящике больше нет патронов.';
    }
    else {
        state.suppliesTaken = true;
        state.reserve += 6;
        state.notice = 'Получено 6 учебных патронов. Они появились в инвентаре.';
    }
}
export function shoot(state: StudyState, now: number): boolean {
    if (state.panel || now - state.shotAt < 0.55 || state.reloadUntil > now)
        return false;
    if (!state.selected) {
        state.notice = 'Выберите мишень: щёлкните по ней или нажмите F.';
        return false;
    }
    if (state.ammo === 0) {
        state.notice = 'Барабан пуст. Нажмите R для перезарядки.';
        return false;
    }
    if (distance(state.player, TARGET) > 490) {
        state.notice = 'Мишень слишком далеко. Подойдите ближе.';
        return false;
    }
    if (!clearShot(state.player, TARGET)) {
        state.notice = 'Линия выстрела перекрыта. Смените позицию.';
        return false;
    }
    state.ammo--;
    state.shotAt = now;
    state.hits++;
    state.facing = TARGET.x >= state.player.x ? 'right' : 'left';
    state.notice = `Попадание ${state.hits}. Это учебная мишень: боевых наград здесь нет.`;
    return true;
}
export function reload(state: StudyState, now: number): void {
    if (state.panel || state.reloadUntil > 0)
        return;
    if (state.ammo === 6) {
        state.notice = 'Барабан уже заряжен.';
        return;
    }
    if (state.reserve === 0) {
        state.notice = 'Запасных патронов нет.';
        return;
    }
    state.reloadUntil = now + 1.1;
    state.notice = 'Перезарядка…';
}
export function advance(state: StudyState, now: number): void {
    if (state.reloadUntil === 0 || now < state.reloadUntil)
        return;
    const amount = Math.min(6 - state.ammo, state.reserve);
    state.ammo += amount;
    state.reserve -= amount;
    state.reloadUntil = 0;
    state.notice = 'Револьвер заряжен.';
}
