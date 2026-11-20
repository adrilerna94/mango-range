"use client";

import { RangeHandle } from "./range-handle";
import { RangeLabel } from "./range-label";
import { useRange } from "./hooks/use-range";
import { formatCurrency, valueToPercent } from "./utils/range.utils";

type NormalRangeProps = {
  mode: "normal";
  min: number;
  max: number;
};

type FixedRangeProps = {
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
      getPrice: (index: number) => values[index],
    };
  }

  return {
    min: props.min,
    max: props.max,
    isEditable: true,
    getPrice: (value: number) => value,
  };
}

export function Range(props: RangeProps) {
  const { min, max, isEditable, getPrice } = getRangeConfig(props);
  const {
    minValue,
    maxValue,
    activeHandle,
    topHandle,
    trackRef,
    setValue,
    getPointerHandlers,
    handleKeyDown,
  } = useRange({ min, max });

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
