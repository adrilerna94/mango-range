import type { KeyboardEvent, PointerEvent } from "react";

type RangeHandleProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  valueText: string;
  percent: number;
  isDragging: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

export function RangeHandle({
  label,
  value,
  min,
  max,
  valueText,
  percent,
  isDragging,
  onPointerDown,
  onKeyDown,
}: RangeHandleProps) {
  const stateClasses = isDragging
    ? "scale-125 cursor-grabbing"
    : "cursor-grab hover:scale-125";

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      style={{ left: `${percent}%` }}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full bg-accent ring-2 ring-surface transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${stateClasses}`}
    />
  );
}
