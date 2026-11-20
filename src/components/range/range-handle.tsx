import type { HTMLAttributes, KeyboardEvent } from "react";

type PointerHandlers = Pick<
  HTMLAttributes<HTMLDivElement>,
  | "onPointerDown"
  | "onPointerMove"
  | "onPointerUp"
  | "onPointerCancel"
  | "onLostPointerCapture"
>;

type RangeHandleProps = PointerHandlers & {
  label: string;
  value: number;
  min: number;
  max: number;
  valueText: string;
  percent: number;
  isDragging: boolean;
  isOnTop: boolean;
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
  isOnTop,
  onKeyDown,
  ...pointerHandlers
}: RangeHandleProps) {
  const stateClasses = isDragging
    ? "scale-125 cursor-grabbing"
    : "cursor-grab hover:scale-125";
  const layerClass = isOnTop ? "z-10" : "z-0";

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
      onKeyDown={onKeyDown}
      {...pointerHandlers}
      // El punto mide 16px, pero el pseudo-elemento amplía la zona táctil a 44px.
      className={`absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full bg-accent ring-2 ring-surface transition-transform before:absolute before:-inset-3.5 before:rounded-full before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${layerClass} ${stateClasses}`}
    />
  );
}
