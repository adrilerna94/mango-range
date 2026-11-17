import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cancelledRef = useRef(false);
  const restoreFocusRef = useRef(false);

  // Al cerrar con Enter o Escape el input desaparece: devolvemos el foco al
  // botón para que el usuario de teclado no lo pierda.
  useEffect(() => {
    if (isEditing || !restoreFocusRef.current) return;

    restoreFocusRef.current = false;
    buttonRef.current?.focus();
  }, [isEditing]);

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

    // Sin esto, el Enter que confirma "activaría" el botón que recibe el foco
    // y volvería a abrir la edición.
    event.preventDefault();
    cancelledRef.current = event.key === "Escape";
    restoreFocusRef.current = true;
    event.currentTarget.blur();
  }

  return {
    isEditing,
    startEditing,
    buttonRef,
    inputProps: {
      defaultValue: value,
      onFocus: (event: FocusEvent<HTMLInputElement>) =>
        event.currentTarget.select(),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
    },
  };
}
