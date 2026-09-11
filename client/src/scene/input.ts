import { element } from "@sloi/scene/ui";
import { reload, selectTarget, shoot } from "@sloi/scene/state";
import { distance, TARGET } from "@sloi/scene/world";
import { worldPoint } from "@sloi/scene/renderer";
import type { StudyState } from "@sloi/scene/state";
import type { SceneUI } from "@sloi/scene/ui";
import type { View } from "@sloi/scene/renderer";
const movement = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
export interface Input { axes: () => readonly [number, number]; clear: () => void; dispose: () => void; }

export function bindInput(s: StudyState, ui: SceneUI, view: View, onShot: () => void): Input {
  const canvas = element("scene", HTMLCanvasElement);
  const keys = new Set<string>();
  const abort = new AbortController();
  const options = {signal: abort.signal};
  const clear = (): void => { keys.clear(); s.walking = false; };
  const fire = (): void => { const previous = s.hits; shoot(s); if (s.hits > previous) onShot(); };
  const actions: Readonly<Record<string, () => void>> = {
    KeyE: ui.interact, KeyF: () => selectTarget(s), Space: fire, KeyR: () => reload(s),
    KeyI: () => ui.open("inventory", element("inventory-button", HTMLButtonElement)),
    KeyM: () => ui.open("map-dialog", element("map-button", HTMLButtonElement)),
    Escape: () => ui.open("settings-dialog", element("settings-button", HTMLButtonElement)),
  };
  const keydown = (event: KeyboardEvent): void => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof HTMLElement && (event.target.isContentEditable ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))) return;
    if (ui.modal()) {
      clear();
      const samePanel = event.code === "KeyI" && element("inventory", HTMLDialogElement).open ||
        event.code === "KeyM" && element("map-dialog", HTMLDialogElement).open;
      if (samePanel) { event.preventDefault(); ui.close(); }
      return;
    }
    if (event.target instanceof HTMLButtonElement && ["Space", "Enter"].includes(event.code)) return;
    if (movement.has(event.code)) { event.preventDefault(); keys.add(event.code); return; }
    const action = actions[event.code];
    if (action) { event.preventDefault(); if (!event.repeat) { clear(); action(); } }
  };
  window.addEventListener("keydown", keydown, options);
  window.addEventListener("keyup", (e) => keys.delete(e.code), options);
  window.addEventListener("blur", clear, options);
  document.addEventListener("visibilitychange", clear, options);
  canvas.addEventListener("blur", clear, options);
  canvas.addEventListener("pointerdown", (e) => {
    if (ui.modal()) return;
    canvas.focus({preventScroll: true});
    const rect = canvas.getBoundingClientRect();
    const p = worldPoint(view, {x: e.clientX - rect.left, y: e.clientY - rect.top});
    if (distance(p, {x: TARGET.x, y: TARGET.y - 82}) < 45) s.selected = true;
  }, options);
  for (const [id, action] of Object.entries({"attack-button": fire, "reload-button": () => reload(s)})) {
    element(id, HTMLButtonElement).addEventListener("click", action, options);
  }
  for (const [id, dialog] of Object.entries({"inventory-button": "inventory", "map-button": "map-dialog", "settings-button": "settings-dialog"})) {
    const button = element(id, HTMLButtonElement);
    button.addEventListener("click", () => {clear(); ui.open(dialog, button);}, options);
  }
  return { clear, dispose: () => abort.abort(), axes: () => ui.modal() ? [0, 0] : [
    Number(keys.has("KeyD") || keys.has("ArrowRight")) - Number(keys.has("KeyA") || keys.has("ArrowLeft")),
    Number(keys.has("KeyS") || keys.has("ArrowDown")) - Number(keys.has("KeyW") || keys.has("ArrowUp")),
  ] };
}
