import { useEditableLabel } from "./hooks/use-editable-label";
import { formatCurrency } from "./utils/range.utils";

type EditableLabelProps = {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
};

export function EditableLabel({
  label,
  value,
  onValueChange,
}: EditableLabelProps) {
  const { isEditing, startEditing, buttonRef, inputProps } = useEditableLabel({
    value,
    onValueChange,
  });
  const text = formatCurrency(value);

  if (isEditing) {
    return (
      <input
        type="number"
        inputMode="numeric"
        step={1}
        aria-label={label}
        autoFocus
        {...inputProps}
        className="w-20 rounded border border-border bg-surface px-1 text-sm tabular-nums"
      />
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={`Editar ${label.toLowerCase()}: ${text}`}
      onClick={startEditing}
      className="cursor-pointer rounded px-1 text-sm tabular-nums hover:underline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {text}
    </button>
  );
}
