import { EditableLabel } from "./editable-label";
import { formatCurrency } from "./utils/range.utils";

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
