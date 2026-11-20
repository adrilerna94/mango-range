import type { DOMAttributes, KeyboardEventHandler } from "react";

/** Tirador del rango. */
export type Handle = "min" | "max";

/**
 * Par mínimo/máximo en posiciones internas: valores en modo normal e índices
 * de la lista en modo fijo. Sirve para la selección y para los límites.
 */
export type SelectedRange = {
  min: number;
  max: number;
};

/** Precios seleccionados: `[mínimo, máximo]`. Es el valor de la API pública. */
export type RangeValue = [min: number, max: number];

/**
 * API controlada o no controlada, con los nombres de Radix Slider. La usa
 * `<Range>` con precios (`RangeValue`) y `useRange` con posiciones
 * (`SelectedRange`).
 */
export type ControllableValueProps<T> = {
  /** Valor controlado: el padre lo actualiza en `onValueChange`. */
  value?: T;
  /** Valor inicial si no está controlado. */
  defaultValue?: T;
  /** Se llama en cada cambio, también durante el arrastre (para pintar). */
  onValueChange?: (value: T) => void;
  /**
   * Se llama una vez al terminar la interacción: al soltar el tirador, con
   * cada tecla o al confirmar una etiqueta (p. ej. para filtrar o sincronizar
   * la URL).
   */
  onValueCommit?: (value: T) => void;
};

type NormalRangeProps = ControllableValueProps<RangeValue> & {
  mode: "normal";
  min: number;
  max: number;
};

type FixedRangeProps = ControllableValueProps<RangeValue> & {
  mode: "fixed";
  values: number[];
};

/** Props de `<Range>`: unión discriminada por `mode`. */
export type RangeProps = NormalRangeProps | FixedRangeProps;

/** Lo que necesita `<Range>` de cada modo para trabajar con posiciones. */
export type RangeConfig = SelectedRange & {
  isEditable: boolean;
  /** Marcas en la barra: una por valor en modo fijo, ninguna en modo normal. */
  markCount: number;
  /** De posición a precio. */
  getPrice: (position: number) => number;
  /** De precio a posición. */
  toPosition: (price: number) => number;
};

export type UseRangeOptions = SelectedRange &
  ControllableValueProps<SelectedRange>;

/**
 * Arrastre en curso: el puntero que lo controla, la posición de la barra al
 * empezar (se lee una sola vez) y los valores al empezar y en el último
 * movimiento, para avisar al soltar solo si cambió.
 */
export type RangeDrag = {
  pointerId: number;
  trackLeft: number;
  trackWidth: number;
  start: SelectedRange;
  latest: SelectedRange;
};

/** Eventos de puntero con los que el tirador gestiona el arrastre. */
export type PointerHandlers = Pick<
  DOMAttributes<HTMLElement>,
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
  | "onLostPointerCapture"
>;

export type RangeHandleProps = PointerHandlers & {
  label: string;
  value: number;
  min: number;
  max: number;
  valueText: string;
  percent: number;
  isDragging: boolean;
  isOnTop: boolean;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
};

/** Precio de una etiqueta. Sin `onValueChange` es de solo lectura. */
export type RangeLabelProps = {
  label: string;
  value: number;
  onValueChange?: (value: number) => void;
};

export type EditableLabelProps = Required<RangeLabelProps>;

export type UseEditableLabelOptions = Omit<EditableLabelProps, "label">;
