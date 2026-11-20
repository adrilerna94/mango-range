import { useEditableLabel } from "./hooks/use-editable-label";
import type { EditableLabelProps } from "./types/range.types";
import { formatCurrency } from "./utils/range.utils";

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

  // Los dos estados miden lo mismo (w-20 h-6) para que no haya saltos de
  // layout al empezar o terminar la edición.
  if (isEditing) {
    return (
      <span className="inline-flex h-6 w-20 items-center gap-1 rounded-md border border-accent bg-surface px-2 text-sm tabular-nums focus-within:outline-2 focus-within:outline-accent">
        <input
          type="number"
          inputMode="numeric"
          step={1}
          aria-label={label}
          autoFocus
          {...inputProps}
          // Sin las flechas nativas de type="number", que no encajan en la etiqueta.
          className="w-full min-w-0 [appearance:textfield] bg-transparent text-right outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span aria-hidden="true">€</span>
      </span>
    );
  }

  // Aspecto de campo siempre visible: también en táctil, donde no hay hover.
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={`Editar ${label.toLowerCase()}: ${text}`}
      onClick={startEditing}
      className="h-6 w-20 cursor-pointer rounded-md border border-border bg-surface px-2 text-sm tabular-nums transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
    >
      {text}
    </button>
  );
}
