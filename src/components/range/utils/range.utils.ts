import type { Handle, SelectedRange } from "../types/range.types";

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

/** Índice del valor de la lista más cercano a `target`. */
export function getClosestIndex(values: number[], target: number): number {
  return values.reduce(
    (closest, value, index) =>
      Math.abs(value - target) < Math.abs(values[closest] - target)
        ? index
        : closest,
    0,
  );
}

// Formato de precio en español: "1 €", "1,99 €" (con espacio duro antes del
// símbolo). Los enteros se muestran sin ",00".
const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  trailingZeroDisplay: "stripIfInteger",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function clampRange(
  selected: SelectedRange,
  bounds: SelectedRange,
): SelectedRange {
  const min = clamp(selected.min, bounds.min, bounds.max - 1);
  const max = clamp(selected.max, min + 1, bounds.max);

  if (min === selected.min && max === selected.max) return selected;

  return { min, max };
}

// Devuelve el mismo objeto si el valor no cambia, para que React pueda saltarse
// el render (p. ej. en los `pointermove` que no llegan a cambiar de valor).
export function moveHandle(
  selected: SelectedRange,
  handle: Handle,
  value: number,
  bounds: SelectedRange,
): SelectedRange {
  if (handle === "min") {
    const min = clamp(value, bounds.min, selected.max - 1);

    return min === selected.min ? selected : { ...selected, min };
  }

  const max = clamp(value, selected.min + 1, bounds.max);

  return max === selected.max ? selected : { ...selected, max };
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
