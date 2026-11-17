import { useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { parseLabelValue } from "../utils/range.utils";

type UseEditableLabelOptions = {
  value: number;
  onValueChange: (value: number) => void;
};

export function useEditableLabel({
  value,
  onValueChange,
}: UseEditableLabelOptions) {
  const [isEditing, setIsEditing] = useState(false);
  const cancelledRef = useRef(false);

  function startEditing() {
    cancelledRef.current = false;
    setIsEditing(true);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    const newValue = parseLabelValue(event.currentTarget.value);

    if (!cancelledRef.current && newValue !== null && newValue !== value) {
      onValueChange(newValue);
    }

    setIsEditing(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" && event.key !== "Escape") return;

    cancelledRef.current = event.key === "Escape";
    event.currentTarget.blur();
  }

  return {
    isEditing,
    startEditing,
    inputProps: {
      defaultValue: value,
      onFocus: (event: FocusEvent<HTMLInputElement>) =>
        event.currentTarget.select(),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
    },
  };
}
