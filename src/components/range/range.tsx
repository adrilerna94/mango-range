"use client";

import { RangeHandle } from "./range-handle";
import { RangeLabel } from "./range-label";
import { useRange } from "./hooks/use-range";
import {
  formatCurrency,
  getClosestIndex,
  valueToPercent,
  type SelectedRange,
} from "./utils/range.utils";

/** Precios seleccionados: `[mínimo, máximo]`. */
export type RangeValue = [min: number, max: number];

// API controlada o no controlada, como Radix Slider. Los valores son siempre
// precios, también en modo fijo.
type RangeValueProps = {
  /** Valor controlado: el padre lo actualiza en `onValueChange`. */
  value?: RangeValue;
  /** Valor inicial si el componente no está controlado. */
  defaultValue?: RangeValue;
  /** Se llama en cada cambio, también durante el arrastre (para pintar). */
  onValueChange?: (value: RangeValue) => void;
  /**
   * Se llama una vez al terminar la interacción: al soltar el tirador, con
   * cada tecla o al confirmar una etiqueta (p. ej. para filtrar o sincronizar
   * la URL).
   */
  onValueCommit?: (value: RangeValue) => void;
};

type NormalRangeProps = RangeValueProps & {
  mode: "normal";
  min: number;
  max: number;
};

type FixedRangeProps = RangeValueProps & {
  mode: "fixed";
  values: number[];
};

export type RangeProps = NormalRangeProps | FixedRangeProps;

function getRangeConfig(props: RangeProps) {
  if (props.mode === "fixed") {
    const { values } = props;

    return {
      min: 0,
      max: values.length - 1,
      isEditable: false,
      // Una marca en la barra por cada valor posible.
      markCount: values.length,
      getPrice: (index: number) => values[index],
      // Un precio que no está en la lista se ajusta al más cercano.
      toPosition: (price: number) => getClosestIndex(values, price),
    };
  }

  return {
    min: props.min,
    max: props.max,
    isEditable: true,
    markCount: 0,
    getPrice: (value: number) => value,
    toPosition: (price: number) => price,
  };
}

export function Range(props: RangeProps) {
  const { value, defaultValue, onValueChange, onValueCommit } = props;
  const { min, max, isEditable, markCount, getPrice, toPosition } =
    getRangeConfig(props);

  // El hook trabaja con posiciones (índices en modo fijo); fuera, precios.
  const toPositions = (range?: RangeValue): SelectedRange | undefined =>
    range && { min: toPosition(range[0]), max: toPosition(range[1]) };
  const toPrices = (range: SelectedRange): RangeValue => [
    getPrice(range.min),
    getPrice(range.max),
  ];

  const {
    minValue,
    maxValue,
    activeHandle,
    topHandle,
    trackRef,
    setValue,
    getPointerHandlers,
    handleKeyDown,
  } = useRange({
    min,
    max,
    value: toPositions(value),
    defaultValue: toPositions(defaultValue),
    onValueChange: onValueChange && ((range) => onValueChange(toPrices(range))),
    onValueCommit: onValueCommit && ((range) => onValueCommit(toPrices(range))),
  });

  const minPrice = getPrice(minValue);
  const maxPrice = getPrice(maxValue);
  const minPercent = valueToPercent(minValue, min, max);
  const maxPercent = valueToPercent(maxValue, min, max);

  return (
    <div
      role="group"
      aria-label="Rango de precios"
      className="grid w-full grid-cols-2 items-center gap-3 select-none sm:grid-cols-[auto_minmax(0,1fr)_auto]"
    >
      {/* Móvil: etiquetas en una fila encima de la barra, que ocupa todo el ancho.
          Desde sm: etiquetas a ambos lados de la barra. */}
      <div className="col-start-1 row-start-1 flex h-6 items-center sm:min-w-20 sm:justify-end">
        <RangeLabel
          label="Precio mínimo"
          value={minPrice}
          onValueChange={
            isEditable ? (value) => setValue("min", value) : undefined
          }
        />
      </div>

      <div
        ref={trackRef}
        className="relative col-span-2 row-start-2 flex h-6 items-center sm:col-span-1 sm:col-start-2 sm:row-start-1"
      >
        <div className="h-1 w-full rounded-full bg-border" />
        <div
          className="absolute h-1 rounded-full bg-accent"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {Array.from({ length: markCount }, (_, index) => (
          <span
            key={index}
            aria-hidden="true"
            data-range-mark=""
            className={`pointer-events-none absolute size-2 -translate-x-1/2 rounded-full ring-2 ring-surface ${
              index >= minValue && index <= maxValue ? "bg-accent" : "bg-border"
            }`}
            style={{ left: `${valueToPercent(index, min, max)}%` }}
          />
        ))}

        <RangeHandle
          label="Precio mínimo"
          value={minValue}
          min={min}
          max={maxValue - 1}
          valueText={formatCurrency(minPrice)}
          percent={minPercent}
          isDragging={activeHandle === "min"}
          isOnTop={topHandle === "min"}
          {...getPointerHandlers("min")}
          onKeyDown={handleKeyDown("min")}
        />

        <RangeHandle
          label="Precio máximo"
          value={maxValue}
          min={minValue + 1}
          max={max}
          valueText={formatCurrency(maxPrice)}
          percent={maxPercent}
          isDragging={activeHandle === "max"}
          isOnTop={topHandle === "max"}
          {...getPointerHandlers("max")}
          onKeyDown={handleKeyDown("max")}
        />
      </div>

      <div className="col-start-2 row-start-1 flex h-6 items-center justify-end sm:col-start-3 sm:min-w-20 sm:justify-start">
        <RangeLabel
          label="Precio máximo"
          value={maxPrice}
          onValueChange={
            isEditable ? (value) => setValue("max", value) : undefined
          }
        />
      </div>
    </div>
  );
}
