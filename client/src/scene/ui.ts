import { canSupply, notify } from "@sloi/scene/state";
import { distance, TARGET } from "@sloi/scene/world";
import { screenPoint } from "@sloi/scene/renderer";
import type { StudyState } from "@sloi/scene/state";
import type { View } from "@sloi/scene/renderer";
export interface SceneUI {
  modal: () => boolean; open: (id: string, opener?: HTMLElement) => void;
  close: () => void; interact: () => void; update: (view: View) => void;
}
export function element<T extends HTMLElement>(id: string, ctor: {new(): T}): T {
  const result = document.getElementById(id);
  if (!(result instanceof ctor)) throw new Error(`Missing scene element: ${id}`);
  return result;
}

function bindDialogs(s: StudyState): Pick<SceneUI, "open" | "close" | "modal"> {
  let active: HTMLDialogElement | null = null;
  let source: HTMLElement | undefined;
  const close = (): void => { active?.close(); };
  const open = (id: string, opener?: HTMLElement): void => {
    active?.close();
    const dialog = element(id, HTMLDialogElement);
    source = opener ?? element("scene", HTMLCanvasElement);
    active = dialog;
    dialog.showModal();
  };
  for (const dialog of Array.from(document.querySelectorAll<HTMLDialogElement>("dialog"))) {
    dialog.addEventListener("close", () => {
      active = null;
      const target = source?.getClientRects().length ? source : element("scene", HTMLCanvasElement);
      target.focus({preventScroll: true});
    });
    dialog.querySelector<HTMLButtonElement>("[data-close]")?.addEventListener("click", close);
  }
  element("take-map", HTMLButtonElement).addEventListener("click", () => {
    s.supplied = true;
    element("map-item", HTMLButtonElement).hidden = false;
    element("take-map", HTMLButtonElement).disabled = true;
    notify(s, "Карта добавлена в дорожную сумку. Откройте её клавишей I.");
    close();
  });
  return { open, close, modal: () => active !== null };
}

function bindSettings(s: StudyState): void {
  const reduced = element("reduce-motion", HTMLInputElement);
  reduced.checked = s.reduced;
  reduced.addEventListener("change", () => {
    s.reduced = reduced.checked;
    document.documentElement.dataset.motion = s.reduced ? "reduced" : "full";
  });
  element("ui-scale", HTMLSelectElement).addEventListener("change", (event) => {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement) {
      document.documentElement.style.fontSize = `${16 * Number(select.value)}px`;
      document.documentElement.dataset.largeText = String(Number(select.value) > 1);
    }
  });
  for (const item of Array.from(document.querySelectorAll<HTMLButtonElement>(".item-slot"))) {
    item.addEventListener("click", () => {
      document.querySelector(".item-slot[aria-pressed=true]")?.setAttribute("aria-pressed", "false");
      item.setAttribute("aria-pressed", "true");
      element("item-title", HTMLElement).textContent = item.dataset.name ?? "";
      element("item-description", HTMLElement).textContent = item.dataset.description ?? "";
    });
  }
}

function updateHud(s: StudyState): void {
  element("rounds", HTMLElement).textContent = `${s.rounds}`;
  element("reload-label", HTMLElement).textContent = s.reload > 0 ? "Зарядка…" : "Зарядить";
  element("reload-button", HTMLButtonElement).disabled = s.rounds === 6 || s.reload > 0;
  element("hit-count", HTMLElement).textContent = `${s.hits}`;
  element("shot-status", HTMLElement).textContent = s.selected ?
    distance(s.player, TARGET) <= 270 ? "Цель в пределах дальности" : "Цель слишком далеко" : "Выберите манекен: F";
  element("task-supply", HTMLElement).dataset.done = String(s.supplied);
  element("task-shot", HTMLElement).dataset.done = String(s.hits > 0);
  element("task-road", HTMLElement).dataset.done = String(s.visited);
  const message = element("scene-message", HTMLElement);
  if (message.textContent !== s.message) message.textContent = s.message;
  message.classList.toggle("visible", s.messageTime > 0);
  element("inventory-count", HTMLElement).textContent = s.supplied ? "4 предмета" : "3 предмета";
}

export function bindUI(s: StudyState): SceneUI {
  const dialogs = bindDialogs(s);
  bindSettings(s);
  const interact = (): void => {
    if (!canSupply(s)) { notify(s, "Подойдите к ящику у навеса мастерской."); return; }
    element("supply-description", HTMLElement).textContent = s.supplied ?
      "Карта уже в вашей сумке. Можно отправляться к воротам." :
      "Поверх припасов лежит карта окрестностей. Возьмите её перед выходом.";
    dialogs.open("supply-dialog", element("interact-button", HTMLButtonElement));
  };
  element("interact-button", HTMLButtonElement).addEventListener("click", interact);
  return { ...dialogs, interact, update: (view) => {
    updateHud(s);
    const prompt = element("world-prompt", HTMLElement);
    prompt.hidden = !canSupply(s) || dialogs.modal();
    const p = screenPoint(view, {x: 1120, y: 933});
    prompt.style.left = `${p.x}px`; prompt.style.top = `${p.y}px`;
    const canvas = element("scene", HTMLCanvasElement);
    canvas.dataset.playerX = s.player.x.toFixed(2); canvas.dataset.playerY = s.player.y.toFixed(2);
    canvas.dataset.hits = String(s.hits); canvas.dataset.rounds = String(s.rounds);
    canvas.dataset.supplied = String(s.supplied); canvas.dataset.visited = String(s.visited);
    const target = screenPoint(view, {x: TARGET.x, y: TARGET.y - 82});
    canvas.dataset.targetX = String(target.x); canvas.dataset.targetY = String(target.y);
    canvas.dataset.walking = String(s.walking);
  }};
}
