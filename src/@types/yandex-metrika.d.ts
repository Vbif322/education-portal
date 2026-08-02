// Счётчик Яндекс.Метрики подключается скриптом в layout (см. YandexMetrika),
// поэтому `window.ym` появляется только в рантайме и только на клиенте.
// Объявление живёт здесь, а не рядом с формой: два модуля не могут объявить
// один и тот же член `Window` через `declare global`.

interface Window {
  ym?: (id: number, action: string, ...rest: unknown[]) => void;
}
