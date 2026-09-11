/** Local visual study only: no account, loot economy, authority or durable progress. */
import { blocked, distance, EXIT, SPAWN, SUPPLY, TARGET } from "@sloi/scene/world";
import type { Position } from "@sloi/scene/world";
export interface Shot { from: Position; to: Position; age: number; hit: boolean; }
export interface StudyState {
  player: Position; facing: number; walking: boolean; phase: number; time: number;
  rounds: number; hits: number; shots: Shot[]; cooldown: number; reload: number;
  supplied: boolean; selected: boolean; reduced: boolean; visited: boolean;
  message: string; messageTime: number;
}
export function createState(): StudyState {
  return { player: {...SPAWN}, facing: 1, walking: false, phase: 0, time: 0, rounds: 6,
    hits: 0, shots: [], cooldown: 0, reload: 0, supplied: false, selected: false,
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches, visited: false,
    message: "Подойдите к ящику с припасами у мастерской.", messageTime: 6 };
}
export function notify(s: StudyState, text: string): void { s.message = text; s.messageTime = 4; }
export function move(s: StudyState, horizontal: number, vertical: number, dt: number): void {
  const length = Math.hypot(horizontal, vertical);
  s.walking = length > 0;
  if (!length) return;
  const dx = horizontal / length * 190 * dt;
  const dy = vertical / length * 190 * dt;
  const nextX = { x: s.player.x + dx, y: s.player.y };
  if (!blocked(nextX)) s.player.x = nextX.x;
  const nextY = { x: s.player.x, y: s.player.y + dy };
  if (!blocked(nextY)) s.player.y = nextY.y;
  s.facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
  s.phase += dt * 9;
}
export function tick(s: StudyState, dt: number): void {
  s.time += dt;
  s.cooldown = Math.max(0, s.cooldown - dt);
  s.messageTime = Math.max(0, s.messageTime - dt);
  if (s.reload > 0) {
    s.reload = Math.max(0, s.reload - dt);
    if (s.reload === 0) { s.rounds = 6; notify(s, "Барабан заряжен."); }
  }
  s.shots = s.shots.filter((shot) => (shot.age += dt) < 0.5);
  if (!s.visited && distance(s.player, EXIT) < 110) {
    s.visited = true;
    notify(s, "Дальше — внешний мир. В этом этюде маршрут заканчивается здесь.");
  }
}
export function selectTarget(s: StudyState): void {
  s.selected = !s.selected;
  if (s.selected) notify(s, "Манекен выбран. Подойдите ближе и нажмите Пробел.");
}
export function shoot(s: StudyState): void {
  if (s.reload > 0 || s.cooldown > 0) return;
  if (!s.selected) { notify(s, "Сначала выберите манекен: F или щелчок по нему."); return; }
  if (distance(s.player, TARGET) > 270) { notify(s, "Слишком далеко. Подойдите к манекену."); return; }
  if (!s.rounds) { notify(s, "Барабан пуст. Нажмите R для перезарядки."); return; }
  s.rounds--; s.hits++; s.cooldown = 0.38;
  const from = { x: s.player.x, y: s.player.y - 42 };
  const to = { x: TARGET.x, y: TARGET.y - 82 };
  s.facing = (Math.round(Math.atan2(to.y - from.y, to.x - from.x) / (Math.PI / 4)) + 8) % 8;
  s.shots.push({ from, to, age: 0, hit: true });
  notify(s, `Попадание ${s.hits}. Это тренировка, не добыча и не прокачка.`);
}
export function reload(s: StudyState): void {
  if (s.rounds === 6 || s.reload > 0) return;
  s.reload = 1.25;
  notify(s, "Перезарядка…");
}
export function canSupply(s: StudyState): boolean { return distance(s.player, SUPPLY) < 105; }
