import { useState, type FocusEvent, type KeyboardEvent } from "react";
import { formatCurrency } from "./range.utils";

type RangeLabelProps = {
  label: string;
  value: number;
  onValueChange?: (value: number) => void;
};

export function RangeLabel({ label, value, onValueChange }: RangeLabelProps) {
  if (!onValueChange) {
    return (
      <span className="text-sm tabular-nums">{formatCurrency(value)}</span>
    );
  }

  return (
    <EditableLabel label={label} value={value} onValueChange={onValueChange} />
  );
}

type EditableLabelProps = {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
};

function EditableLabel({ label, value, onValueChange }: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const text = formatCurrency(value);

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const input = event.currentTarget.value;
    const newValue = Number(input);
    const isValid = input !== "" && Number.isFinite(newValue);

    if (isValid && newValue !== value) {
      onValueChange(newValue);
    }

    setIsEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }

    if (event.key === "Escape") {
      event.currentTarget.value = String(value);
      event.currentTarget.blur();
    }
  }

  if (isEditing) {
    return (
      <input
        type="number"
        inputMode="decimal"
        step="any"
        aria-label={label}
        defaultValue={value}
        autoFocus
        onFocus={(event) => event.currentTarget.select()}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-20 rounded border border-black px-1 text-sm tabular-nums"
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`Editar ${label.toLowerCase()}: ${text}`}
      onClick={() => setIsEditing(true)}
      className="cursor-pointer rounded px-1 text-sm tabular-nums hover:underline focus-visible:outline-2 focus-visible:outline-black"
    >
      {text}
    </button>
  );
}
