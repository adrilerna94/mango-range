import { EditableLabel } from "./editable-label";
import type { RangeLabelProps } from "./types/range.types";
import { formatCurrency } from "./utils/range.utils";

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
