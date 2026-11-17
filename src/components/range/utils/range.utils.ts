export type Handle = "min" | "max";

export type SelectedRange = {
  min: number;
  max: number;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function valueToPercent(
  value: number,
  min: number,
  max: number,
): number {
  if (max === min) return 0;

  return ((value - min) / (max - min)) * 100;
}

export function percentToValue(
  percent: number,
  min: number,
  max: number,
): number {
  return Math.round(min + (percent / 100) * (max - min));
}

export function getPercentFromPointer(
  pointerX: number,
  trackLeft: number,
  trackWidth: number,
): number {
  if (trackWidth === 0) return 0;

  const percent = ((pointerX - trackLeft) / trackWidth) * 100;

  return clamp(percent, 0, 100);
}

export function formatCurrency(value: number): string {
  return `${value}€`;
}

export function moveHandle(
  selected: SelectedRange,
  handle: Handle,
  value: number,
  bounds: SelectedRange,
): SelectedRange {
  if (handle === "min") {
    return { ...selected, min: clamp(value, bounds.min, selected.max - 1) };
  }

  return { ...selected, max: clamp(value, selected.min + 1, bounds.max) };
}

export function getKeyboardValue(
  key: string,
  current: number,
  bounds: SelectedRange,
): number | null {
  const largeStep = Math.max(1, Math.round((bounds.max - bounds.min) / 10));

  switch (key) {
    case "ArrowLeft":
    case "ArrowDown":
      return current - 1;
    case "ArrowRight":
    case "ArrowUp":
      return current + 1;
    case "PageDown":
      return current - largeStep;
    case "PageUp":
      return current + largeStep;
    case "Home":
      return bounds.min;
    case "End":
      return bounds.max;
    default:
      return null;
  }
}

export function parseLabelValue(input: string): number | null {
  if (input.trim() === "") return null;

  const value = Number(input);

  return Number.isFinite(value) ? Math.round(value) : null;
}
