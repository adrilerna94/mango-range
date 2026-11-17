"use client";

import { RangeHandle } from "./range-handle";
import { RangeLabel } from "./range-label";
import { formatCurrency, valueToPercent } from "./range.utils";
import { useRange } from "./use-range";

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
    trackRef,
    setValue,
    startDragging,
  } = useRange({
    min,
    max,
  });

  const minPrice = getPrice(minValue);
  const maxPrice = getPrice(maxValue);
  const minPercent = valueToPercent(minValue, min, max);
  const maxPercent = valueToPercent(maxValue, min, max);

  return (
    <div
      role="group"
      aria-label="Rango de precios"
      className="grid w-full max-w-md grid-cols-[5rem_1fr_5rem] items-center gap-3 select-none"
    >
      <div className="justify-self-end">
        <RangeLabel
          label="Precio mínimo"
          value={minPrice}
          onValueChange={
            isEditable ? (value) => setValue("min", value) : undefined
          }
        />
      </div>

      <div ref={trackRef} className="relative flex h-6 items-center">
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
          onPointerDown={() => startDragging("min")}
        />

        <RangeHandle
          label="Precio máximo"
          value={maxValue}
          min={minValue + 1}
          max={max}
          valueText={formatCurrency(maxPrice)}
          percent={maxPercent}
          isDragging={activeHandle === "max"}
          onPointerDown={() => startDragging("max")}
        />
      </div>

      <div className="justify-self-start">
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
