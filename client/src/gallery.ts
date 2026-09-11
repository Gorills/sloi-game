import { drawMapPreview } from "@sloi/map-preview";

function required<T extends Element>(selector: string, kind: new () => T): T {
  const element = document.querySelector(selector);
  if (!(element instanceof kind)) throw new Error(`Missing or invalid element: ${selector}`);
  return element;
}

const root = document.documentElement;
const canvas = required("#map", HTMLCanvasElement);
const textScale = required("#text-scale", HTMLSelectElement);
const reduceMotion = required("#reduce-motion", HTMLInputElement);
const helpOpen = required("#help-open", HTMLButtonElement);
const help = required("#help", HTMLDialogElement);
const connection = required("#connection-state", HTMLSelectElement);
const connectionMessage = required("#connection-message", HTMLParagraphElement);
const action = required("#action-state", HTMLSelectElement);
const actionButton = required("#action-preview", HTMLButtonElement);
const actionReason = required("#action-reason", HTMLParagraphElement);

textScale.addEventListener("change", () => {
  const scale = Number(textScale.value);
  if (![100, 150, 200].includes(scale)) throw new Error("Unsupported text scale");
  root.style.fontSize = `${16 * scale / 100}px`;
});
reduceMotion.checked = matchMedia("(prefers-reduced-motion: reduce)").matches;
reduceMotion.addEventListener("change", () => {
  root.dataset.motion = reduceMotion.checked ? "reduced" : "normal";
});
helpOpen.addEventListener("click", () => help.showModal());
help.addEventListener("close", () => helpOpen.focus());

const connectionLabels: Record<string, string> = {
  connected: "✓ Соединение восстановлено — демонстрация",
  reconnecting: "↻ Переподключение — новые действия временно недоступны",
  offline: "! Нет связи — результат операции неизвестен, дождитесь восстановления",
};
connection.addEventListener("change", () => {
  const label = connectionLabels[connection.value];
  if (!label) throw new Error("Unknown connection state");
  connectionMessage.dataset.state = connection.value;
  connectionMessage.textContent = label;
});

const actionLabels: Record<string, string> = {
  ready: "Демонстрационный режим: переход не выполняется.",
  insufficient: "Не хватает осколков. Пополните запас перед переходом.",
  pending: "Ожидаем подтверждение. Повторное действие недоступно.",
  error: "Не удалось подтвердить действие. Ресурс не показан как потраченный.",
};
action.addEventListener("change", () => {
  const label = actionLabels[action.value];
  if (!label) throw new Error("Unknown action state");
  actionReason.textContent = label;
  actionButton.disabled = action.value === "insufficient" || action.value === "pending";
});
actionButton.addEventListener("click", () => {
  actionReason.textContent = "Это образец интерфейса. Игровой переход ещё не реализован.";
});

const observer = new ResizeObserver(() => drawMapPreview(canvas));
observer.observe(canvas);
window.addEventListener("resize", () => drawMapPreview(canvas));
window.addEventListener("pagehide", () => observer.disconnect());
window.addEventListener("pageshow", () => observer.observe(canvas));
drawMapPreview(canvas);
