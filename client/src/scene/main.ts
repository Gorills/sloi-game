import { makeAssets } from "@sloi/scene/assets";
import { stamp } from "@sloi/scene/art/drawing";
import { bindInput } from "@sloi/scene/input";
import { minimap } from "@sloi/scene/minimap";
import { makeView, render, resize } from "@sloi/scene/renderer";
import { shotSound } from "@sloi/scene/sound";
import { createState, move, tick } from "@sloi/scene/state";
import { bindUI, element } from "@sloi/scene/ui";
import type { Assets } from "@sloi/scene/assets";

function portraits(assets: Assets): void {
  const actor = assets.actors[1]?.[0];
  if (!actor) return;
  const c = element("portrait", HTMLCanvasElement).getContext("2d");
  if (c) stamp(c, actor, 49, 198, 2.6);
  const equipment = element("equipment", HTMLCanvasElement).getContext("2d");
  if (equipment) stamp(equipment, actor, 116, 237, 2.5);
}

function start(): void {
  const canvas = element("scene", HTMLCanvasElement);
  const context = canvas.getContext("2d", {alpha: false});
  if (!context) throw new Error("Этот браузер не поддерживает Canvas 2D.");
  const assets = makeAssets();
  portraits(assets);
  const state = createState(), view = makeView(), ui = bindUI(state), sound = shotSound();
  const input = bindInput(state, ui, view, sound.play);
  const mini = element("minimap", HTMLCanvasElement), largeMap = element("large-map", HTMLCanvasElement);
  let last = performance.now(), uiTime = 0, frameId = 0, stopped = false;
  const frame = (now: number): void => {
    if (stopped) return;
    const dt = Math.min(Math.max(0, (now - last) / 1000), 0.05);
    last = now;
    resize(canvas, view);
    const [horizontal, vertical] = input.axes();
    move(state, horizontal, vertical, dt);
    tick(state, dt);
    render(context, assets, state, view, dt);
    uiTime += dt;
    if (uiTime > 0.08) {
      ui.update(view); minimap(mini, state);
      if (element("map-dialog", HTMLDialogElement).open) minimap(largeMap, state);
      uiTime = 0;
    }
    frameId = requestAnimationFrame(frame);
  };
  frameId = requestAnimationFrame(frame);
  window.addEventListener("pagehide", () => {
    stopped = true; cancelAnimationFrame(frameId); input.dispose(); sound.dispose();
  }, {once: true});
  document.addEventListener("visibilitychange", () => { last = performance.now(); });
  document.documentElement.dataset.motion = state.reduced ? "reduced" : "full";
  element("loading", HTMLElement).hidden = true;
  canvas.dataset.ready = "true";
  canvas.focus({preventScroll: true});
}

requestAnimationFrame(() => {
  try { start(); }
  catch (error) {
    element("loading", HTMLElement).textContent = `Не удалось загрузить сцену: ${error instanceof Error ? error.message : "неизвестная ошибка"}`;
    throw error;
  }
});
