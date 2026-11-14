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

export type RangeProps = NormalRangeProps;

export function Range({ min, max }: RangeProps) {
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
          value={minValue}
          onValueChange={(value) => setValue("min", value)}
        />
      </div>

      <div ref={trackRef} className="relative flex h-6 items-center">
        <div className="h-0.5 w-full bg-black" />

        <RangeHandle
          label="Precio mínimo"
          value={minValue}
          min={min}
          max={maxValue - 1}
          valueText={formatCurrency(minValue)}
          percent={minPercent}
          isDragging={activeHandle === "min"}
          onPointerDown={() => startDragging("min")}
        />

        <RangeHandle
          label="Precio máximo"
          value={maxValue}
          min={minValue + 1}
          max={max}
          valueText={formatCurrency(maxValue)}
          percent={maxPercent}
          isDragging={activeHandle === "max"}
          onPointerDown={() => startDragging("max")}
        />
      </div>

      <div className="justify-self-start">
        <RangeLabel
          label="Precio máximo"
          value={maxValue}
          onValueChange={(value) => setValue("max", value)}
        />
      </div>
    </div>
  );
}
